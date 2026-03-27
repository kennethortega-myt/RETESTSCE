package pe.gob.onpe.scebackend.rest.controller;


import java.util.Date;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;

import io.jsonwebtoken.Claims;
import pe.gob.onpe.scebackend.model.dto.response.GenericResponse;
import pe.gob.onpe.scebackend.model.service.IConfiguracionProcesoElectoralService;
import pe.gob.onpe.scebackend.model.service.StaeExecuteService;
import pe.gob.onpe.scebackend.model.service.StaeIntegrationService;
import pe.gob.onpe.scebackend.model.service.StaeService;
import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralRequestDto;
import pe.gob.onpe.scebackend.model.stae.dto.ArchivoStaeDto;
import pe.gob.onpe.scebackend.model.stae.dto.MesaElectoresRequestDto;
import pe.gob.onpe.scebackend.model.stae.dto.ResultadoPs;
import pe.gob.onpe.scebackend.security.jwt.TokenDecoder;
import pe.gob.onpe.scebackend.utils.SceConstantes;

@RequestMapping("/stae/")
@Controller
public class StaeController {

	Logger logger = LoggerFactory.getLogger(StaeController.class);

	@Autowired
	private StaeService staeService;
	
	@Autowired
	private StaeIntegrationService staeIntegrationService;
	
	@Autowired
	private IConfiguracionProcesoElectoralService confProcesoService;

	@Autowired
	private TokenDecoder tokenDecoder;
	
	@Autowired
	private StaeExecuteService staeExecuteService;
	
	@Value("${desarrollo.integracion}")
	private boolean desarrolloIntegracion;
	
	private static final String HEADER_USERNAME = "usr";


	public StaeController(StaeService staeService, IConfiguracionProcesoElectoralService confProcesoService,
			TokenDecoder tokenDecoder,
			StaeIntegrationService staeIntegrationService) {
		this.staeService = staeService;
		this.confProcesoService = confProcesoService;
		this.tokenDecoder = tokenDecoder;
		this.staeIntegrationService = staeIntegrationService;
	}

	@PreAuthorize("hasAuthority('STAE')")
	@PostMapping("/acta")
	public ResponseEntity<GenericResponse> insertarActa(
			@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
			@RequestHeader("X-Tenant-Id") String tentat, 
			@RequestBody ActaElectoralRequestDto actaDto) {

		if (authorization != null) {
			
			logger.info("Se inicio el procedimiento a las {} para el acta {}", new Date(), actaDto.getNumeroActa());
			
			String token = authorization.substring(SceConstantes.LENGTH_BEARER);
			Claims claims = this.tokenDecoder.decodeToken(token);
			String username = claims.get(HEADER_USERNAME, String.class);
			String esquema = this.confProcesoService.getEsquema(tentat);
			
			logger.info("Inicio del procedimiento almacenado de invocar al ps a las {} para el acta {}", new Date(), actaDto.getNumeroActa());
			
			GenericResponse response = this.staeExecuteService.execute(tentat, esquema, actaDto, username);
			
			logger.info("Fin del procedimiento almacenado de invocar al ps a las {} para el acta {}", new Date(), actaDto.getNumeroActa());
			
			this.staeExecuteService.executeAsync(tentat, esquema, actaDto, username);

			logger.info("El servicio devuelve la respuesta a las {}", new Date());
			
			return ResponseEntity.status(HttpStatus.OK).body(response);

		} else {
			GenericResponse genericResponse = new GenericResponse();
			genericResponse.setMessage("Token Inválido");
			genericResponse.setSuccess(Boolean.FALSE);
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(genericResponse);
		}

	}

	@PreAuthorize("hasAuthority('STAE')")
	@PostMapping("/lista-electores")
	public ResponseEntity<GenericResponse> insertarLe(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
			@RequestHeader("X-Tenant-Id") String tentat, @RequestBody MesaElectoresRequestDto leDto) {

		GenericResponse genericResponse = new GenericResponse();
		if (authorization != null) {

			try {
				String token = authorization.substring(SceConstantes.LENGTH_BEARER);
				Claims claims = this.tokenDecoder.decodeToken(token);
				String username = claims.get(HEADER_USERNAME, String.class);
				JSONObject jsonLe = new JSONObject(leDto);
				String esquema = this.confProcesoService.getEsquema(tentat);

				ResultadoPs resultadopc = this.staeService.insertListaElectoresStae(esquema, desarrolloIntegracion,
						jsonLe.toString(), username);

				genericResponse.setMessage(resultadopc.getPoMensaje());
				if (resultadopc.getPoResultado().equals(SceConstantes.ACTIVO)) {
					this.staeIntegrationService.enviarListaElectoresOrc(leDto, username);
					genericResponse.setSuccess(Boolean.TRUE);
					return ResponseEntity.status(HttpStatus.OK).body(genericResponse);
				} else {
					genericResponse.setSuccess(Boolean.FALSE);
					return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(genericResponse);
				}
			} catch (Exception e) {
				logger.error("Error en lista electores STAE", e);
				genericResponse.setSuccess(Boolean.FALSE);
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(genericResponse);
			}

		} else {
			genericResponse.setMessage("Token Inválido");
			genericResponse.setSuccess(Boolean.FALSE);
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(genericResponse);
		}

	}

	@PostMapping("/documentos-electorales")
	public ResponseEntity<GenericResponse> recibirArchivos(
			@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization, @RequestHeader("X-Tenant-Id") String tentat,
			@RequestBody ArchivoStaeDto archivoDto) {
		GenericResponse genericResponse = new GenericResponse();
		genericResponse.setMessage("se registro el archivo");
		genericResponse.setSuccess(Boolean.TRUE);
		return ResponseEntity.status(genericResponse.isSuccess() ? HttpStatus.OK : HttpStatus.FORBIDDEN)
				.body(genericResponse);
	}

}
