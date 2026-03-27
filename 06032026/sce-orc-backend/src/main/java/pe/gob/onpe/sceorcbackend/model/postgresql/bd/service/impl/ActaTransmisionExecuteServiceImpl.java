package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import pe.gob.onpe.sceorcbackend.model.dto.queue.TransmisionQueue;
import pe.gob.onpe.sceorcbackend.model.enums.TransmisionNacionEnum;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ActaTransmisionExecuteService;
import pe.gob.onpe.sceorcbackend.model.queue.RabbitMqSender;

@Service
public class ActaTransmisionExecuteServiceImpl implements ActaTransmisionExecuteService {

	@Value("${app.orc.transmision.mq}")
    private boolean habilitarKafka;
	
	@Autowired
	private RabbitMqSender rabbitMqSender;
	
	
	@Override
	public void sincronizar(Long idActa, String proceso, TransmisionNacionEnum estadoEnum, String usuario) {
		if(!habilitarKafka) {
			this.rabbitMqSender.sendProcessTransmision(
					TransmisionQueue.builder()
					.idActa(idActa)
					.estadoEnum(estadoEnum)
					.usuario(usuario)
					.proceso(proceso)
					.build()
					);
		}
	}
	
	@Override
	public void sincronizar(List<Long> idActas, String proceso, TransmisionNacionEnum estadoEnum, String usuario) {
		if(!habilitarKafka) {
			for(Long idActa:idActas){
				this.rabbitMqSender.sendProcessTransmision(
						TransmisionQueue.builder()
						.idActa(idActa)
						.estadoEnum(estadoEnum)
						.usuario(usuario)
						.proceso(proceso)
						.build()
						);
			}
		}
	}


}
