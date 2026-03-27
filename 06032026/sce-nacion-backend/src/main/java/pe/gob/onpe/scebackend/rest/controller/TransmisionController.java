package pe.gob.onpe.scebackend.rest.controller;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pe.gob.onpe.scebackend.exeption.AuthTransmisionException;
import pe.gob.onpe.scebackend.model.dto.transmision.ActaTransmitidaDto;
import pe.gob.onpe.scebackend.model.dto.transmision.TransmisionDto;
import pe.gob.onpe.scebackend.model.dto.transmision.TransmisionNacionRequestDto;
import pe.gob.onpe.scebackend.model.dto.transmision.TransmisionResponseDto;
import pe.gob.onpe.scebackend.model.service.IConfiguracionProcesoElectoralService;
import pe.gob.onpe.scebackend.model.service.ITransmisionService;
import pe.gob.onpe.scebackend.model.service.TokenValidadorService;
import pe.gob.onpe.scebackend.utils.SceConstantes;

@RestController
@Validated
@RequestMapping("/transmision")
public class TransmisionController {

	Logger logger = LoggerFactory.getLogger(TransmisionController.class);

	private ITransmisionService transmisionService;

	private IConfiguracionProcesoElectoralService confProcesoService;
	
	private TokenValidadorService tokenValidadorService;

	public TransmisionController(
			ITransmisionService transmisionService,
			IConfiguracionProcesoElectoralService confProcesoService,
			TokenValidadorService tokenValidadorService){
		this.transmisionService = transmisionService;
		this.confProcesoService = confProcesoService;
		this.tokenValidadorService = tokenValidadorService;
	}


	@PatchMapping({"/recibir-transmision", "/recibir-transmision/"})
	public ResponseEntity<TransmisionResponseDto> recibirTransmision(
			@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
			@RequestHeader("codigocc") String cc,
			@RequestBody TransmisionNacionRequestDto request) {

		TransmisionResponseDto response = new TransmisionResponseDto();

		String proceso = request.getProceso();
		logger.info("proceso: {}", proceso);

		String esquema = this.confProcesoService.getEsquema(proceso);

		logger.info("esquema:: {}",esquema);

        logger.info("transmision recibida");
        
        try {
        	
        	boolean autenticacion = this.tokenValidadorService.validarToken(authorization, cc);
        	
        	if (!autenticacion) {
        		throw new AuthTransmisionException(
        		        "Token invalido"
        		);
        	}
        	
        	List<ActaTransmitidaDto> rptas = new ArrayList<>();
        	for(TransmisionDto transmision:request.getActasTransmitidas()){
				ActaTransmitidaDto rpta = new ActaTransmitidaDto();
				recibirTransmisionMetodo(rpta, transmision, esquema);
        		rptas.add(rpta);
        	}
        	
        	response.setActasTransmitidas(rptas);
			response.setMessage("Se realizo la transmision a nacion con exito");
			response.setSuccess(Boolean.TRUE);

			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (AuthTransmisionException e) {
			logger.error("Token invalido: ", e);
			response.setActasTransmitidas(this.builResponse(request.getActasTransmitidas(), SceConstantes.INACTIVO));
			response.setMessage("Token invalido");
			response.setSuccess(Boolean.FALSE);
			return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
		} catch (Exception e) {
			logger.error("Se genero un error al realizar la transmision a nacion: ", e);
			response.setActasTransmitidas(this.builResponse(request.getActasTransmitidas(), SceConstantes.INACTIVO));
			response.setMessage("Fallo la transmision a nacion");
			response.setSuccess(Boolean.FALSE);
			return new ResponseEntity<>(response, HttpStatus.UNPROCESSABLE_ENTITY);
		}
	}

	private void recibirTransmisionMetodo(ActaTransmitidaDto rpta, TransmisionDto transmision, String esquema) {
		try{
			this.transmisionService.recibirTransmision(transmision, esquema);
			rpta.setEstadoTransmitidoNacion(SceConstantes.ACTIVO);
			rpta.setIdActa(transmision.getActaTransmitida()!=null ? transmision.getActaTransmitida().getIdActa() : null);
			rpta.setIdTransmision(transmision.getIdTransmision());
		}catch (Exception e) {
			rpta.setEstadoTransmitidoNacion(SceConstantes.INACTIVO);
			rpta.setIdActa(transmision.getActaTransmitida()!=null ? transmision.getActaTransmitida().getIdActa() : null);
			rpta.setIdTransmision(transmision.getIdTransmision());
		}
	}
	
	private List<ActaTransmitidaDto> builResponse(List<TransmisionDto> actasPorTransmitir, Integer estadoNacion) {
		return actasPorTransmitir.parallelStream()
				.map(dto -> {
					ActaTransmitidaDto x = new ActaTransmitidaDto();
					x.setIdTransmision(dto.getIdTransmision());
					x.setIdActa(dto.getActaTransmitida()!=null ? dto.getActaTransmitida().getIdActa() : null);
					x.setEstadoTransmitidoNacion(estadoNacion);
					return x;
				})
				.toList();
	}
	
}
