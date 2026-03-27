package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import pe.gob.onpe.sceorcbackend.model.dto.transmision.TransmisionResponseDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.ActaTransmisionNacion;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ActaTransmisionDataService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ActaTransmisionHttpService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ActaTransmisionPushService;

@Service
public class ActaTransmisionPushServiceImpl implements ActaTransmisionPushService {

	private final ActaTransmisionDataService actaTransmisionDataService;
	
	private final ActaTransmisionHttpService actaTransmisionHttpService;
	
	public ActaTransmisionPushServiceImpl(
			ActaTransmisionDataService actaTransmisionDataService,
			ActaTransmisionHttpService actaTransmisionHttpService
    		) {
		this.actaTransmisionDataService = actaTransmisionDataService;
		this.actaTransmisionHttpService = actaTransmisionHttpService;
	}
	
	@Override
	public void empujar(Long idActa, String proceso, String usr) {
		TransmisionResponseDto resultado = null;
		List<ActaTransmisionNacion> transmisiones = actaTransmisionDataService.findByIdActaConTransmisionesOrdenadas(idActa);
		for(ActaTransmisionNacion transmision:transmisiones){
			resultado = actaTransmisionHttpService.transmitir(transmision.getId(), proceso, usr);
			if(resultado==null || !resultado.isExitoso()){
				break;
			}
		}
	}

}
