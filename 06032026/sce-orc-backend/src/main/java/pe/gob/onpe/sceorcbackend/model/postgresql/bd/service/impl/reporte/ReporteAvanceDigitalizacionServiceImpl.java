package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl.reporte;

import org.hibernate.query.TypedParameterValue;
import org.hibernate.type.StandardBasicTypes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.AvanceDigitalizacionActasReporteDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.FiltroAvanceDigitalizacionDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.ActaRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ITabLogService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.UtilSceService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.reporte.ReporteAvanceDigitalizacionService;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;
import pe.gob.onpe.sceorcbackend.utils.funciones.Funciones;

import java.io.InputStream;
import java.net.InetAddress;
import java.util.List;
import java.util.Map;

@Service
public class ReporteAvanceDigitalizacionServiceImpl implements ReporteAvanceDigitalizacionService {

	Logger logger = LoggerFactory.getLogger(ReporteAvanceDigitalizacionServiceImpl.class);
	
	private final ActaRepository actasRepository;
	
	private final UtilSceService utilSceService;
	
	private final ITabLogService logService;

	public ReporteAvanceDigitalizacionServiceImpl(ActaRepository actasRepository,
			UtilSceService utilSceService, ITabLogService logService) {
		this.actasRepository = actasRepository;
		this.utilSceService = utilSceService;
		this.logService = logService;
	}
	
	@Override
	public byte[] reporteAvanceDigitalizacion(FiltroAvanceDigitalizacionDto filtro) {
		byte[] pdf = null;
		
		try {
			TypedParameterValue idEleccion = new TypedParameterValue(StandardBasicTypes.INTEGER, filtro.getIdEleccion());
			TypedParameterValue centroComputo = new TypedParameterValue(StandardBasicTypes.INTEGER, filtro.getCentroComputo());
			TypedParameterValue ubigeo = new TypedParameterValue(StandardBasicTypes.STRING, filtro.getUbigeo());
			
			List<Map<String, Object>> actasMap;
			if(!filtro.isSobreCeleste()) {
				actasMap = actasRepository
						.avanceDigitalizacion(filtro.getEsquema(), idEleccion, centroComputo, ubigeo);
			} else {
				actasMap = actasRepository
						.avanceDigitalizacionSobreCeleste(filtro.getEsquema(), idEleccion, centroComputo, ubigeo);
			}
			
			List<AvanceDigitalizacionActasReporteDto> actasLista = actasMap
					.parallelStream()
					.map( reporte -> {
						return AvanceDigitalizacionActasReporteDto
								.builder()
								.nombreEleccion((String) reporte.get("c_nombre_eleccion"))
								.departamento((String) reporte.get("c_departamento"))
								.provincia((String) reporte.get("c_provincia"))
								.distrito((String) reporte.get("c_distrito"))
								.codigoUbigeo((String) reporte.get("c_codigo_ubigeo"))
								.centroComputo((String) reporte.get("c_nombre_centro_computo"))
								.codigoCc((String) reporte.get("c_codigo_centro_computo"))
								.estadoDigitalizacion((String) reporte.get("c_estado_digitalizacion"))
								.mesa((String) reporte.get("c_mesa"))
								.build();
					}).toList();
			
			Map<String, Object> parametros = new java.util.HashMap<>();

			InputStream imagen = this.getClass().getClassLoader().getResourceAsStream(ConstantesComunes.PATH_IMAGE_COMMON + "onpe.jpg");
            parametros.put("imagen", imagen);
            parametros.put("sinvaloroficial", utilSceService.getSinValorOficial());
            parametros.put("version", utilSceService.getVersionSistema());
            parametros.put("servidor", InetAddress.getLocalHost().getHostName());
            parametros.put("usuario", filtro.getUsuario());
            parametros.put("tituloGeneral", filtro.getProceso());
			if(filtro.isSobreCeleste()){ parametros.put("sobre", "SOBRE CELESTE"); }

            String nombreReporte = ConstantesComunes.REPORTE_AVANCE_DIGITALIZACION_ACTAS;

			this.logService.registrarLog(filtro.getUsuario(), Thread.currentThread().getStackTrace()[1].getMethodName(),
					this.getClass().getSimpleName(), "Se consultó el Reporte de Avance estado de actas.",
					filtro.getCc(), ConstantesComunes.LOG_TRANSACCIONES_AUTORIZACION_NO, ConstantesComunes.LOG_TRANSACCIONES_ACCION);

			return Funciones.generarReporte(this.getClass(), actasLista, nombreReporte, parametros);

		} catch (Exception e) {
			logger.error(e.getMessage());
            return pdf;
        }
	}

	
	
}
