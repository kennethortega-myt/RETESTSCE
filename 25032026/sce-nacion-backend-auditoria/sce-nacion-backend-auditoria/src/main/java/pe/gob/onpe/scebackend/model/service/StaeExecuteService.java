package pe.gob.onpe.scebackend.model.service;

import pe.gob.onpe.scebackend.model.dto.response.GenericResponse;
import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralRequestDto;

public interface StaeExecuteService {

	GenericResponse execute(String tentat, String esquema, ActaElectoralRequestDto actaDto, String username);
	void executeAsync(String tentat, String esquema, ActaElectoralRequestDto actaDto, String username);
	
}
