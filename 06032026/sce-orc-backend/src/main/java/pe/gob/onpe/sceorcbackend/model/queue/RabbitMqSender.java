package pe.gob.onpe.sceorcbackend.model.queue;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import pe.gob.onpe.sceorcbackend.model.dto.queue.*;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;
import pe.gob.onpe.sceorcbackend.utils.ConstantsQueues;

@Service
@Slf4j
public class RabbitMqSender {

    Logger logger = LoggerFactory.getLogger(RabbitMqSender.class);

    private final RabbitTemplate rabbitTemplate;
    private final RabbitAdmin rabbitAdmin;

    public RabbitMqSender(RabbitTemplate rabbitTemplate, RabbitAdmin rabbitAdmin) {
        this.rabbitTemplate = rabbitTemplate;
        this.rabbitAdmin = rabbitAdmin;
    }

    public void sendNewActa(NewActa message) {
        rabbitTemplate.convertAndSend(ConstantsQueues.EXCHAGE_DIRECT, ConstantsQueues.ROUTING_KEY_NEW_ACTA, message);
    }

    public void sendNewActaCeleste(NewActa message) {
        rabbitTemplate.convertAndSend(ConstantsQueues.EXCHAGE_DIRECT, ConstantsQueues.ROUTING_KEY_NEW_ACTA_CELESTE, message);
    }

    public void sendProcessActa(ApprovedActa message) {
        rabbitTemplate.convertAndSend(ConstantsQueues.EXCHAGE_DIRECT, ConstantsQueues.ROUTING_KEY_PROCESS_ACTA, message);
    }

    public void sendProcessLeMm(ApprovedLeMm message) {
        if (message.getAbrevDocumento().equals(ConstantesComunes.ABREV_DOCUMENT_LISTA_ELECTORES))
            rabbitTemplate.convertAndSend(ConstantsQueues.EXCHAGE_DIRECT, ConstantsQueues.ROUTING_KEY_PROCESS_LISTA_ELECTORES, message);
        else if (message.getAbrevDocumento().equals(ConstantesComunes.ABREV_DOCUMENT_HOJA_DE_ASISTENCIA))
            rabbitTemplate.convertAndSend(ConstantsQueues.EXCHAGE_DIRECT, ConstantsQueues.ROUTING_KEY_PROCESS_MIEMBROS_MESA, message);
    }

    public void sendProcessActaStae(NewActaStae message) {
        rabbitTemplate.convertAndSend(ConstantsQueues.EXCHAGE_DIRECT, ConstantsQueues.ROUTING_KEY_PROCESS_ACTA_STAE, message);
    }
    
    public void sendProcessTransmision(TransmisionQueue message) {
        rabbitTemplate.convertAndSend(ConstantsQueues.EXCHAGE_DIRECT, ConstantsQueues.ROUTING_KEY_PROCESS_TRANSMISION, message);
    }
    
    public void sendProcessTransmisionSend(EnvioTransmisionQueue message) {
        rabbitTemplate.convertAndSend(ConstantsQueues.EXCHAGE_DIRECT, ConstantsQueues.ROUTING_KEY_PROCESS_TRANSMISION_SEND, message);
    }

    public void purgeAllQueues() {
        logger.info("Iniciando limpieza de todas las colas de RabbitMQ");

        // Limpiar colas principales
        purgeQueue(ConstantsQueues.NAME_QUEUE_NEW_ACTA);
        purgeQueue(ConstantsQueues.NAME_QUEUE_NEW_ACTA_CELESTE);
        purgeQueue(ConstantsQueues.NAME_QUEUE_PROCESS_ACTA);
        purgeQueue(ConstantsQueues.NAME_QUEUE_PROCESS_LISTA_ELECTORES);
        purgeQueue(ConstantsQueues.NAME_QUEUE_PROCESS_MIEBROS_MESA);
        purgeQueue(ConstantsQueues.NAME_QUEUE_PROCESS_ACTA_STAE);

        // Limpiar Dead Letter Queues (DLQ)
        purgeQueue(ConstantsQueues.NAME_QUEUE_NEW_ACTA + "-dlq");
        purgeQueue(ConstantsQueues.NAME_QUEUE_NEW_ACTA_CELESTE + "-dlq");
        purgeQueue(ConstantsQueues.NAME_QUEUE_PROCESS_ACTA + "-dlq");
        purgeQueue(ConstantsQueues.NAME_QUEUE_PROCESS_LISTA_ELECTORES + "-dlq");
        purgeQueue(ConstantsQueues.NAME_QUEUE_PROCESS_MIEBROS_MESA + "-dlq");
        purgeQueue(ConstantsQueues.NAME_QUEUE_PROCESS_ACTA_STAE + "-dlq");

        logger.info("Limpieza de colas completada");
    }

    private void purgeQueue(String queueName) {
        try {
            Integer messagesPurged = rabbitAdmin.purgeQueue(queueName);
            logger.info("Cola '{}' limpiada. Mensajes eliminados: {}", queueName, messagesPurged);
        } catch (Exception e) {
            logger.error("Error al limpiar la cola '{}': {}", queueName, e.getMessage(), e);
        }
    }
}