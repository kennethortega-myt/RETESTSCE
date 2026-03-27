package pe.gob.onpe.scebackend.model.service;


import java.util.List;

import pe.gob.onpe.scebackend.model.dto.transmision.TransmisionDto;

public interface ITransmisionService {

	void recibirTransmision(TransmisionDto actasDto, String esquema);
	void recibirTransmision(List<TransmisionDto> actasDto, String esquema);
	
}
