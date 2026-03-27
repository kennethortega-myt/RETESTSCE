package pe.gob.onpe.scebackend.model.service;

import java.util.List;

import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralRequestDto;
import pe.gob.onpe.scebackend.model.stae.dto.files.DocumentoElectoralDto;

public interface StaeFileService {

	List<DocumentoElectoralDto> crearArchivos(ActaElectoralRequestDto actaDto, String usuario);
	
}
