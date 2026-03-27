package pe.gob.onpe.scebackend.model.service;

import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralRequestDto;

public interface StaeTransforService {

	void completarInfo(ActaElectoralRequestDto actaDto);
	
}
