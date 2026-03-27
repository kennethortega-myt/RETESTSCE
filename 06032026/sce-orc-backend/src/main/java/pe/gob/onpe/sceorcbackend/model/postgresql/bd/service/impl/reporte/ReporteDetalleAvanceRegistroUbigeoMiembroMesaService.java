package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl.reporte;

import io.jsonwebtoken.Claims;
import lombok.extern.log4j.Log4j2;
import net.sf.jasperreports.engine.JRException;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteDetalleAvanceRegistroUbigeoRequestDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.ReporteDetalleAvanceRegistroUbigeoMiembroMesaRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ITabLogService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.UtilSceService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.reporte.IReporteDetalleAvanceRegistroUbigeoMiembroMesaService;
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
public class ReporteDetalleAvanceRegistroUbigeoMiembroMesaService implements IReporteDetalleAvanceRegistroUbigeoMiembroMesaService {

    private final ReporteDetalleAvanceRegistroUbigeoMiembroMesaRepository reporteDetalleAvanceRegistroUbigeoMiembroMesaRepository;
    private final ITabLogService logService;
    private final TokenDecoder tokenDecoder;
    private final UtilSceService utilSceService;

    @Value("${spring.jpa.properties.hibernate.default_schema}")
    private String schema;

    public ReporteDetalleAvanceRegistroUbigeoMiembroMesaService(
            ReporteDetalleAvanceRegistroUbigeoMiembroMesaRepository reporteDetalleAvanceRegistroUbigeoMiembroMesaRepository,
            ITabLogService logService,
            TokenDecoder tokenDecoder,
            UtilSceService utilSceService) {
        this.reporteDetalleAvanceRegistroUbigeoMiembroMesaRepository = reporteDetalleAvanceRegistroUbigeoMiembroMesaRepository;
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

            List<ReporteDetalleAvanceRegistroUbigeoProjection> lista = reporteDetalleAvanceRegistroUbigeoMiembroMesaRepository.listarReporteAvanceRegistroUbigeo(
                    filtro.getEsquema(), filtro.getIdAmbitoElectoral(), filtro.getIdCentroComputo(), filtro.getUbigeo()
            );
            log.info("Ordenando {} registros para el reporte de avance por ubigeo", lista.size());
            lista.sort((a, b) -> {
                int centroCmp = compareNullSafe(a.getCodigoCentroComputo(), b.getCodigoCentroComputo());
                if (centroCmp != 0) return centroCmp;
                int ubigeoCmp = compareNullSafe(a.getCodigoUbigeo(), b.getCodigoUbigeo());
                if (ubigeoCmp != 0) return ubigeoCmp;
                int procesadaOrder_a = "Procesada".equals(a.getProcesada()) ? 1 : 2;
                int procesadaOrder_b = "Procesada".equals(b.getProcesada()) ? 1 : 2;
                int procesadaCmp = Integer.compare(procesadaOrder_a, procesadaOrder_b);
                if (procesadaCmp != 0) return procesadaCmp;
                return compareNullSafe(a.getMesa(), b.getMesa());
            });
            if (log.isDebugEnabled()) {
                log.debug("=== ORDEN DESPUÉS DEL SORT ===");
                lista.stream()
                    .filter(item -> "020201".equals(item.getCodigoUbigeo())) // Solo AIJA para debug
                    .forEach(item -> log.debug("AIJA: {} - Mesa: {}", item.getProcesada(), item.getMesa()));
            }

            Map<String, Object> parametros = new java.util.HashMap<>();
            parametros.put("tituloGeneral", filtro.getProceso());
            parametros.put("tituloRep", "DETALLE DE AVANCE DE REGISTROS POR UBIGEO (SOLO MIEMBROS)");
            parametros.put("sinValorOficial", utilSceService.getSinValorOficial());
            parametros.put("versionSuite", utilSceService.getVersionSistema());
            parametros.put("usuario", filtro.getUsuario());
            parametros.put("nombreReporte", "DetalleAvanceRegistroUbigeoMiembroMesa");

            InputStream imagen = this.getClass().getClassLoader().getResourceAsStream(ConstantesComunes.PATH_IMAGE_COMMON + ConstantesComunes.REPORT_PARAM_IMAGEN_ONPE);
            parametros.put("logo_onpe", imagen);

            String nombreReporteFisico = ConstantesComunes.REPORTE_DETALLE_AVANCE_REGISTRO_UBIGEO;
            String token = authorization.substring(SceConstantes.LENGTH_BEARER);
            Claims claims = this.tokenDecoder.decodeToken(token);
            String usuarioLoginCentroComputo = claims.get("ccc", String.class);
            String usuarioLogin = claims.get("usr", String.class);

            this.logService.registrarLog(usuarioLogin, Thread.currentThread().getStackTrace()[1].getMethodName(),
                this.getClass().getSimpleName(), "Se consultó el Reporte Detalle de Avance de Registros por Ubigeo Miembros de Mesa",
                usuarioLoginCentroComputo, ConstantesComunes.LOG_TRANSACCIONES_AUTORIZACION_NO, ConstantesComunes.LOG_TRANSACCIONES_ACCION);

            return Funciones.generarReporte(this.getClass(), lista, nombreReporteFisico, parametros);

        } catch (Exception e) {
            log.error("Error al generar reporte de avance por ubigeo: {}", ExceptionUtils.getStackTrace(e));
        }
        return new byte[0];
    }

    private int compareNullSafe(String a, String b) {
        if (a == null && b == null) return 0;
        if (a == null) return -1;
        if (b == null) return 1;
        return a.compareTo(b);
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
