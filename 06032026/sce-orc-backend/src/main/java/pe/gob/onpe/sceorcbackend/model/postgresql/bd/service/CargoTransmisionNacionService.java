package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service;

import java.util.List;
import java.util.Optional;

import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Acta;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.CargoTransmisionNacion;
import pe.gob.onpe.sceorcbackend.model.postgresql.dto.transmisioncargo.CargoTransmitidoDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.dto.transmisioncargo.TransmisionCargoReqDto;

public interface CargoTransmisionNacionService {

	Long guardarTransmision(Long idActa, String usuario, String proceso);
	Optional<Acta> findByIdActa(Long idActa);
	Optional<CargoTransmisionNacion> findByIdTransmision(Long idTransmision);
	void actualizarPreTransmision(List<CargoTransmisionNacion> lista, String usuario);
	void actualizarPostTransmision(List<CargoTransmitidoDto> lista);
	List<TransmisionCargoReqDto> adjuntar(List<TransmisionCargoReqDto> cargosTransmistidos);
	List<TransmisionCargoReqDto> mapperRequest(List<CargoTransmisionNacion> cargosTransmistidos);
	List<CargoTransmisionNacion> listarFaltantesTransmitir(Long idActa); 
	
}
