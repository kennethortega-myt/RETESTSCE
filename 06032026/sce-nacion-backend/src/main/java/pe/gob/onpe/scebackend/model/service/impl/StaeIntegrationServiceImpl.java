package pe.gob.onpe.scebackend.model.service.impl;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import pe.gob.onpe.scebackend.model.dto.response.GenericResponse;
import pe.gob.onpe.scebackend.model.orc.entities.CentroComputo;
import pe.gob.onpe.scebackend.model.orc.entities.PuestaCeroPr;
import pe.gob.onpe.scebackend.model.orc.repository.CentroComputoRepository;
import pe.gob.onpe.scebackend.model.orc.repository.PuestaCeroPrRepository;
import pe.gob.onpe.scebackend.model.service.StaeIntegrationService;
import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralRequestDto;
import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralRequestOrcDto;
import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralResponse;
import pe.gob.onpe.scebackend.model.stae.dto.MesaElectoresRequestDto;
import pe.gob.onpe.scebackend.model.stae.dto.StaeCcResponse;
import pe.gob.onpe.scebackend.model.stae.dto.files.DocumentoElectoralDto;
import pe.gob.onpe.scebackend.model.stae.dto.files.DocumentoElectoralRequest;
import pe.gob.onpe.scebackend.model.stae.dto.login.LoginResponse;
import pe.gob.onpe.scebackend.model.stae.dto.pc.DataReportePcDto;
import pe.gob.onpe.scebackend.model.stae.dto.pc.PuestaCeroResponse;
import pe.gob.onpe.scebackend.model.stae.mapper.IActaElectoralRequestOrcMapper;
import pe.gob.onpe.scebackend.utils.DateUtil;
import pe.gob.onpe.scebackend.utils.JsonUtils;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesPuestaCeroPr;

@Service
public class StaeIntegrationServiceImpl implements StaeIntegrationService {

	Logger logger = LoggerFactory.getLogger(StaeIntegrationServiceImpl.class);
	
	private static final String HEADER_CC = "codigocc";
	
	@Value("${sce.cc.url-stae-documentos-electorales}")
	private String urlEndpointDocumentosElectoralesStae;
	
	@Value("${sce.cc.url-stae-lista-electorales}")
	private String urlEndpointLeStae;
	
	@Value("${sce.cc.connect-timeout}")
    private int timeoutCc;
	
	@Value("${sce.stae.endpoint-token}")
    private String tokenEndpoint;
	
	@Value("${sce.cc.url-stae-acta}")
	private String urlEndpointActaStae;
	
	@Value("${sce.stae.endpoint-pc}")
    private String pcStaeEndpoint;
	
	@Value("${sce.stae.username}")
    private String username;

    @Value("${sce.stae.password}")
    private String password;
	
	private final RestTemplate restTemplate;
	
	private final CentroComputoRepository centroComputoRepository;
	
	private final PuestaCeroPrRepository puestaCeroPrRepository;
	
	private final IActaElectoralRequestOrcMapper actaElectoralRequestOrcMapper;
	
	public static final Integer INTENTO_INICIAL = 0;
	public static final String EJECUTADO = "E";
	public static final String NO_EJECUTADO = "S";
	
	public StaeIntegrationServiceImpl(RestTemplate restTemplate,
			CentroComputoRepository centroComputoRepository,
			IActaElectoralRequestOrcMapper actaElectoralRequestOrcMapper,
			PuestaCeroPrRepository puestaCeroPrRepository){
		this.restTemplate = restTemplate;
		this.centroComputoRepository = centroComputoRepository;
		this.puestaCeroPrRepository = puestaCeroPrRepository;
		this.actaElectoralRequestOrcMapper = actaElectoralRequestOrcMapper;
	}
	
	@Override
	public boolean enviarDocumentosElectorales(String urlBase, 
			String token, 
			String usuario, 
			String numMesa, 
			Integer idEleccion,
			String cc,
			List<DocumentoElectoralDto> archivos) {
		try {

			HttpHeaders headers = new HttpHeaders();
			headers.setBearerAuth(token);
			headers.setContentType(MediaType.APPLICATION_JSON);
			headers.add("user", usuario);
			headers.add(HEADER_CC, cc);

			DocumentoElectoralRequest request = new DocumentoElectoralRequest();
			request.setCodigoMesa(numMesa);
			request.setIdEleccion(idEleccion);
			request.setDocumentos(archivos);
	        HttpEntity<DocumentoElectoralRequest> entity = new HttpEntity<>(request, headers);
	        
	        String url = String.format("%s%s", 
	        		urlBase, 
	        		urlEndpointDocumentosElectoralesStae);

			ResponseEntity<GenericResponse> response = restTemplate.exchange(url, HttpMethod.POST, entity,
					GenericResponse.class);
			return response.getStatusCode() == HttpStatus.OK;

		} catch (Exception e) {
			logger.error("Error al enviar los documentos electorales", e);
			return false;
		}

	}
	
	@Override
	@Transactional("tenantTransactionManager")
	public boolean enviarListaElectoresOrc(MesaElectoresRequestDto request, String usuario) {
		Optional<CentroComputo> cpo = centroComputoRepository.findByCodigoMesa(request.getNumeroMesa());
		if(cpo.isPresent()){
			CentroComputo cp = cpo.get();
			HttpHeaders headers = new HttpHeaders();
	        headers.setBearerAuth(cp.getApiTokenBackedCc());
	        headers.setContentType(MediaType.APPLICATION_JSON);
	        headers.add("user", usuario);
	        headers.add(HEADER_CC, cp.getCodigo()); 
	        
	        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
	        factory.setConnectTimeout(timeoutCc);
	        factory.setReadTimeout(timeoutCc);
	        
	        RestTemplate rest = new RestTemplate(factory);
	        
	        // Incluir cuerpo + headers
	        HttpEntity<MesaElectoresRequestDto> entity = new HttpEntity<>(request, headers);
	        String url = String.format("%s://%s:%d%s", 
	        		cp.getProtocolBackendCc(),
	        		cp.getIpBackendCc(), 
	        		cp.getPuertoBackedCc(), 
	        		urlEndpointLeStae);

	        try {
	        	// Hacer el POST y esperar un DTO como respuesta
		        ResponseEntity<GenericResponse> response = rest.exchange(
		                url,
		                HttpMethod.POST,
		                entity,
		                GenericResponse.class
		        );
	            return response.getStatusCode() == HttpStatus.OK;
	        } catch (Exception e) {
	        	logger.error("Error al enviar la lista de electores", e);
	            return false;
	        }
		} else {
			return false;
		}
	}
	
	@Override
	public String obtenerToken(String username, String password) {
        Map<String, String> body = Map.of(
            "usuario", username,
            "clave", password
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
			ResponseEntity<LoginResponse> response = restTemplate.exchange(
                tokenEndpoint,
                HttpMethod.POST,
                entity,
                LoginResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            	LoginResponse rpta = response.getBody();
                if (rpta!=null 
                		&& rpta.getData()!=null 
                		&& rpta.getData().getToken()!=null) {
                    return rpta.getData().getToken();
                }
            }
        } catch (Exception e) {
        	logger.error("Error al obtener token", e);
        	return null;
        }
        return null;
	}
	
	@Override
	@Transactional("tenantTransactionManager")
	public boolean enviarActaOrc(ActaElectoralRequestDto request, String usuario, List<DocumentoElectoralDto> archivos) {
		Optional<CentroComputo> cpo = centroComputoRepository.findByCodigoMesa(request.getNumeroActa());
		boolean exitoso = false;
		if(cpo.isPresent()){
			try {
					ActaElectoralRequestOrcDto requestOrc = actaElectoralRequestOrcMapper.toDto(request);
					CentroComputo cp = cpo.get();
					logger.info("El codigo de centro de computo en el envio de actas STAE/VD es {} con id {}", cp.getCodigo(), cp.getId());
					
					String urlBase = String.format("%s://%s:%d", cp.getProtocolBackendCc(),
			        		cp.getIpBackendCc(), 
			        		cp.getPuertoBackedCc());
					if(archivos!=null && !archivos.isEmpty()){
			        	this.enviarDocumentosElectorales(
				        			urlBase, 
				        			cp.getApiTokenBackedCc(), 
				        			usuario, 
				        			request.getNumeroActa(), 
				        			request.getEleccion(),
				        			cp.getCodigo(),
				        			archivos);
			        }
					
					HttpHeaders headers = new HttpHeaders();
			        headers.setBearerAuth(cp.getApiTokenBackedCc());
			        headers.setContentType(MediaType.APPLICATION_JSON);
			        headers.add("user", usuario); 
			        headers.add(HEADER_CC, cp.getCodigo()); 
			        
		
			        // Incluir cuerpo + headers
			        HttpEntity<ActaElectoralRequestOrcDto> entity = new HttpEntity<>(requestOrc, headers);
			        
			        String url = String.format("%s%s", 
			        		urlBase, 
			        		urlEndpointActaStae);
			        logger.info("url del endpoint que recibe el acta stae en CC: {}", url);
		        
		        	// Hacer el POST y esperar un DTO como respuesta
			        ResponseEntity<StaeCcResponse<ActaElectoralResponse>> response = restTemplate.exchange(
			                url,
			                HttpMethod.POST,
			                entity,
			                new ParameterizedTypeReference<StaeCcResponse<ActaElectoralResponse>>() {}
			        );
			        return response.getStatusCode() == HttpStatus.OK;
	        } catch (Exception e) {
	        	logger.error("Error al enviar el  acta a CC", e);
	            return exitoso;
	        }
		} else {
			return exitoso;
		}
	}
	
	@Override
	public Long puestaCeroStae(String usuario) {
		PuestaCeroResponse responsePc = null;
		Long id = null;
		boolean exitoso = true;
        String token = obtenerToken(username, password);
        if (token == null) {
            return id;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<PuestaCeroResponse> response = restTemplate.exchange(
            		pcStaeEndpoint,
                    HttpMethod.GET,
                    entity,
                    PuestaCeroResponse.class
            );
            // Validar HTTP 200 y que el JSON diga success=true
            if(response.getStatusCode() == HttpStatus.OK
                    && response.getBody() != null){
            	responsePc = response.getBody();
            	if(responsePc!=null && responsePc.getData()!=null){
            		String jsonString = responsePc.getData().getMensaje();
                	ObjectMapper mapper = new ObjectMapper();
                	List<DataReportePcDto> reporte = mapper.readValue(
                			jsonString,
                            new TypeReference<List<DataReportePcDto>>() {}
                    );
                	responsePc.getData().setData(reporte);
            	} 
            }
        } catch (Exception e) {
        	logger.error("Error al hacer la puesta cero STAE", e);
        	exitoso = false;
        	responsePc = new PuestaCeroResponse();
        	responsePc.setSuccess(exitoso);
        } finally {
        	Date fechaActual = DateUtil.getFechaActualPeruana();
        	PuestaCeroPr puestaCeroPr = new PuestaCeroPr();
			puestaCeroPr.setUsuarioCreacion(usuario);
			puestaCeroPr.setFechaCreacion(fechaActual);
			puestaCeroPr.setUsuarioModificacion(usuario);
			puestaCeroPr.setFechaModificacion(fechaActual);
			puestaCeroPr.setActivo(ConstantesPuestaCeroPr.ACTIVO);
			puestaCeroPr.setRespuestaPcStae(JsonUtils.getPuestaCeroStaeResponse(responsePc));
			puestaCeroPr.setIntento(INTENTO_INICIAL);
			puestaCeroPr.setEstado(exitoso ? EJECUTADO : NO_EJECUTADO);
			this.puestaCeroPrRepository.save(puestaCeroPr);
			id = puestaCeroPr.getId();
        }
		return id;
	}
	
}
