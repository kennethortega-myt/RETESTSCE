package pe.gob.onpe.scebatchpr.jobs;

import java.util.concurrent.atomic.AtomicBoolean;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import pe.gob.onpe.scebatchpr.service.FirmaDocumentoInstalacionSufragioService;
import pe.gob.onpe.scebatchpr.utils.FechaUtils;

@Component
public class FirmaDocumentoInstalacionSugrafioScheduler {

	Logger logger = LogManager.getLogger(FirmaDocumentoInstalacionSugrafioScheduler.class);
	
	private final AtomicBoolean isRunning = new AtomicBoolean(false);
	
	private final FirmaDocumentoInstalacionSufragioService firmaDocumentoInstalacionSufragioService;
	
	@Value("${app.ext.firmadoc.activado}")
	private boolean sendFirmados;
	
	public FirmaDocumentoInstalacionSugrafioScheduler(
			FirmaDocumentoInstalacionSufragioService firmaDocumentoInstalacionSufragioService) {
		this.firmaDocumentoInstalacionSufragioService = firmaDocumentoInstalacionSufragioService;
	}
	

	@Scheduled(cron = "${cron.firmar-documento-instalacion-sufragio}")
	public void scheduleFirmarDocumentoInstalacionSugrafio() {
		
		logger.info("Se ejecuto el job de firma documento de instalacion sufragio {}", FechaUtils.getFechaActualPeruana());
		
		if (!isRunning.compareAndSet(false, true)) {
            logger.info("El job para firmar un documento de instalacion sufragio aún se está ejecutando. Se omite esta ejecución.");
            return;
        }
		
		try {
			if(this.sendFirmados){
				this.firmaDocumentoInstalacionSufragioService.firmarDocumentos();
			} else {
				logger.info("La funcionalidad para firmar un documento de instalacion sufragio no esta activado");
			}
		} catch (Exception e) {
            logger.error("Se generó un error en la ejecución del job para firmar documento de instalacion sufragio", e);
        } finally {
            isRunning.set(false);
        }
		
		
	}
	
}
