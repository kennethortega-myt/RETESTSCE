package pe.gob.onpe.scebackend.ext.pr.service.impl;


import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.gob.onpe.scebackend.ext.pr.dto.RegistroTramaParam;
import pe.gob.onpe.scebackend.ext.pr.service.EnvioTramaSceService;
import pe.gob.onpe.scebackend.model.orc.repository.TabPrTransmisionRepository;

@Slf4j
@Service
public class EnvioTramaSceServiceImpl implements EnvioTramaSceService {

	private final TabPrTransmisionRepository tabPrTransmisionRepository;

    public EnvioTramaSceServiceImpl(TabPrTransmisionRepository tabPrTransmisionRepository) {
        this.tabPrTransmisionRepository = tabPrTransmisionRepository;
    }

    @Override
	@Transactional("locationTransactionManager")
	public void generarRegistrosTransmisionPr(List<RegistroTramaParam> params) {
		Integer resultado = 0;
        String mensaje = "";

        params.forEach(param -> {
        	log.info("param ps: {}", param);
        	Map<String, Object> resultadops = tabPrTransmisionRepository.registrarTramaPr(
	        		param.getEsquema(), 
	        		param.getIdActa(),
	        		param.getIdDetUbigeoEleccion(),
	        		param.getEstadoActa()!=null ? param.getEstadoActa() : "",
	        		param.getEstadoComputo()!=null ? param.getEstadoComputo() : "",
	        		param.getEstadoActaResolucion()!=null ? param.getEstadoActaResolucion() : "",
	        		param.getAudUsuarioCreacion(),
	        		resultado,
	        		mensaje);
        	if(resultadops!=null) {
        		log.info("resultado de la ps: {}", resultadops.get("po_resultado"));
        		log.info("mensaje final de la ps: {}", resultadops.get("po_mensaje"));
        	}
	        
        });
	}
    
    @Override
	@Transactional("locationTransactionManager")
	public void generarRegistrosTransmisionJne(List<RegistroTramaParam> params) {
		Integer resultado = 0;
        String mensaje = "";

        params.forEach(param -> {
        	log.info("param ps: {}", param);
        	Map<String, Object> resultadops = tabPrTransmisionRepository.registrarTramaJne(
	        		param.getEsquema(), 
	        		param.getIdActa(),
	        		param.getAudUsuarioCreacion(),
	        		resultado,
	        		mensaje);
        	if(resultadops!=null) {
        		log.info("resultado de la ps: {}", resultadops.get("po_resultado"));
        		log.info("mensaje final de la ps: {}", resultadops.get("po_mensaje"));
        	}
	        
        });
	}
}
