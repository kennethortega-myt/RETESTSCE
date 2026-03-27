package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.reporte.mesasSinOmisos;

import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JRException;
import org.springframework.stereotype.Service;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteMesasSinOmisosJasperDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteMesasSinOmisosRequestDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ITabLogService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.UtilSceService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.mapper.ReporteMesasSinOmisosMapper;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;
import pe.gob.onpe.sceorcbackend.utils.funciones.Funciones;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class ReporteMesasSinOmisosService implements IReporteMesasSinOmisosService {

    private final ReporteMesasSinOmisosMapper reporteMesasSinOmisosMapper;
    private final ITabLogService logService;
    private final ReporteMesasSinOmisosHandlerFactory reporteMesasSinOmisosHandlerFactory;
    private final UtilSceService utilSceService;

    public ReporteMesasSinOmisosService(ReporteMesasSinOmisosMapper reporteMesasSinOmisosMapper, 
                                       ITabLogService logService, 
                                       ReporteMesasSinOmisosHandlerFactory reporteMesasSinOmisosHandlerFactory, 
                                       UtilSceService utilSceService) {
        this.reporteMesasSinOmisosMapper = reporteMesasSinOmisosMapper;
        this.logService = logService;
        this.reporteMesasSinOmisosHandlerFactory = reporteMesasSinOmisosHandlerFactory;
        this.utilSceService = utilSceService;
    }

    @Override
    public byte[] reporteMesasSinOmisos(ReporteMesasSinOmisosRequestDto filtro) throws JRException {
        List<ReporteMesasSinOmisosJasperDto> lista;
        Map<String, Object> parametrosReporte = new java.util.HashMap<>();
        String nombreReporte = "";
        InputStream imagen = this.getClass().getClassLoader().getResourceAsStream(ConstantesComunes.PATH_IMAGE_COMMON + ConstantesComunes.NOMBRE_LOGO_ONPE);
        parametrosReporte.put("url_imagen", imagen);
        parametrosReporte.put("sinValorOficial", this.utilSceService.getSinValorOficial());

        ReporteMesasSinOmisosHandler handler = reporteMesasSinOmisosHandlerFactory.getHandler(filtro);

        lista = reporteMesasSinOmisosMapper.toMesasSinOmisosJasperDtoList(handler.obtenerReporte(filtro));
        parametrosReporte.put("tipoReporteActorElectoral", handler.getTipoReporteActorElectoral());
        parametrosReporte.put("tituloReporte", handler.getTituloReporte());

        nombreReporte = ConstantesComunes.REPORTE_MESAS_SIN_OMISOS;
        mapearCamposCabeceraReporte(filtro, parametrosReporte);

        this.logService.registrarLog(filtro.getUsuario(),
                                    Thread.currentThread().getStackTrace()[1].getMethodName(),
                                    this.getClass().getName(),
                                    createLogMessage(handler.getTituloReporte()),
                                    filtro.getCodigoCentroComputo(),
                                    0, 1);

        return Funciones.generarReporte(this.getClass(), lista, nombreReporte, parametrosReporte);
    }

    private void mapearCamposCabeceraReporte(ReporteMesasSinOmisosRequestDto filtro, Map<String, Object> parametrosReporte) {
        parametrosReporte.put("proceso", filtro.getProceso());
        parametrosReporte.put("usuario", filtro.getUsuario());
        parametrosReporte.put("version", utilSceService.getVersionSistema());
        parametrosReporte.put("tituloEleccionCompleto", "");
    }

    private String createLogMessage(String tituloReporte) {
        return "Generando reporte: " + tituloReporte;
    }
}
