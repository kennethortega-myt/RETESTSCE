package pe.gob.onpe.scebatchpr.jobs;


import java.util.concurrent.atomic.AtomicBoolean;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pe.gob.onpe.scebatchpr.service.FirmaDocumentoEscrutinioService;
import pe.gob.onpe.scebatchpr.utils.FechaUtils;


@Component
public class FirmaDocumentoEscrutinioScheduler {

	Logger logger = LogManager.getLogger(FirmaDocumentoEscrutinioScheduler.class);
	
	private final AtomicBoolean isRunning = new AtomicBoolean(false);
	
	private final FirmaDocumentoEscrutinioService firmaDocumentoEscrutinioService;
	
	@Value("${app.ext.firmadoc.activado}")
	private boolean sendFirmados;
	
	public FirmaDocumentoEscrutinioScheduler(
			FirmaDocumentoEscrutinioService firmaDocumentoEscrutinioService) {
		this.firmaDocumentoEscrutinioService = firmaDocumentoEscrutinioService;
	}
	

	@Scheduled(cron = "${cron.firmar-documento-escrutinio}")
	public void scheduleFirmarDocumentoEscrutinio() {
		
		logger.info("Se ejecuto el job de firma documento de escrutinio {}", FechaUtils.getFechaActualPeruana());
		
		if (!isRunning.compareAndSet(false, true)) {
            logger.info("El job para firmar un documento de escrutinio aún se está ejecutando. Se omite esta ejecución.");
            return;
        }
		
		try {
			if(this.sendFirmados){
				this.firmaDocumentoEscrutinioService.firmarDocumentos();
			} else {
				logger.info("La funcionalidad para firmar un documento de escrutinio no esta activado");
			}
		} catch (Exception e) {
            logger.error("Se generó un error en la ejecución del job para firmar documento de escrutinio", e);
        } finally {
            isRunning.set(false);
        }
		
		
	}
	
	
}
