package pe.gob.onpe.scebackend.model.service.queue;

import java.util.List;
import java.util.stream.Collectors;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

import pe.gob.onpe.scebackend.model.dto.transmision.ActaTransmitidaDto;
import pe.gob.onpe.scebackend.model.dto.transmision.TransmisionDto;
import pe.gob.onpe.scebackend.model.dto.transmision.TransmisionNacionRequestDto;
import pe.gob.onpe.scebackend.model.dto.transmision.TransmisionResponseDto;
import pe.gob.onpe.scebackend.model.service.IConfiguracionProcesoElectoralService;
import pe.gob.onpe.scebackend.model.service.ITransmisionService;
import pe.gob.onpe.scebackend.multitenant.CurrentTenantId;
import pe.gob.onpe.scebackend.utils.SceConstantes;


@Service
public class TransmisionConsumerService {

	Logger logger = LoggerFactory.getLogger(TransmisionConsumerService.class);

	private final ITransmisionService transmisionService;
	private final IConfiguracionProcesoElectoralService confProcesoService;
	
	
	public TransmisionConsumerService(
			ITransmisionService transmisionService,
			IConfiguracionProcesoElectoralService confProcesoService) {
        this.transmisionService = transmisionService;
        this.confProcesoService = confProcesoService;
    }
	
	@KafkaListener(topics = "${kafka.topic.request}", groupId = "${spring.kafka.consumer.group-id}")
	@SendTo
	public String procesarMensaje(ConsumerRecord<String, String> record) throws JsonMappingException, JsonProcessingException {
		String solicitudString = record.value();
		TransmisionNacionRequestDto solicitud = TransmisionNacionRequestDto.getObject(solicitudString);
		String proceso = solicitud.getProceso();
		String esquema = this.confProcesoService.getEsquema(proceso);
		List<TransmisionDto> actasTransmitidas = solicitud.getActasTransmitidas();
		String respuestaString = null;
		TransmisionResponseDto respuesta = null;
		try {
			CurrentTenantId.set(solicitud.getProceso());
			this.transmisionService.recibirTransmision(actasTransmitidas, esquema);
			respuesta = new TransmisionResponseDto();
			respuesta.setActasTransmitidas(this.builResponse(solicitud.getActasTransmitidas(), SceConstantes.ACTIVO));
			respuesta.setMessage("Se realizo la transmision a nacion con exito");
			respuesta.setSuccess(Boolean.TRUE);
		} catch (Exception e) {
			logger.error("Se genero un error al realizar la transmision a nacion: ", e);
			respuesta = new TransmisionResponseDto();
			respuesta.setActasTransmitidas(this.builResponse(solicitud.getActasTransmitidas(), SceConstantes.INACTIVO));
			respuesta.setMessage("Fallo la transmision a nacion");
			respuesta.setSuccess(Boolean.FALSE);
		} finally {
			if(respuesta!=null) {
				respuestaString = respuesta.toJson();
			}
			CurrentTenantId.clear();
		}
		return respuestaString;

	}
	
	private List<ActaTransmitidaDto> builResponse(List<TransmisionDto> actasPorTransmitir, Integer estadoNacion) {
		List<ActaTransmitidaDto> actasTransmitidas =  actasPorTransmitir.parallelStream()
		        .map(dto -> {
		        	ActaTransmitidaDto x = new ActaTransmitidaDto();
		        	x.setIdTransmision(dto.getIdTransmision());
		        	x.setIdActa(dto.getActaTransmitida()!=null ? dto.getActaTransmitida().getIdActa() : null);
		        	x.setEstadoTransmitidoNacion(estadoNacion);
		        	return x;
		        })
		        .collect(Collectors.toList());
		return actasTransmitidas;
	}
	
}
