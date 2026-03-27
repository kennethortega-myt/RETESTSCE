package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service;


public interface CargoTransmisionNacionHttpService {

	void sincronizar(Long idActa, String proceso, String usuario);
	void tramsmitirActa(Long idActa, String proceso, String usuario);

}
