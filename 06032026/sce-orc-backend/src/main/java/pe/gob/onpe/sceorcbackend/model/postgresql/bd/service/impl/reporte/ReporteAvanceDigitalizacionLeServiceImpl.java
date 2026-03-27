package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl.reporte;

import lombok.extern.java.Log;
import net.sf.jasperreports.engine.JRException;
import org.springframework.stereotype.Service;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteAvanceDigitalizacionJasperDto;
import pe.gob.onpe.sceorcbackend.model.dto.request.ReporteMesasObservacionesRequestDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.reportes.IReporteAvanceDigitalizacionLeRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ITabLogService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.UtilSceService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.mapper.ReporteAvanceDigitalizacionMapper;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.reporte.IReporteAvanceDigitalizacionLeService;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;
import pe.gob.onpe.sceorcbackend.utils.ConstantesReportes;
import pe.gob.onpe.sceorcbackend.utils.TransactionalLogUtil;
import pe.gob.onpe.sceorcbackend.utils.funciones.Funciones;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Service
@Log
public class ReporteAvanceDigitalizacionLeServiceImpl implements IReporteAvanceDigitalizacionLeService {

    private final ITabLogService logService;
    private final IReporteAvanceDigitalizacionLeRepository reporteAvanceDigitalizacionLeRepository;
    private final UtilSceService utilSceService;
    private final ReporteAvanceDigitalizacionMapper reporteAvanceDigitalizacionMapper;

    public ReporteAvanceDigitalizacionLeServiceImpl(
            ITabLogService logService, IReporteAvanceDigitalizacionLeRepository reporteAvanceDigitalizacionLeRepository,
            UtilSceService utilSceService, ReporteAvanceDigitalizacionMapper reporteAvanceDigitalizacionMapper) {
        this.logService = logService;
        this.reporteAvanceDigitalizacionLeRepository = reporteAvanceDigitalizacionLeRepository;
        this.utilSceService = utilSceService;
        this.reporteAvanceDigitalizacionMapper = reporteAvanceDigitalizacionMapper;
    }

    @Override
    public byte[] reporteAvanceDigitalizacionLe(ReporteMesasObservacionesRequestDto filtro) throws JRException {
        Map<String, Object> parametrosReporte = new java.util.HashMap<>();
        String nombreReporte = "";
        InputStream imagen = this.getClass().getClassLoader().getResourceAsStream(ConstantesComunes.PATH_IMAGE_COMMON +  ConstantesComunes.NOMBRE_LOGO_ONPE);//logo onpe
        parametrosReporte.put("url_imagen", imagen);
        parametrosReporte.put("sinValorOficial", this.utilSceService.getSinValorOficial());

        List<ReporteAvanceDigitalizacionJasperDto> lista = reporteAvanceDigitalizacionMapper.toReporteAvanceDigitalizacionJasperDtoList(
                this.reporteAvanceDigitalizacionLeRepository.listarReporteAvanceDigitalizacionLe(filtro));
        nombreReporte = ConstantesComunes.REPORTE_AVANCE_DIGITALIZACION_LE_HA;
        parametrosReporte.put("tituloReporte", ConstantesReportes.TITULO_REPORTE_AVANCE_DIGITALIZACION_LE);
        parametrosReporte.put("reporte", ConstantesReportes.nameReporteAvanceDigitalizacionLe);
        parametrosReporte.put("departamento", filtro.getDepartamento());
        parametrosReporte.put("provincia", filtro.getProvincia());
        parametrosReporte.put("distrito", filtro.getDistrito());
        mapearCamposCabeceraReporte(filtro,parametrosReporte);

        this.logService.registrarLog(filtro.getUsuario(),
                Thread.currentThread().getStackTrace()[1].getMethodName(),
                this.getClass().getName(),
                TransactionalLogUtil.crearMensajeLog(ConstantesReportes.TITULO_REPORTE_AVANCE_DIGITALIZACION_LE),
                filtro.getCodigoCentroComputo(),
                0, 1);

        return Funciones.generarReporte(this.getClass(), lista, nombreReporte, parametrosReporte);
    }


    private void mapearCamposCabeceraReporte(
            ReporteMesasObservacionesRequestDto filtro, Map<String, Object> parametrosReporte) {

        parametrosReporte.put("proceso", filtro.getProceso());
        parametrosReporte.put("usuario", filtro.getUsuario());
        parametrosReporte.put("version", utilSceService.getVersionSistema());


    }
}
