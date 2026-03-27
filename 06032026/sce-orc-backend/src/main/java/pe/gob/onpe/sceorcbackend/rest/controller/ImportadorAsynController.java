package pe.gob.onpe.sceorcbackend.rest.controller;


import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.client.RestTemplate;


import pe.gob.onpe.sceorcbackend.model.dto.request.ImportarRequest;
import pe.gob.onpe.sceorcbackend.model.importar.dto.ImportarDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ITabLogService;
import pe.gob.onpe.sceorcbackend.model.postgresql.importar.service.impl.ImportarBdAsyncServiceImpl;
import pe.gob.onpe.sceorcbackend.security.TokenDecoder;
import pe.gob.onpe.sceorcbackend.utils.SceConstantes;

import java.util.List;

@Controller
public class ImportadorAsynController {

    Logger logger = LoggerFactory.getLogger(ImportadorAsynController.class);

    private final RestTemplate clientExport;
    private final ImportarBdAsyncServiceImpl importar;
    private final TokenDecoder tokenDecoder;
    private final ITabLogService logService;

    public ImportadorAsynController(RestTemplate clientExport, 
    		ImportarBdAsyncServiceImpl importar, 
    		TokenDecoder tokenDecoder,
    		ITabLogService logService) {
    	this.clientExport = clientExport;
    	this.importar = importar;
    	this.tokenDecoder = tokenDecoder;
    	this.logService = logService;
    }

    @Value("${sce.nacion.url}")
    private String urlNacion;

    @MessageMapping("/importar-ws") // para enviar mensaje al servidor
    public String recibirMensaje(SimpMessageHeaderAccessor headerAccessor) throws Exception {

    	
    	
        List<String> values = headerAccessor.getNativeHeader(SceConstantes.AUTHORIZATION_HEADER);

        String proceso = null;
        String perfil = null;
        String centroc = null;
        String usr = null;
        
        if (values != null) {
            String authorizationHeader = values.get(0);
            String token = authorizationHeader.substring(SceConstantes.LENGTH_BEARER); // remove prefix "Bearer "
            Claims claims = this.tokenDecoder.decodeToken(token);
            proceso = claims.get("apr", String.class);
            perfil = claims.get("per", String.class);
            centroc = claims.get("ccc", String.class);
            usr = claims.get("usr", String.class);
            
            this.logService.registrarLog(
            		usr,
            		"pe.gob.onpe.sceorcbackend.rest.controller.ImportadorAsynController.recibirMensaje",
                    this.getClass().getName(),
                    "El usuario realizó una importación de datos",
            		centroc,
            		1, 
            		1);
        } // end

        logger.info("****************************");
        logger.info("Proceso: {}", proceso);
        logger.info("perfil:{}", perfil);
        logger.info("Cc: {}", centroc);
        logger.info("Usuario: {}", usr);
        logger.info("****************************");

        ImportarRequest request = new ImportarRequest();
        request.setAcronimo(proceso);
        request.setCc(centroc);

        HttpHeaders headers = new HttpHeaders();
        headers.set(SceConstantes.USERAGENT_HEADER, SceConstantes.USERAGENT_HEADER_VALUE);
        headers.set(SceConstantes.TENANT_HEADER, proceso);
        headers.set(SceConstantes.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        HttpEntity<ImportarRequest> httpEntity = new HttpEntity<>(request, headers);

        logger.info("Inicio de la exportacion");
        ResponseEntity<ImportarDto> response = this.clientExport.exchange(urlNacion + "exportar/", HttpMethod.POST, httpEntity, ImportarDto.class);
        logger.info("Fin de la exportacion");

        this.importar.migrar(response.getBody(), usr);
        return "";
    }
}
