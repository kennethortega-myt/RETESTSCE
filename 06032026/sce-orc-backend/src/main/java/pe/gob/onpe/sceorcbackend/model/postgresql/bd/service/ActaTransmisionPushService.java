package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service;

public interface ActaTransmisionPushService {

	void empujar(Long idActa, String proceso, String usr);
	
}
