package pe.gob.onpe.scebackend.scheduler;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import pe.gob.onpe.scebackend.model.enums.EstadoRecepcionJneEnum;
import pe.gob.onpe.scebackend.model.orc.entities.JneTransmisionRecepcion;
import pe.gob.onpe.scebackend.model.orc.repository.JneTransmisionRecepcionRepository;
import pe.gob.onpe.scebackend.model.service.JneRecepcionService;
import pe.gob.onpe.scebackend.utils.SceConstantes;

@Component
@Slf4j
@RequiredArgsConstructor
public class JneRecepcionScheduler {

    private final JneTransmisionRecepcionRepository repository;
    private final JneRecepcionService jneRecepcionService;

    @Scheduled(fixedDelayString = "${job.recepcion.delay}", initialDelayString = "${job.recepcion.initial-delay}")
    public void reenviarRecepcionesPendientes() {
        log.info("[Scheduler ORC] Buscando tramas pendientes de envío...");

        List<JneTransmisionRecepcion> pendientes = repository.findTop50Pendientes(
                List.of(EstadoRecepcionJneEnum.PENDIENTE.getCodigo(), EstadoRecepcionJneEnum.ERROR.getCodigo()),
                Short.valueOf(SceConstantes.ACTIVO.toString()),
                Short.valueOf(SceConstantes.MAX_INTENTOS_JNE.toString()), PageRequest.of(0, 10));

        if (pendientes.isEmpty()) {
            log.info("[Scheduler ORC] No hay tramas pendientes");
            return;
        }

        log.info("[Scheduler ORC] {} tramas encontradas para reenvío", pendientes.size());

        for (JneTransmisionRecepcion registro : pendientes) {
            try {
                log.info("[Scheduler ORC] Reintentando envío id={}", registro.getId());

                jneRecepcionService.enviarRecepcionOrc(registro);
            } catch (Exception e) {
                log.error("[Scheduler ORC] Error reenviando registro {}", registro.getId(), e);
            }
        }
    }
}
