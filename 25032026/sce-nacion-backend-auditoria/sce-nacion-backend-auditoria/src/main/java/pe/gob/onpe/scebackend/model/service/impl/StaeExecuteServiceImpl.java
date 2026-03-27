package pe.gob.onpe.scebackend.model.service.impl;

import java.util.Date;
import java.util.List;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import pe.gob.onpe.scebackend.model.dto.response.GenericResponse;
import pe.gob.onpe.scebackend.model.service.StaeExecuteService;
import pe.gob.onpe.scebackend.model.service.StaeFileService;
import pe.gob.onpe.scebackend.model.service.StaeIntegrationService;
import pe.gob.onpe.scebackend.model.service.StaeService;
import pe.gob.onpe.scebackend.model.service.StaeTransforService;
import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralRequestDto;
import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralResponse;
import pe.gob.onpe.scebackend.model.stae.dto.ResultadoPs;
import pe.gob.onpe.scebackend.model.stae.dto.files.DocumentoElectoralDto;
import pe.gob.onpe.scebackend.multitenant.CurrentTenantId;
import pe.gob.onpe.scebackend.utils.SceConstantes;

@Service
public class StaeExecuteServiceImpl implements StaeExecuteService {

	static Logger logger = LoggerFactory.getLogger(StaeExecuteServiceImpl.class);
	
	@Autowired
	private StaeService staeService;
	
	@Autowired
	private StaeFileService staeFileService;
	
	@Autowired
	private StaeIntegrationService staeIntegrationService;
	
	@Autowired
	private StaeTransforService staeTransfService;


	@Value("${desarrollo.integracion}")
	private boolean desarrolloIntegracion;
	
	@Override
	public GenericResponse execute(String tentat, String esquema, ActaElectoralRequestDto actaDto, String username) {
		try {
			
			this.staeTransfService.completarInfo(actaDto);
			
			JSONObject jsonActa = new JSONObject(actaDto);
			

			
			
			ResultadoPs resultadopc = this.staeService.insertActaStae(
					esquema, 
					desarrolloIntegracion,
					jsonActa.toString(), 
					username);
			
			
			
			if (resultadopc.getPoResultado().equals(SceConstantes.ACTIVO)) {
				ActaElectoralResponse response = new ActaElectoralResponse();
				response.setEstadoActa(resultadopc.getPoEstadoActa());
				response.setEstadoCompu(resultadopc.getPoEstadoComputo());
				response.setEstadoActaResolucion(resultadopc.getPoEstadoActaResolucion());
				response.setEstadoErrorAritmetico(resultadopc.getPoEstadoErrorMaterial());
				GenericResponse genericResponse = new GenericResponse();
				genericResponse.setSuccess(Boolean.TRUE);
				genericResponse.setData(response);
				genericResponse.setMessage(resultadopc.getPoMensaje());
				return genericResponse;
			} else {
				GenericResponse genericResponse = new GenericResponse();
				genericResponse.setSuccess(Boolean.FALSE);
				genericResponse.setMessage(resultadopc.getPoMensaje());
				return genericResponse;
			}
			

		} catch (Exception e) {
			logger.error("Error en acta STAE", e);
			GenericResponse genericResponse = new GenericResponse();
			genericResponse.setSuccess(Boolean.FALSE);
			return genericResponse;
		}
	}

	@Override
	@Async
	public void executeAsync(String tentat, String esquema, ActaElectoralRequestDto actaDto, String username) {
		
		
		try {
			
			CurrentTenantId.set(tentat);
			
			this.staeTransfService.completarInfo(actaDto);
			
			logger.info("Inicio del proceso de crear el archivo {}:", new Date());
			
			List<DocumentoElectoralDto> archivos = staeFileService.crearArchivos(actaDto, username);
			
			logger.info("Fin del proceso de crear el archivo a las {}, se crearon {} archivos:", new Date(), archivos!=null ? archivos.size():0);
			
			logger.info("Inicio del envio a centro de computo {}:", new Date());
			
			this.staeIntegrationService.enviarActaOrc(actaDto, username, archivos);
			
			logger.info("Fin del envio a centro de computo {}:", new Date());


		} catch (Exception e) {
			logger.error("Error en acta STAE al crear el archivo o enviar a CC", e);
		} finally {
			CurrentTenantId.clear();
		}
	}

}
