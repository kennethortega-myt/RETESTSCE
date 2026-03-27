from psycopg_pool import ConnectionPool
from contextlib import contextmanager
import psycopg
import config
from logger_config import logger

DB_CONNECT_TIMEOUT_SEC  = 30
DB_STATEMENT_TIMEOUT_MS = 100000
DB_POOL_WAIT_TIMEOUT_SEC = 45

def _get_connection_string():
    return (
        f"host={config.POSTGRE_HOST} "
        f"port={config.POSTGRE_PORT} "
        f"dbname={config.POSTGRE_DATABASE} "
        f"user={config.POSTGRE_USER} "
        f"password={config.POSTGRE_PASSWORD} "
        f"connect_timeout={DB_CONNECT_TIMEOUT_SEC} "
        f"options='-c statement_timeout={DB_STATEMENT_TIMEOUT_MS}'"
    )

def _configure_connection(conn):
    conn.execute(f"SET search_path TO {config.POSTGRE_DEFAULT_SCHEMA}")
    conn.commit()


db_pool = ConnectionPool(
    conninfo=_get_connection_string(),
    min_size=5,
    max_size=50,
    max_waiting=20,
    max_lifetime=3600,
    max_idle=600,
    reconnect_timeout=DB_CONNECT_TIMEOUT_SEC,   # timeout para reconectar zombis
    configure=_configure_connection, # ejecuta SET search_path en cada conexión nueva
    open=True, # abre las conexiones min_size al arrancar
)


@contextmanager
def get_cursor(log_queue="default", with_conn=False):
    """
    Obtiene una conexión del pool con validación automática.
    psycopg_pool hace ping real antes de entregar — no hay zombis.
    """
    conn = None
    cur  = None
    try:
        # check=True valida la conexión con un ping real antes de entregarla
        # timeout si el pool está agotado, espera este tiempo antes de lanzar error
        with db_pool.connection(timeout=DB_POOL_WAIT_TIMEOUT_SEC) as conn:
            cur = conn.cursor()
            if with_conn:
                yield cur, conn
            else:
                yield cur
            # commit automático al salir del with si no hubo excepción

    except psycopg.OperationalError as e:
        logger.exception(f"DB conexión perdida: {e}", queue=log_queue)
        raise
    except psycopg.errors.QueryCanceled as e:
        logger.exception(f"DB query cancelada por timeout: {e}", queue=log_queue)
        raise
    except Exception as e:
        logger.exception(f"DB Error: {e}", queue=log_queue)
        raise
    finally:
        if cur and not cur.closed:
            cur.close()
