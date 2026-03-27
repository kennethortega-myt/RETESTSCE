package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl.reporte;

import io.jsonwebtoken.Claims;
import lombok.extern.log4j.Log4j2;
import net.sf.jasperreports.engine.JRException;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteDetalleAvanceRegistroUbigeoRequestDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.ReporteDetalleAvanceRegistroUbigeoRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ITabLogService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.UtilSceService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.reporte.IReporteDetalleAvanceRegistroUbigeoService;
import pe.gob.onpe.sceorcbackend.model.postgresql.projection.ReporteDetalleAvanceRegistroUbigeoProjection;
import pe.gob.onpe.sceorcbackend.security.TokenDecoder;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;
import pe.gob.onpe.sceorcbackend.utils.SceConstantes;
import pe.gob.onpe.sceorcbackend.utils.funciones.Funciones;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@Log4j2
@Service
public class ReporteDetalleAvanceRegistroUbigeoService implements IReporteDetalleAvanceRegistroUbigeoService {


    private final ReporteDetalleAvanceRegistroUbigeoRepository reporteDetalleAvanceRegistroUbigeoRepository;
    private final ITabLogService logService;
    private final TokenDecoder tokenDecoder;
    private final UtilSceService utilSceService;

    @Value("${spring.jpa.properties.hibernate.default_schema}")
    private String schema;

    public ReporteDetalleAvanceRegistroUbigeoService(
            ReporteDetalleAvanceRegistroUbigeoRepository reporteDetalleAvanceRegistroUbigeoRepository,
            ITabLogService logService,
            TokenDecoder tokenDecoder,
            UtilSceService utilSceService) {
        this.reporteDetalleAvanceRegistroUbigeoRepository = reporteDetalleAvanceRegistroUbigeoRepository;
        this.logService = logService;
        this.tokenDecoder = tokenDecoder;
        this.utilSceService = utilSceService;
    }


    @Override
    public byte[] reporte(ReporteDetalleAvanceRegistroUbigeoRequestDto filtro, String authorization) throws JRException, SQLException {

        try {

            String ubigeo = obtenerUbigeo(filtro.getUbigeoNivelUno(), filtro.getUbigeoNivelDos(), filtro.getUbigeoNivelTres());
            filtro.setUbigeo(ubigeo);
            filtro.setEsquema(schema);

            List<ReporteDetalleAvanceRegistroUbigeoProjection> lista = reporteDetalleAvanceRegistroUbigeoRepository.listarReporteAvanceRegistroUbigeo(
                    filtro.getEsquema(), filtro.getIdAmbitoElectoral(), filtro.getIdCentroComputo(), filtro.getUbigeo());
            Map<String, Object> parametros = new java.util.HashMap<>();
            parametros.put("tituloGeneral", filtro.getProceso());
            parametros.put("tituloRep", "DETALLE DE AVANCE DE REGISTROS POR UBIGEO (SOLO VOTANTES)");
            parametros.put("sinValorOficial", utilSceService.getSinValorOficial());
            parametros.put("versionSuite", utilSceService.getVersionSistema());
            parametros.put("usuario", filtro.getUsuario());
            parametros.put("nombreReporte", "DetalleAvanceRegistroUbigeo");
            InputStream imagen = this.getClass().getClassLoader().getResourceAsStream(ConstantesComunes.PATH_IMAGE_COMMON  + ConstantesComunes.REPORT_PARAM_IMAGEN_ONPE);//logo onpe

            parametros.put("logo_onpe", imagen);

            String nombreReporteFisico = ConstantesComunes.REPORTE_DETALLE_AVANCE_REGISTRO_UBIGEO;

            String token = authorization.substring(SceConstantes.LENGTH_BEARER);
            Claims claims = this.tokenDecoder.decodeToken(token);
            String usuarioLoginCentroComputo = claims.get("ccc", String.class);
            String usuarioLogin = claims.get("usr", String.class);


            this.logService.registrarLog(usuarioLogin, Thread.currentThread().getStackTrace()[1].getMethodName(),
                    this.getClass().getSimpleName(), "Se consultó el Reporte Detalle de Avance de Registros por Ubigeo",
                    usuarioLoginCentroComputo, ConstantesComunes.LOG_TRANSACCIONES_AUTORIZACION_NO, ConstantesComunes.LOG_TRANSACCIONES_ACCION);

            return Funciones.generarReporte(this.getClass(), lista, nombreReporteFisico, parametros);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return new byte[0];
    }

    private String obtenerUbigeo(String ubigeoNivelUno,String ubigeoNivelDos,String ubigeoNivelTres) {
        String ubigeRetorno = SceConstantes.UBIGEO_NACION;
        if(!SceConstantes.UBIGEO_NACION.equals(ubigeoNivelTres)) {
            ubigeRetorno = ubigeoNivelTres;
        }
        else if(!SceConstantes.UBIGEO_NACION.equals(ubigeoNivelDos)) {
            ubigeRetorno = ubigeoNivelDos;
        }
        else if(!SceConstantes.UBIGEO_NACION.equals(ubigeoNivelUno)) {
            ubigeRetorno = ubigeoNivelUno;
        }
        return ubigeRetorno;
    }
}
