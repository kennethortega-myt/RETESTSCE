package pe.gob.onpe.scebackend.model.service;

import java.util.List;

import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralRequestDto;
import pe.gob.onpe.scebackend.model.stae.dto.MesaElectoresRequestDto;
import pe.gob.onpe.scebackend.model.stae.dto.files.DocumentoElectoralDto;

public interface StaeIntegrationService {

	boolean enviarDocumentosElectorales(String urlBase, 
			String token, 
			String usuario, 
			String numMesa, 
			Integer idEleccion,
			String cc,
			List<DocumentoElectoralDto> archivos);
	
	boolean enviarListaElectoresOrc(MesaElectoresRequestDto request, String usuario);
	
	String obtenerToken(String username, String password);
	
	boolean enviarActaOrc(ActaElectoralRequestDto request, String usuario, List<DocumentoElectoralDto> archivos);
	
	Long puestaCeroStae(String usuario);
	
}
