package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl.reporte;

import lombok.extern.java.Log;
import net.sf.jasperreports.engine.JRException;
import org.springframework.stereotype.Service;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteAvanceDigitalizacionJasperDto;
import pe.gob.onpe.sceorcbackend.model.dto.request.ReporteMesasObservacionesRequestDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.reportes.IReporteAvanceDigitalizacionDenunciasRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ITabLogService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.UtilSceService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.mapper.ReporteAvanceDigitalizacionDenunciasMapper;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.reporte.IReporteAvanceDigitalizacionDenunciasService;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;
import pe.gob.onpe.sceorcbackend.utils.ConstantesReportes;
import pe.gob.onpe.sceorcbackend.utils.TransactionalLogUtil;
import pe.gob.onpe.sceorcbackend.utils.funciones.Funciones;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Service
@Log
public class ReporteAvanceDigitalizacionDenunciasServiceImpl implements IReporteAvanceDigitalizacionDenunciasService {

    private final ITabLogService logService;
    private final IReporteAvanceDigitalizacionDenunciasRepository reporteAvanceDigitalizacionDenunciasRepository;
    private final UtilSceService utilSceService;
    private final ReporteAvanceDigitalizacionDenunciasMapper reporteAvanceDigitalizacionDenunciasMapper;

    public ReporteAvanceDigitalizacionDenunciasServiceImpl(
            ITabLogService logService, IReporteAvanceDigitalizacionDenunciasRepository reporteAvanceDigitalizacionDenunciasRepository,
            UtilSceService utilSceService, ReporteAvanceDigitalizacionDenunciasMapper reporteAvanceDigitalizacionDenunciasMapper) {
        this.logService = logService;
        this.reporteAvanceDigitalizacionDenunciasRepository = reporteAvanceDigitalizacionDenunciasRepository;
        this.utilSceService = utilSceService;
        this.reporteAvanceDigitalizacionDenunciasMapper = reporteAvanceDigitalizacionDenunciasMapper;
    }

    @Override
    public byte[] reporteAvanceDigitalizacionDenuncias(ReporteMesasObservacionesRequestDto filtro) throws JRException {
        Map<String, Object> parametrosReporte = new java.util.HashMap<>();
        String nombreReporte = "";
        InputStream imagen = this.getClass().getClassLoader().getResourceAsStream(ConstantesComunes.PATH_IMAGE_COMMON +  ConstantesComunes.NOMBRE_LOGO_ONPE);//logo onpe
        parametrosReporte.put("url_imagen", imagen);
        parametrosReporte.put("sinValorOficial", this.utilSceService.getSinValorOficial());

        List<ReporteAvanceDigitalizacionJasperDto> lista = reporteAvanceDigitalizacionDenunciasMapper.toReporteAvanceDigitalizacionJasperDtoList(
                reporteAvanceDigitalizacionDenunciasRepository.listarReporteAvanceDigitalizacionDenuncia(filtro));
        nombreReporte = ConstantesComunes.REPORTE_AVANCE_DIGITALIZACION_LE_HA;
        parametrosReporte.put("tituloReporte", ConstantesReportes.TITULO_REPORTE_AVANCE_DIGITALIZACION_DENUNCIAS);
        parametrosReporte.put("reporte", ConstantesReportes.nameReporteAvanceDigitalizacionDenuncias);
        parametrosReporte.put("departamento", filtro.getDepartamento());
        parametrosReporte.put("provincia", filtro.getProvincia());
        parametrosReporte.put("distrito", filtro.getDistrito());
        mapearCamposCabeceraReporte(filtro,parametrosReporte);

        this.logService.registrarLog(filtro.getUsuario(), Thread.currentThread().getStackTrace()[1].getMethodName(),
                this.getClass().getSimpleName(), "Se consultó el Reporte de Avance de Digitalización de Denuncias.", filtro.getCodigoCentroComputo(), ConstantesComunes.LOG_TRANSACCIONES_AUTORIZACION_NO, ConstantesComunes.LOG_TRANSACCIONES_ACCION);

        return Funciones.generarReporte(this.getClass(), lista, nombreReporte, parametrosReporte);
    }


    private void mapearCamposCabeceraReporte(
            ReporteMesasObservacionesRequestDto filtro, Map<String, Object> parametrosReporte) {

        parametrosReporte.put("proceso", filtro.getProceso());
        parametrosReporte.put("usuario", filtro.getUsuario());
        parametrosReporte.put("version", utilSceService.getVersionSistema());
        parametrosReporte.put("tituloEleccionCompleto", filtro.getEleccion());
    }


}
