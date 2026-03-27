package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service;

import java.util.List;

import pe.gob.onpe.sceorcbackend.model.dto.AutorizacionNacionResponseDto;
import pe.gob.onpe.sceorcbackend.model.dto.TokenInfo;
import pe.gob.onpe.sceorcbackend.model.dto.controlcalidad.ControlCalidadActaPendiente;
import pe.gob.onpe.sceorcbackend.model.dto.controlcalidad.ControlCalidadSumaryResponse;
import pe.gob.onpe.sceorcbackend.model.dto.controlcalidad.DataPaso2Response;
import pe.gob.onpe.sceorcbackend.model.dto.controlcalidad.DataPaso3Response;
import pe.gob.onpe.sceorcbackend.model.dto.controlcalidad.ImagenesPaso1;
import pe.gob.onpe.sceorcbackend.model.dto.controlcalidad.RechazarCcRequest;
import pe.gob.onpe.sceorcbackend.model.dto.controlcalidad.ResolucionActaResponse;
import pe.gob.onpe.sceorcbackend.model.dto.response.GenericResponse;
import pe.gob.onpe.sceorcbackend.model.dto.response.resoluciones.ResolucionActaBean;

public interface ControlCalidadService {

	ControlCalidadSumaryResponse summaryControlCalidad(String codigoEleccion);
	
	List<ControlCalidadActaPendiente> actasPendientesControlCalidad(String codigoEleccion, TokenInfo tokenInfo);
	
	List<ResolucionActaResponse> obtenerResolucionesPorActa(Long idActa);
	
	ImagenesPaso1 obtenerIdsArchivosPaso1(Long idActa, TokenInfo tokenInfo);
	
	GenericResponse<Boolean> rechazarControlCalidad(RechazarCcRequest request, TokenInfo tokenInfo);
	
	GenericResponse<Boolean> observarControlCalidad(Long idActa, TokenInfo tokenInfo);
	
	DataPaso2Response obtenerDataPaso2(Long idActa);
	
	GenericResponse<Boolean> aceptarControlCalidad(RechazarCcRequest request, TokenInfo tokenInfo);
	
	GenericResponse<DataPaso3Response> obtenerDataPaso3(Long idActa, String schema);
	
	ResolucionActaBean getHistorialResolucionAntesDespues(Long idActa, Long idResolucion);
	
	AutorizacionNacionResponseDto getAutorizacionNacion(String usuario, String cc, String proceso, Long idDocumento, String tipoDocumento);
	
	Boolean solicitaAutorizacion(String usuario, String cc, String proceso, Long idDocumento, String tipoDocumento, Long idActa, TokenInfo tokenInfo);
	
	GenericResponse<Boolean> cancelarControlCalidad(List<Long> idsActas, TokenInfo tokenInfo);
}
