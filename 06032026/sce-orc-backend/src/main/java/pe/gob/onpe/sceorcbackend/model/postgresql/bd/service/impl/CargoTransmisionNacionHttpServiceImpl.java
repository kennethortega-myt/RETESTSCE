package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Acta;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.CargoTransmisionNacion;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.CargoTransmisionNacionHttpService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.CargoTransmisionNacionService;
import pe.gob.onpe.sceorcbackend.model.postgresql.dto.transmisioncargo.CargoTransmitidoDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.dto.transmisioncargo.TransmisionCargoReqDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.dto.transmisioncargo.TransmisionCargoRequestDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.dto.transmisioncargo.TransmisionResponseDto;
import pe.gob.onpe.sceorcbackend.utils.SceConstantes;

@Service
public class CargoTransmisionNacionHttpServiceImpl implements CargoTransmisionNacionHttpService {

	Logger logger = LoggerFactory.getLogger(CargoTransmisionNacionHttpServiceImpl.class);
	
	public static final String URL_NACION_RECIBIR_TRANSMISION ="transmision-cargo/recibir-transmision/";
	
	@Value("${sce.nacion.url}")
    private String urlNacion;
	
	private final RestTemplate clientExport;
	
	private final WebClient.Builder webClientBuilder;
	
	private final CargoTransmisionNacionService cargoTransmisionNacionService;
	
	public CargoTransmisionNacionHttpServiceImpl(
			RestTemplate clientExport,
			WebClient.Builder webClientBuilder,
			CargoTransmisionNacionService cargoTransmisionNacionService
			){
		this.clientExport = clientExport;
		this.webClientBuilder = webClientBuilder;
		this.cargoTransmisionNacionService = cargoTransmisionNacionService;
	}
	
	@Override
	public void sincronizar(Long idActa, String proceso, String usuario) {
		logger.info("El usuario {} inicio el registro de la transmision del cargo para la acta {} en el proceso {}", usuario, idActa, proceso);
		Long idTransmision = null;
		try {
			idTransmision = cargoTransmisionNacionService.guardarTransmision(idActa, usuario, proceso);
			if (idTransmision!=null && proceso != null) {
	            logger.info("Se realiza la sincronizacion: ");
	            this.tramsmitirActaAsync(idActa, idTransmision, proceso, usuario);
	        } else {
	            logger.info("No se realiza la sincronizacion del cargo");
	        }
		}catch (Exception e) {
			logger.error("Se genero un error al transmitir el cargo", e);
			if(idTransmision!=null){
				logger.info("Se genero un error al sincronizar la transmision del cargo, aun asi el id de la transmision {} se ha registrado", idTransmision);
			}
		}
	}

	@Override
	public void tramsmitirActa(Long idActa, String proceso, String usuario) {
		Optional<Acta> actaOp = this.cargoTransmisionNacionService.findByIdActa(idActa);
        logger.info("id acta transmitir: {}", idActa);
        if (actaOp.isPresent()) {

            List<CargoTransmisionNacion> actasTransmistidas = this.listarFaltantesTransmitir(idActa);
            this.cargoTransmisionNacionService.actualizarPreTransmision(actasTransmistidas, usuario);

            if (!actasTransmistidas.isEmpty()) {

            	TransmisionCargoRequestDto request = new TransmisionCargoRequestDto();
                request.setProceso(proceso);
                request.setCargosTransmitidos(adjuntar(mapperRequest(actasTransmistidas)));

                HttpEntity<TransmisionCargoRequestDto> httpEntity = new HttpEntity<>(request, getHeaderTransmision(proceso));

                ResponseEntity<TransmisionResponseDto> response = this.clientExport.exchange(
                		urlNacion + URL_NACION_RECIBIR_TRANSMISION, 
                		HttpMethod.PATCH, 
                		httpEntity, 
                		TransmisionResponseDto.class);

                processCargosTransmitidas(response);
            } else {
                logger.info("No se realizo ninguna transmision ya que no hay ningun cambio para transmitir.");
            }

        }
	}
	
	private void tramsmitirActaAsync(Long idActa, Long idTransmision, String proceso, String usuarioTransmision) {
		Optional<Acta> actaOp = this.cargoTransmisionNacionService.findByIdActa(idActa);
        if (actaOp.isPresent()) {

            Optional<CargoTransmisionNacion> cargoTransmitir = this.cargoTransmisionNacionService.findByIdTransmision(idTransmision);
            List<CargoTransmisionNacion> lista = new ArrayList<>();
            if(cargoTransmitir.isPresent()){
            	lista.add(cargoTransmitir.get());
            }

            this.cargoTransmisionNacionService.actualizarPreTransmision(lista, usuarioTransmision);

            if (cargoTransmitir.isPresent()) {
            	TransmisionCargoRequestDto request = new TransmisionCargoRequestDto();
                request.setProceso(proceso);
                request.setCargosTransmitidos(adjuntar(mapperRequest(lista)));

                HttpEntity<TransmisionCargoRequestDto> httpEntity = new HttpEntity<>(request, getHeaderTransmision(proceso));
                String url = urlNacion + URL_NACION_RECIBIR_TRANSMISION;
                webClientBuilder.build()
                        .method(HttpMethod.PATCH)
                        .uri(url)
                        .bodyValue(httpEntity.getBody())
                        .headers(headers -> headers.addAll(httpEntity.getHeaders()))
                        .retrieve()
                        .toEntity(TransmisionResponseDto.class)
                        .doOnSuccess(response -> processCargosTransmitidas(response))
                        .doOnError(ex -> logger.error("Error al realizar la llamada HTTP: {}.", ex.getMessage()))
                        .subscribe();
            } else {
                logger.info("No se realizo ninguna transmision ya que no hay ningun cambio para transmitir");
            }
        } else {
            logger.info("No se encontro el acta: {}.", idActa);
        }
	}
	
	@Transactional(readOnly = true)
    private List<TransmisionCargoReqDto> adjuntar(List<TransmisionCargoReqDto> cargosTransmistidas){
    	return this.cargoTransmisionNacionService.adjuntar(cargosTransmistidas);
    }
	
	@Transactional(readOnly = true)
    private List<TransmisionCargoReqDto> mapperRequest(List<CargoTransmisionNacion> cargosTransmistidas){
    	return this.cargoTransmisionNacionService.mapperRequest(cargosTransmistidas);
    }

	private HttpHeaders getHeaderTransmision(String proceso){
        HttpHeaders headers = new HttpHeaders();
        headers.set(SceConstantes.USERAGENT_HEADER, SceConstantes.USERAGENT_HEADER_VALUE);
        headers.set(SceConstantes.TENANT_HEADER, proceso);
        headers.set(SceConstantes.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        return headers;
    }
	
	@Transactional
    private void processCargosTransmitidas(ResponseEntity<TransmisionResponseDto> response){
        TransmisionResponseDto responseData = response.getBody();
        if (response.getStatusCode() == HttpStatus.OK) {
            logger.info("La llamada fue exitosa (código de estado 200)");
            if(responseData!=null) {
                this.actualizarPostTransmision(responseData.getCargosTransmitidos());
            }
        } else {
            logger.info("La llamada no fue exitosa. Código de estado: {}.", response.getStatusCode().value());
            if(responseData!=null) {
                this.actualizarPostTransmision(responseData.getCargosTransmitidos());
            }
        }
    }
	
	@Transactional
    private void actualizarPostTransmision(List<CargoTransmitidoDto> cargosTransmitidos){
    	this.cargoTransmisionNacionService.actualizarPostTransmision(cargosTransmitidos);
    }
	
	@Transactional(readOnly = true)
    private List<CargoTransmisionNacion> listarFaltantesTransmitir(Long idActa){
    	return this.cargoTransmisionNacionService.listarFaltantesTransmitir(idActa);
    }
    
}
