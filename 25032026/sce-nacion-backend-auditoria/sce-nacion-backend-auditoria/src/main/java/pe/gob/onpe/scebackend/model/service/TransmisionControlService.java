package pe.gob.onpe.scebackend.model.service;

public interface TransmisionControlService {

	void actualizarOrden(String codigoCc, Long idActa);
	
	Integer getOrden(String codigoCc, Long idActa); 
	
}
