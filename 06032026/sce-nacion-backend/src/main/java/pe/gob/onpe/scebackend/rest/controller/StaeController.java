package pe.gob.onpe.scebackend.rest.controller;


import java.util.List;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import pe.gob.onpe.scebackend.model.service.StaeFileService;
import pe.gob.onpe.scebackend.model.service.StaeIntegrationService;
import pe.gob.onpe.scebackend.model.service.StaeService;
import pe.gob.onpe.scebackend.model.service.StaeTransforService;
import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralRequestDto;
import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralResponse;
import pe.gob.onpe.scebackend.model.stae.dto.ArchivoStaeDto;
import pe.gob.onpe.scebackend.model.stae.dto.MesaElectoresRequestDto;
import pe.gob.onpe.scebackend.model.stae.dto.ResultadoPs;
import pe.gob.onpe.scebackend.model.stae.dto.files.DocumentoElectoralDto;
import pe.gob.onpe.scebackend.security.jwt.TokenDecoder;
import pe.gob.onpe.scebackend.utils.SceConstantes;

@RequestMapping("/stae/")
@Controller
public class StaeController {

	Logger logger = LoggerFactory.getLogger(StaeController.class);

	private final StaeService staeService;
	
	private final StaeFileService staeFileService;
	
	private final StaeIntegrationService staeIntegrationService;
	
	private final StaeTransforService staeTransfService;

	private final IConfiguracionProcesoElectoralService confProcesoService;

	private final TokenDecoder tokenDecoder;

	private static final String HEADER_USERNAME = "usr";

	@Value("${desarrollo.integracion}")
	private boolean desarrolloIntegracion;

	public StaeController(StaeService staeService, IConfiguracionProcesoElectoralService confProcesoService,
			TokenDecoder tokenDecoder,
			StaeFileService staeFileService,
			StaeIntegrationService staeIntegrationService,
			StaeTransforService staeTransfService) {
		this.staeService = staeService;
		this.confProcesoService = confProcesoService;
		this.tokenDecoder = tokenDecoder;
		this.staeFileService = staeFileService;
		this.staeIntegrationService = staeIntegrationService;
		this.staeTransfService = staeTransfService;
	}

	@PreAuthorize("hasAuthority('STAE')")
	@PostMapping("/acta")
	public ResponseEntity<GenericResponse> insertarActa(
			@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
			@RequestHeader("X-Tenant-Id") String tentat, 
			@RequestBody ActaElectoralRequestDto actaDto) {

		GenericResponse genericResponse = new GenericResponse();

		if (authorization != null) {

			try {
				
				this.staeTransfService.completarInfo(actaDto);
				
				String token = authorization.substring(SceConstantes.LENGTH_BEARER);
				Claims claims = this.tokenDecoder.decodeToken(token);
				String username = claims.get(HEADER_USERNAME, String.class);
				JSONObject jsonActa = new JSONObject(actaDto);
				String esquema = this.confProcesoService.getEsquema(tentat);

				ResultadoPs resultadopc = this.staeService.insertActaStae(
						esquema, 
						desarrolloIntegracion,
						jsonActa.toString(), 
						username);

				List<DocumentoElectoralDto> archivos = staeFileService.crearArchivos(actaDto, username);
	
				
				if (resultadopc.getPoResultado().equals(SceConstantes.ACTIVO)) {
					ActaElectoralResponse response = new ActaElectoralResponse();
					response.setEstadoActa(resultadopc.getPoEstadoActa());
					response.setEstadoCompu(resultadopc.getPoEstadoComputo());
					response.setEstadoActaResolucion(resultadopc.getPoEstadoActaResolucion());
					response.setEstadoErrorAritmetico(resultadopc.getPoEstadoErrorMaterial());
					this.staeIntegrationService.enviarActaOrc(actaDto, username, archivos);
					genericResponse.setSuccess(Boolean.TRUE);
					genericResponse.setData(response);
					genericResponse.setMessage(resultadopc.getPoMensaje());
					return ResponseEntity.status(HttpStatus.OK).body(genericResponse);
				} else {
					genericResponse.setSuccess(Boolean.FALSE);
					genericResponse.setMessage(resultadopc.getPoMensaje());
					return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(genericResponse);
				}
			} catch (Exception e) {
				logger.error("Error en acta STAE", e);
				genericResponse.setSuccess(Boolean.FALSE);
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(genericResponse);
			}

		} else {
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
