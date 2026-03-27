package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service;


public interface CargoTransmisionNacionStrategyService {

	void sincronizar(Long idActa, String proceso, String usuario);
	void transmitirActa(Long idActa, String proceso, String usuarioTransmision);
	
}
