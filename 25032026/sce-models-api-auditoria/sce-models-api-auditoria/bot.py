import sys
import signal
import pika
import config
import json
from pathlib import Path
from datetime import datetime
from modules import digitization, control
import time
import threading
from db.progress import update_det_parametro_by_nombre, get_det_parametro_valor
from collections import defaultdict
from util import constantes
import traceback
from logger_config import logger
import shutil
import os
import psutil
from logger_config import set_worker_context
from db.model_integrity import new_verify_model_weights
from models.binarymodel.valid_trazo_classification import MOBILENETV3_PATH, SPINALVGG_PATH
from models.mnistmodel.model import MODEL_PATH
from models.detectormodel.new_evaluate_image import RFDET_PATH

logger.info(
    f"Configuración cargada: "
    f"API_URL_CENTRO_COMPUTO={config.API_URL_CENTRO_COMPUTO}, "
    f"RABBITMQ_HOST={config.RABBITMQ_HOST}, "
    f"RABBITMQ_PORT={config.RABBITMQ_PORT}, "
    f"POSTGRE_HOST={config.POSTGRE_HOST}, "
    f"POSTGRE_DATABASE={config.POSTGRE_DATABASE}, "
    f"POSTGRE_PORT={config.POSTGRE_PORT}, "
    f"POSTGRE_DEFAULT_SCHEMA={config.POSTGRE_DEFAULT_SCHEMA}, "
    f"IMAGES_DIR={config.IMAGES_DIR}, "
    f"WORKERS_PROCESS={config.PROCESS_WORKERS_NUM}"
)

_warmup_done      = False
_warmup_done_lock = threading.Lock()

AMQD = "amq.direct"
SYSTEM_STATUS = {"is_active": None}
PARAM_NAME = "p_cola_modelo_procesamiento"
SYSTEM_USER = "sce_admin"

PROJECT_ROOT = Path(__file__).resolve().parent
WORK_ROOT = PROJECT_ROOT / "SCE_WORKSPACES"
WORK_ROOT.mkdir(exist_ok=True)

DLQ_DRAIN_INTERVAL = 2

PROCESS_WORKERS_NUM = config.PROCESS_WORKERS_NUM

QUEUE_WORKERS = {
    "sce-queue-new-acta":                1,
    "sce-queue-new-acta-celeste":        1,
    "sce-queue-process-acta":            PROCESS_WORKERS_NUM,
    "sce-queue-process-acta-stae":       1,
    "sce-queue-process-lista-electores": 1,
    "sce-queue-process-miembros_mesa":   1,
}

QUEUES = list(QUEUE_WORKERS.keys())

_shutdown = threading.Event()
_active_connections: dict[str, pika.BlockingConnection] = {}
_active_connections_lock = threading.Lock()

def log_system_resources() -> None:
    try:
        proc = psutil.Process(os.getpid())
        mem_rss = proc.memory_info().rss / 1024 / 1024
        mem_pct = proc.memory_percent()
        cpu_pct = proc.cpu_percent(interval=1) / psutil.cpu_count()
        threads = proc.num_threads()
        ram_libre = psutil.virtual_memory().available / 1024 / 1024
        logger.info(
            f"[RESOURCES] "
            f"RAM={mem_rss:.1f}MB ({mem_pct:.1f}%) | "
            f"CPU={cpu_pct:.1f}% | "
            f"Threads={threads} | "
            f"RAM libre={ram_libre:.0f}MB"
        )
    except Exception:
        logger.exception("[RESOURCES] Error leyendo métricas del proceso")

def _register_connection(conn_key: str, connection: pika.BlockingConnection):
    with _active_connections_lock:
        _active_connections[conn_key] = connection

def _unregister_connection(conn_key: str):
    with _active_connections_lock:
        _active_connections.pop(conn_key, None)

def shutdown():
    if _shutdown.is_set():
        return
    logger.info("[SHUTDOWN] Señal recibida — cerrando workers...")
    _shutdown.set()
    with _active_connections_lock:
        connections_snapshot = dict(_active_connections)
    for conn_key, conn in connections_snapshot.items():
        try:
            if not conn.is_closed:
                conn.close()
                logger.info(f"[SHUTDOWN] Conexión cerrada para {conn_key}")
        except Exception:
            pass

def _signal_handler(sig, frame):
    shutdown()

class QueueStateManager:
    def __init__(self, queue_names):
        self.lock = threading.Lock()
        self.processing_count = defaultdict(int)
        self.queue_names = queue_names

    def start_processing(self, queue_name):
        with self.lock:
            self.processing_count[queue_name] += 1

    def finish_processing(self, queue_name):
        with self.lock:
            self.processing_count[queue_name] -= 1

    def total_processing(self):
        with self.lock:
            return sum(self.processing_count.values())

    def get_processing_snapshot(self):
        with self.lock:
            return dict(self.processing_count)

queue_state = QueueStateManager(QUEUES)

def build_connection_params():
    return pika.ConnectionParameters(
        host=config.RABBITMQ_HOST,
        port=config.RABBITMQ_PORT,
        credentials=pika.PlainCredentials(
            username=config.RABBITMQ_USER,
            password=config.RABBITMQ_PASSWORD,
        ),
        connection_attempts=10,
        retry_delay=2,
        blocked_connection_timeout=30,
        heartbeat=600,
    )

def create_channel(queue_name: str) -> tuple:
    connection = pika.BlockingConnection(build_connection_params())
    channel = connection.channel()
    channel.queue_declare(queue=queue_name, durable=True)
    channel.queue_bind(exchange=AMQD, queue=queue_name, routing_key=f"{queue_name}-rt")
    dlq = f"{queue_name}-dlq"
    channel.queue_declare(queue=dlq, durable=True)
    channel.queue_bind(exchange=AMQD, queue=dlq, routing_key=f"{dlq}-rt")
    channel.basic_qos(prefetch_count=1)
    return connection, channel


def handle_error(ch, properties, body, queue_name):
    tb = traceback.format_exc()
    existing_headers = dict(properties.headers or {})
    existing_headers["x-error-traceback"] = tb[:4000]  # RabbitMQ limita tamaño de headers
    ch.basic_publish(
        exchange=AMQD,
        routing_key=f"{queue_name}-dlq-rt",
        body=json.dumps(body).encode("utf-8"),
        properties=pika.BasicProperties(
            delivery_mode=2,
            headers=existing_headers,
        ),
    )

def _dispatch(ch, method, properties, body_bytes, queue_name, process_fn, log_queue):
    queue_state.start_processing(queue_name)
    body = json.loads(body_bytes)
    try:
        logger.info(f"[START] Mensaje recibido en {queue_name}", queue=log_queue)
        logger.info(f"[BODY] {body}", queue=log_queue)
        process_fn(body)
        # Flujo optimo
        ch.basic_ack(delivery_tag=method.delivery_tag)
        logger.info(f"[ACK] tag={method.delivery_tag}", queue=log_queue)
    except Exception:
        # Flujo falló - intentar enviar a DLQ
        logger.exception(
            f"[ERROR] Fallo procesando mensaje | queue={queue_name} | body={body}",
            queue="default"
        )
        try:
            handle_error(ch, properties, body, queue_name)
            ch.basic_ack(delivery_tag=method.delivery_tag)
            logger.info(f"[ACK→DLQ] tag={method.delivery_tag}", queue=log_queue)
        except Exception:
            # Error critico DLQ tambien fallo (canal roto, rabbit caido)
            logger.exception(
                f"[NACK] handle_error falló — descartando mensaje sin DLQ | "
                f"queue={queue_name} | body={body}",
                queue="default"
            )
            try:
                # El mensaje se descarta pero el traceback queda en el log
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            except Exception:
                # Canal completamente muerto.
                # Al cerrar la conexión RabbitMQ re-encola el mensaje automáticamente.
                logger.exception(
                    f"[NACK-FAILED] Canal muerto, RabbitMQ re-encolará | queue={queue_name}",
                    queue="default"
                )
    finally:
        # Finalmente solo cuenta el procesamiento de las colas
        queue_state.finish_processing(queue_name)

def _create_workspace(acta_id) -> Path:
    """
    Crea y retorna un directorio único para el procesamiento del mensaje.
    Unicidad garantizada por actaId + timestamp con microsegundos.
    """
    now         = datetime.now()
    folder_name = f"{acta_id}_{now.strftime('%Y_%m_%d')}_{now.strftime('%H_%M_%S_%f')}"
    workspace   = WORK_ROOT / folder_name
    workspace.mkdir(parents=True, exist_ok=True)
    return workspace

def _delete_workspace(workspace: Path) -> None:
    """Elimina el workspace al finalizar el procesamiento (éxito o fallo)."""
    try:
        if workspace and workspace.exists():
            shutil.rmtree(workspace)
            logger.info(
                f"[WORKSPACE] Eliminado {workspace}",queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
    except Exception:
        logger.exception(f"[WORKSPACE] Error eliminando {workspace}",queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)

def handle_new_acta(ch, method, properties, body_bytes):
    def process(body):
        digitization.validate_mesa(
            body["actaId"], body["fileId"], body["type"],
            body["usuario"], body["codigocc"], body["abrevProceso"],
        )
        logger.info("[SUCCESS] validate_mesa OK", queue=constantes.QUEUE_LOGGER_VALUE_VALIDATE)

    _dispatch(
        ch, method, properties, body_bytes,
        queue_name="sce-queue-new-acta",
        process_fn=process,
        log_queue=constantes.QUEUE_LOGGER_VALUE_VALIDATE,
    )


def handle_new_acta_celeste(ch, method, properties, body_bytes):
    def process(body):
        digitization.validate_acta_celeste(
            body["actaId"], body["fileId"], body["type"],
            body["usuario"], body["codigocc"], body["abrevProceso"],
        )
        logger.info("[SUCCESS] validate_mesa_celeste OK", queue=constantes.QUEUE_LOGGER_VALUE_VALIDATE)

    _dispatch(
        ch, method, properties, body_bytes,
        queue_name="sce-queue-new-acta-celeste",
        process_fn=process,
        log_queue=constantes.QUEUE_LOGGER_VALUE_VALIDATE,
    )


def handle_process_acta(ch, method, properties, body_bytes):
    body = json.loads(body_bytes)
    workspace = _create_workspace(body["actaId"])
    def process(body):
        logger.info(f"[WORKSPACE] {workspace}", queue=constantes.QUEUE_LOGGER_VALUE_PROCESS)
        control.process_acta(
            body["actaId"],
            body["fileId1"],
            body["fileId2"],
            body["codUsuario"],
            body["codCentroComputo"],
            workspace=str(workspace),
        )
        logger.info(
            f"[SUCCESS] Procesamiento OK | workspace={workspace}",
            queue=constantes.QUEUE_LOGGER_VALUE_PROCESS
        )
    try:
        _dispatch(
            ch, method, properties, body_bytes,
            queue_name="sce-queue-process-acta",
            process_fn=process,
            log_queue=constantes.QUEUE_LOGGER_VALUE_PROCESS,
        )
    finally:
        _delete_workspace(workspace)


def handle_process_acta_stae(ch, method, properties, body_bytes):
    def process(body):
        control.process_acta_stae_vd(
            body["actaId"], body["codUsuario"], body["codCentroComputo"],
        )
        logger.info("[SUCCESS] Stae OK", queue=constantes.QUEUE_LOGGER_VALUE_STAE)

    _dispatch(
        ch, method, properties, body_bytes,
        queue_name="sce-queue-process-acta-stae",
        process_fn=process,
        log_queue=constantes.QUEUE_LOGGER_VALUE_STAE,
    )


def handle_process_lista_electores(ch, method, properties, body_bytes):
    def process(body):
        control.process_lista_electores(
            body["mesaId"], body["abrevDocumento"],
            body["codUsuario"], body["codCentroComputo"],
        )
        logger.info("[SUCCESS] Lista de electores OK", queue=constantes.QUEUE_LOGGER_VALUE_LISTA_ELECTORES)

    _dispatch(
        ch, method, properties, body_bytes,
        queue_name="sce-queue-process-lista-electores",
        process_fn=process,
        log_queue=constantes.QUEUE_LOGGER_VALUE_LISTA_ELECTORES,
    )


def handle_process_miembros_mesa(ch, method, properties, body_bytes):
    def process(body):
        control.process_miembros_mesa(
            body["mesaId"], body["abrevDocumento"],
            body["codUsuario"], body["codCentroComputo"],
        )
        logger.info("[SUCCESS] Miembros de mesa OK", queue=constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA)

    _dispatch(
        ch, method, properties, body_bytes,
        queue_name="sce-queue-process-miembros_mesa",
        process_fn=process,
        log_queue=constantes.QUEUE_LOGGER_VALUE_MIEMBROS_MESA,
    )


QUEUE_HANDLERS = {
    "sce-queue-new-acta":                handle_new_acta,
    "sce-queue-new-acta-celeste":        handle_new_acta_celeste,
    "sce-queue-process-acta":            handle_process_acta,
    "sce-queue-process-acta-stae":       handle_process_acta_stae,
    "sce-queue-process-lista-electores": handle_process_lista_electores,
    "sce-queue-process-miembros_mesa":   handle_process_miembros_mesa,
}

def handle_dlq_message(channel, method, properties, body_bytes):
    dlq_name = f"{method.routing_key.replace('-dlq-rt', '')}-dlq"
    origin   = dlq_name.replace("-dlq", "")
    try:
        body = json.loads(body_bytes)
    except Exception:
        body = body_bytes.decode("utf-8", errors="replace")
    headers = properties.headers or {}
    tb      = headers.get("x-error-traceback", "traceback no disponible")
    logger.info(
        f"[DLQ] Mensaje fallido descartado | dlq={dlq_name} | origin={origin} | body={body}\n"
        f"[DLQ] Traceback original:\n{tb}",
        queue="default"
    )
    if not _shutdown.is_set():
        time.sleep(DLQ_DRAIN_INTERVAL)
    channel.basic_ack(delivery_tag=method.delivery_tag)


def _dlq_idle_wait(poll_interval: int) -> None:
    """Espera poll_interval segundos en tramos cortos para reaccionar al shutdown."""
    for _ in range(poll_interval * 2):
        if _shutdown.is_set():
            return
        time.sleep(0.5)


def _dlq_drain_loop(channel, dlq_name: str, poll_interval: int) -> None:
    """Drena mensajes de la DLQ hasta shutdown o error de conexión."""
    while not _shutdown.is_set():
        method, properties, body = channel.basic_get(queue=dlq_name, auto_ack=False)
        if method is None:
            _dlq_idle_wait(poll_interval)
        else:
            handle_dlq_message(channel, method, properties, body)


def _dlq_close_connection(connection, dlq_name: str) -> None:
    """Cierra la conexión de forma segura."""
    _unregister_connection(f"dlq:{dlq_name}")
    if connection and not connection.is_closed:
        try:
            connection.close()
        except Exception:
            pass


def dlq_worker(origin_queue: str) -> None:
    """
    Worker dedicado a una DLQ. Usa basic_get (polling) para poder
    respetar el DLQ_DRAIN_INTERVAL entre mensajes y reaccionar al shutdown.
    """
    dlq_name      = f"{origin_queue}-dlq"
    poll_interval = 30
    while not _shutdown.is_set():
        connection = None
        try:
            connection = pika.BlockingConnection(build_connection_params())
            channel    = connection.channel()
            channel.queue_declare(queue=dlq_name, durable=True)
            _register_connection(f"dlq:{dlq_name}", connection)
            logger.info(f"[DLQ-WORKER] Conectado a {dlq_name}")
            _dlq_drain_loop(channel, dlq_name, poll_interval)
        except Exception as exc:
            if _shutdown.is_set():
                break
            logger.exception(f"[DLQ-WORKER] Error en {dlq_name}: {exc}. Reintentando en 10s...")
            time.sleep(10)
        finally:
            _dlq_close_connection(connection, dlq_name)
    logger.info(f"[DLQ-WORKER] {dlq_name} → terminado")

def _warmup_models() -> None:
    """
    Carga los modelos en memoria antes de empezar a consumir mensajes.
    Se ejecuta una sola vez.
    """
    global _warmup_done

    if _warmup_done:
        return
    
    with _warmup_done_lock:
        if _warmup_done:
            return

        try:
            logger.info("[WARMUP] Cargando modelos...", queue="default")
            from models.mnistmodel.model import load_model
            from models.detectormodel.new_evaluate_image import load_rfdetr_model
            from models.binarymodel.valid_trazo_classification import load_multiclass_model

            new_verify_model_weights(
                models=[
                    {"model_path": MODEL_PATH},
                    {"model_path": MOBILENETV3_PATH},
                    {"model_path": SPINALVGG_PATH},
                    {"model_path": RFDET_PATH},
                ],
                usuario=SYSTEM_USER,
                raise_on_error=True,
                log_queue="default"
            )
            load_model()
            load_rfdetr_model()
            load_multiclass_model()

            _warmup_done = True
            logger.info("[WARMUP] Modelos listos.", queue="default")

        except Exception:
            logger.exception("[WARMUP] Error cargando modelos", queue="default")
            raise

def queue_worker(queue_name: str, worker_index: int):
    handler  = QUEUE_HANDLERS[queue_name]
    conn_key = f"{queue_name}[{worker_index}]"
    if queue_name == "sce-queue-process-acta":
        _warmup_models()
    set_worker_context(worker_index)

    while not _shutdown.is_set():
        connection = None
        try:
            logger.info(f"[WORKER] Iniciando consumidor {conn_key}")
            connection, channel = create_channel(queue_name)
            _register_connection(conn_key, connection)
            channel.basic_consume(
                queue=queue_name,
                on_message_callback=handler,
                auto_ack=False,
            )
            logger.info(f"[WORKER] {conn_key} → esperando mensajes")
            channel.start_consuming()
        except Exception as exc:
            if _shutdown.is_set():
                break
            logger.exception(f"[WORKER] Error en {conn_key}: {exc}. Reintentando en 5s...")
            time.sleep(5)
        finally:
            _unregister_connection(conn_key)
            if connection and not connection.is_closed:
                try:
                    connection.close()
                except Exception:
                    pass

    logger.info(f"[WORKER] {conn_key} → terminado")

def get_total_enqueued_messages():
    total = 0
    try:
        connection = pika.BlockingConnection(build_connection_params())
        channel = connection.channel()
        for queue in QUEUES:
            q = channel.queue_declare(queue=queue, passive=True)
            total += q.method.message_count
        connection.close()
    except Exception as e:
        logger.exception(f"Error consultando colas: {e}")
    return total


def monitor_queues():
    check_interval_active = 10
    check_interval_idle   = 30
    current_interval      = check_interval_active
    while not _shutdown.is_set():
        for _ in range(current_interval * 2):
            if _shutdown.is_set():
                return
            time.sleep(0.5)
        total_processing = queue_state.total_processing()
        total_enqueued   = get_total_enqueued_messages()
        is_active_now    = total_processing > 0 or total_enqueued > 0
        if is_active_now:
            logger.info(f"Estado sistema => Procesando: {total_processing} | Encolados: {total_enqueued}")
            log_system_resources()
        if SYSTEM_STATUS["is_active"] != is_active_now:
            SYSTEM_STATUS["is_active"] = is_active_now
            if is_active_now:
                logger.info("Sistema pasó a estado ACTIVO")
                set_system_status(True)
                current_interval = check_interval_active
            else:
                logger.info("Sistema pasó a estado IDLE")
                set_system_status(False)
                current_interval = check_interval_idle


def set_system_status(is_active: bool):
    new_value     = "true" if is_active else "false"
    current_value = get_det_parametro_valor(PARAM_NAME)
    if current_value is None:
        logger.exception(f"No se pudo obtener valor actual de {PARAM_NAME}")
        return
    if current_value.lower() == new_value:
        logger.info(f"No se actualiza '{PARAM_NAME}' porque ya está en '{new_value}'")
        return
    logger.info(f"Actualizando '{PARAM_NAME}' de '{current_value}' a '{new_value}'")
    update_det_parametro_by_nombre(
        cod_usuario=SYSTEM_USER,
        c_nombre=PARAM_NAME,
        nuevo_valor=new_value,
        log_queue="default",
    )


def main():
    signal.signal(signal.SIGINT,  _signal_handler)
    signal.signal(signal.SIGTERM, _signal_handler)

    threading.Thread(target=monitor_queues, daemon=True, name="monitor").start()

    workers    = []
    total_main = 0

    # Workers principales — N por cola según QUEUE_WORKERS
    for queue_name, count in QUEUE_WORKERS.items():
        for i in range(count):
            t = threading.Thread(
                target=queue_worker,
                args=(queue_name, i),
                daemon=True,
                name=f"worker-{queue_name}-{i}",
            )
            t.start()
            workers.append(t)
            total_main += 1

    # Workers DLQ — siempre 1 por cola
    for queue_name in QUEUES:
        t = threading.Thread(
            target=dlq_worker,
            args=(queue_name,),
            daemon=True,
            name=f"dlq-worker-{queue_name}",
        )
        t.start()
        workers.append(t)

    logger.info(
        f"[MAIN] {total_main} workers principales + {len(QUEUES)} DLQ workers iniciados. "
        f"Para salir presiona CTRL+C"
    )
    logger.info(f"[MAIN] Distribución workers: { QUEUE_WORKERS }")

    while not _shutdown.is_set():
        time.sleep(0.5)

    logger.info("[MAIN] Esperando que los workers terminen...")
    for t in workers:
        t.join(timeout=15)

    logger.info("[MAIN] Proceso terminado limpiamente.")
    sys.exit(0)


if __name__ == "__main__":
    main()