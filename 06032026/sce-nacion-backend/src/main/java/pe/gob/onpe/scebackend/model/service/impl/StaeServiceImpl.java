package pe.gob.onpe.scebackend.model.service.impl;


import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.gob.onpe.scebackend.model.orc.repository.*;
import pe.gob.onpe.scebackend.model.service.StaeService;
import pe.gob.onpe.scebackend.model.stae.dto.ResultadoPs;
import pe.gob.onpe.scebackend.utils.SceConstantes;



@Service
public class StaeServiceImpl implements StaeService {
	
	Logger logger = LoggerFactory.getLogger(StaeServiceImpl.class);

	private final ActaRepository actaRepository;

    private static final String PO_MENSAJE = "po_mensaje";
    private static final String PO_ESTADO_ACTA = "po_estado_acta";
    private static final String PO_ESTADO_ACTA_RESOLUCION = "po_estado_acta_resolucion";
    private static final String PO_ESTADO_COMPUTO = "po_estado_computo";
    private static final String PO_ESTADO_ERROR_MATERIAL = "po_estado_error_material";
    
   
	public StaeServiceImpl(
			ActaRepository actaRepository) {
		this.actaRepository = actaRepository;
	}
	
	@Override
	@Transactional("tenantTransactionManager")
	public ResultadoPs insertActaStae(String piEsquema, boolean esDesarrollo, String piActa, String usuario) {
		Integer poResultado = SceConstantes.INACTIVO;
		String poMensaje = "";
		String estadoActa = "";
		String estadoActaResolucion = "";
		String estadoComputo = "";
		String estadoErrorMaterial = "";
		Map<String, Object> resultadopc = actaRepository.insertActaStae(
				piEsquema, 
				piActa, 
				usuario, 
				esDesarrollo, 
				poResultado, 
				poMensaje,
				estadoActa,
				estadoActaResolucion,
				estadoComputo,
				estadoErrorMaterial);
		if (resultadopc != null) {
			Object resultadoPs = resultadopc.get("po_resultado");
			poResultado = (resultadoPs != null && resultadoPs.toString().equals(SceConstantes.ACTIVO.toString()))
					? SceConstantes.ACTIVO
					: SceConstantes.INACTIVO;

			poMensaje = resultadopc.get(PO_MENSAJE) != null ? resultadopc.get(PO_MENSAJE).toString() : "";
			
			if(poResultado.equals(SceConstantes.ACTIVO)){
				estadoActa = resultadopc.get(PO_ESTADO_ACTA)!= null ? resultadopc.get(PO_ESTADO_ACTA).toString() : null;
				estadoActaResolucion = resultadopc.get(PO_ESTADO_ACTA_RESOLUCION)!= null ? resultadopc.get(PO_ESTADO_ACTA_RESOLUCION).toString(): null;
				estadoComputo = resultadopc.get(PO_ESTADO_COMPUTO)!= null ? resultadopc.get(PO_ESTADO_COMPUTO).toString() : null;
				estadoErrorMaterial = resultadopc.get(PO_ESTADO_ERROR_MATERIAL)!=null ? resultadopc.get(PO_ESTADO_ERROR_MATERIAL).toString() : null;
			}
			
			logger.info("resultado de la ps del registro de actas STAE: {}", resultadoPs);
			logger.info("mensaje final de la ps del registro de actas STAE: {}", poMensaje);
		}
		
		return ResultadoPs
				.builder()
				.poResultado(poResultado)
				.poMensaje(poMensaje)
				.poEstadoActa(estadoActa)
				.poEstadoComputo(estadoComputo)
				.poEstadoActaResolucion(estadoActaResolucion)
				.poEstadoErrorMaterial(estadoErrorMaterial)
				.build();
	}

	@Override
	@Transactional("tenantTransactionManager")
	public ResultadoPs insertListaElectoresStae(String piEsquema, boolean esDesarrollo, String piLe, String usuario) {
		Integer poResultado = SceConstantes.INACTIVO;
		String poMensaje = "";
		Map<String, Object> resultadopc = actaRepository.insertListaElectoresStae(piEsquema, piLe, usuario, esDesarrollo, poResultado, poMensaje);
		if (resultadopc != null) {
			Object resultadoPs = resultadopc.get("po_resultado");
			poResultado = (resultadoPs != null && resultadoPs.toString().equals(SceConstantes.ACTIVO.toString()))
					? SceConstantes.ACTIVO
					: SceConstantes.INACTIVO;

			poMensaje = resultadopc.get(PO_MENSAJE) != null ? resultadopc.get(PO_MENSAJE).toString() : "";
			logger.info("resultado de la ps del registro de lista electores STAE: {}", resultadoPs);
			logger.info("mensaje final de la ps del registro de lista electores STAE: {}", poMensaje);
		}
		
		return ResultadoPs
				.builder()
				.poResultado(poResultado)
				.poMensaje(poMensaje)
				.build();
	}
	

	



}
