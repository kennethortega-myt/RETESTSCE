package pe.gob.onpe.scebackend.model.service;



import pe.gob.onpe.scebackend.model.stae.dto.ResultadoPs;


public interface StaeService {

	
	ResultadoPs insertActaStae(String piEsquema, boolean esDesarrollo, String piActa, String usuario); 
	
	ResultadoPs insertListaElectoresStae(String piEsquema, boolean esDesarrollo, String piLe, String usuario);
	

	
}
