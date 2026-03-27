package pe.gob.onpe.sceorcbackend.model.stae.service;

import java.util.List;

import pe.gob.onpe.sceorcbackend.model.stae.dto.ActaElectoralRequestDto;
import pe.gob.onpe.sceorcbackend.model.stae.dto.DocumentoElectoralDto;
import pe.gob.onpe.sceorcbackend.model.stae.dto.DocumentoElectoralRequest;
import pe.gob.onpe.sceorcbackend.model.stae.dto.ResultadoPs;


public interface StaeService {

	ResultadoPs  insertActaStae(
			String piEsquema,
			boolean esDesarollo,
			String piActa,
			String usuario
	);
	
	ResultadoPs  insertListaElectoresStae(
			String piEsquema,
			boolean esDesarollo,
			String piLe,
			String usuario
	);
	
	void guardarDocumentosElectorales(DocumentoElectoralRequest request, String usuario);
	
	boolean validarTokenStae(String tokenBearer, String numeroMesa);
	
	void sendProcessActaStae(
			String numMesa,
			Integer tipoEleccion,
			String codUsuario,
			String codCentroComput
			);
	
	void guardarDocumentosElectorales(ActaElectoralRequestDto actaDto, List<DocumentoElectoralDto> documentos, String usuario);

}
