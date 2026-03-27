package pe.gob.onpe.scebackend.model.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.net.InetAddress;
import java.util.List;
import java.util.Map;

import org.hibernate.query.TypedParameterValue;
import org.hibernate.type.StandardBasicTypes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.export.JRPdfExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import pe.gob.onpe.scebackend.model.dto.AutoridadReporteDto;
import pe.gob.onpe.scebackend.model.dto.FiltroOrganizacionesPoliticasDto;
import pe.gob.onpe.scebackend.model.orc.repository.CandidatoRepository;
import pe.gob.onpe.scebackend.model.service.AutoridadReporteService;
import pe.gob.onpe.scebackend.model.service.ITabLogTransaccionalService;
import pe.gob.onpe.scebackend.model.service.UtilSceService;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;
import pe.gob.onpe.scebackend.utils.JasperReportUtil;

@Service
public class AutoridadReporteServiceImpl implements AutoridadReporteService{

	Logger logger = LoggerFactory.getLogger(AutoridadReporteServiceImpl.class);
	
	private final CandidatoRepository candidatoRepository;
	private final ITabLogTransaccionalService logService;
	private final UtilSceService utilSceService;
	
	public AutoridadReporteServiceImpl(CandidatoRepository candidatoRepository, ITabLogTransaccionalService logService, UtilSceService utilSceService) {
		this.candidatoRepository = candidatoRepository;
		this.logService = logService;
		this.utilSceService = utilSceService;
	}
	
	@Override
	public byte[] reporteAutoridadesEnConsulta(FiltroOrganizacionesPoliticasDto filtro) {
	
		byte[] pdf = null;
		
		try {
			TypedParameterValue idEleccion = new TypedParameterValue(StandardBasicTypes.INTEGER, filtro.getIdEleccion());
			TypedParameterValue centroComputo = new TypedParameterValue(StandardBasicTypes.STRING, filtro.getCentroComputo());
			
			List<Map<String, Object>> autoridadesMap = candidatoRepository
					.autoridadesEnConsulta(filtro.getSchema(), idEleccion, centroComputo);
			
			List<AutoridadReporteDto> autoridades = autoridadesMap
					.parallelStream()
					.map( reporte ->
						 AutoridadReporteDto
								.builder()
								.codigoEleccion(Integer.parseInt("" + reporte.get("c_tipo_eleccion")))
								.eleccion((String) reporte.get("c_nombre_eleccion"))
								.departamento((String) reporte.get("c_departamento"))
								.provincia((String) reporte.get("c_provincia"))
								.distrito((String) reporte.get("c_distrito"))
								.ubigeo((String) reporte.get("c_codigo_ubigeo"))
								.cargo((String) reporte.get("c_cargo"))
								.apellidoPaterno((String) reporte.get("c_apellido_paterno"))
								.apellidoMaterno((String) reporte.get("c_apellido_materno"))
								.nombreCandidato((String) reporte.get("c_nombres"))
								.build()
					).toList();
			
			Map<String, Object> parametros = new java.util.HashMap<>();


			InputStream imagen = this.getClass().getClassLoader().getResourceAsStream(ConstantesComunes.PATH_IMAGE_COMMON_NAC + "onpe.jpg");
            parametros.put("logo_onpe", imagen);
            parametros.put("sinvaloroficial", utilSceService.getSinValorOficial(filtro.getIdProceso()));
            parametros.put("version", utilSceService.getVersionSistema());
            parametros.put("servidor", InetAddress.getLocalHost().getHostName());
            parametros.put("usuario", filtro.getUsuario());
            parametros.put("tituloGeneral", filtro.getProceso());
            parametros.put("centroComputo", filtro.getCcDescripcion());
            
            InputStream file = this.getClass().getClassLoader().getResourceAsStream(
                    ConstantesComunes.PATH_REPORT_JRXML + File.separator + ConstantesComunes.AUTORIDADES_EN_CONSULTA);
            
        	this.logService.registrarLog(filtro.getUsuario(), ConstantesComunes.LOG_TRANSACCIONES_TIPO_REPORTE, this.getClass().getSimpleName(), 
        	"Se consultó el Reporte de Autoridades en Consulta",
        			ConstantesComunes.CC_NACION_DESCRIPCION, "C56000", ConstantesComunes.LOG_TRANSACCIONES_AUTORIZACION_NO, 
        			ConstantesComunes.LOG_TRANSACCIONES_ACCION);
            
            if (autoridades != null && !autoridades.isEmpty()) {
                JasperPrint jasperPrint = JasperReportUtil.getJasperPrint(parametros, autoridades, file);
                JRPdfExporter jrPdfExporter = new JRPdfExporter();
                ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                jrPdfExporter.setExporterInput(new SimpleExporterInput(jasperPrint));
                jrPdfExporter.setExporterOutput(new SimpleOutputStreamExporterOutput(byteArrayOutputStream));
                jrPdfExporter.exportReport();
                pdf = byteArrayOutputStream.toByteArray();
                return pdf;
            } else {
                return pdf;
            }
            
		} catch (Exception e) {
			logger.error("Error al generar el reporte de autoridades en consulta", e);
            return pdf;
        }
		
	}
}
