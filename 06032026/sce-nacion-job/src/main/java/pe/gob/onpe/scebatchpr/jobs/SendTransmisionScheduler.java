package pe.gob.onpe.scebatchpr.jobs;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;


import pe.gob.onpe.scebatchpr.service.ConfiguracionProcesoElectoralService;
import pe.gob.onpe.scebatchpr.service.TransmisionMqService;
import pe.gob.onpe.scebatchpr.utils.Constantes;
import pe.gob.onpe.scebatchpr.entities.admin.ConfiguracionProcesoElectoral;

@Component
public class SendTransmisionScheduler {

	private static final Logger LOG = LoggerFactory.getLogger(SendTransmisionScheduler.class);

	private TransmisionMqService transmisionMqService;
	
	@Value("${app.sce-batch-pr.transmision.method.mq}")
	private boolean envioMq;

	@Value("${app.sce-batch-pr.multi-proceso}")
    private Boolean esMultiProceso;
	
	@Value("${spring.jpa.properties.hibernate.default_schema}")
    private String esquema;
	
	@Autowired
	private ConfiguracionProcesoElectoralService procesoElectoralService;
	
	public SendTransmisionScheduler(
		TransmisionMqService transmisionMqService
			){
		this.transmisionMqService = transmisionMqService;
	}

	/**
	 * <p>
	 * miniute, hour, day(month), month, day(week)
	 * </p>
	 */
	@Scheduled(cron = "${cron.expression}")
	public void scheduleTaskWithCronExpression() {
		LOG.info("Method executed. Current time is = {}", new Date());
		try { 
			
			ConfiguracionProcesoElectoral proceso = this.procesoElectoralService.findByEsquema(esquema);
			
			if(proceso==null){
				LOG.info("No hay un esquema con el nombre {} que este configurado en el admin, se ignora la transmision", esquema);
				return;
			}
			
			if(proceso.getEtapa()!=null && proceso.getEtapa().equals(Constantes.ETAPA_SIN_CARGA)){
				LOG.info("En el esquema {} aun no se ha hecho la carga, se ignora la transmision", proceso.getNombreEsquemaPrincipal());
				return;
			}
			
			if(envioMq) {
				LOG.info("Se realiza el envio por MQ");
				this.transmisionMqService.enviarTramaSce("proceso definido en el esquema");
				this.transmisionMqService.enviarArchivos("proceso definido en el esquema");
			}
		} catch (InterruptedException e) {
			LOG.error("Error: ", e);
		} catch (Exception e) {
			LOG.error("Error: ", e);
		}

		
	}
	
}
