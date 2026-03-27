package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.CargoTransmisionNacionHttpService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.CargoTransmisionNacionMqService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.CargoTransmisionNacionStrategyService;

@Service
public class CargoTransmisionNacionStrategyServiceImpl implements CargoTransmisionNacionStrategyService {

	@Value("${app.orc.transmision.mq}")
    private boolean habilitarKafka;
	
	private final CargoTransmisionNacionMqService cargoTransmisionNacionMqService;
	
	private final CargoTransmisionNacionHttpService cargoTransmisionNacionHttpService;
	
	public CargoTransmisionNacionStrategyServiceImpl(
		CargoTransmisionNacionMqService cargoTransmisionNacionMqService,
		CargoTransmisionNacionHttpService cargoTransmisionNacionHttpService){
		this.cargoTransmisionNacionMqService = cargoTransmisionNacionMqService;
		this.cargoTransmisionNacionHttpService = cargoTransmisionNacionHttpService;
	}
	
	@Override
	public void sincronizar(Long idActa, String proceso, String usuario) {
		if(habilitarKafka) {
			this.cargoTransmisionNacionMqService.sincronizar(idActa, proceso, usuario);
		} else {
			this.cargoTransmisionNacionHttpService.sincronizar(idActa, proceso, usuario);
		}
	}

	@Override
	public void transmitirActa(Long idActa, String proceso, String usuarioTransmision) {
		if(habilitarKafka) {
			this.cargoTransmisionNacionMqService.tramsmitirActa(idActa, proceso, usuarioTransmision);
		} else {
			this.cargoTransmisionNacionHttpService.tramsmitirActa(idActa, proceso, usuarioTransmision);
		}
	}

}
