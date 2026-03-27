package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.reporte;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.hibernate.query.TypedParameterValue;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.stereotype.Service;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.FiltroPrecisionAsistAutomaControlDigitalizacionDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.PrecisionAsistAutomaControlDigitalizacionDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ITabLogService;
import pe.gob.onpe.sceorcbackend.utils.TransactionalLogUtil;
import pe.gob.onpe.sceorcbackend.utils.funciones.Funciones;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.reportes.IPrecisionAsistAutomaControlDigitalizacionRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.UtilSceService;

import java.io.InputStream;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import static pe.gob.onpe.sceorcbackend.utils.ConstantesReportes.*;

@Log4j2
@RequiredArgsConstructor
@Service
public class PrecisionAsistAutomaControlDigitalizacionServiceImpl implements IPrecisionAsistAutomaControlDigitalizacionService {

    private final IPrecisionAsistAutomaControlDigitalizacionRepository precisionAsistAutomaControlDigitalizacionRepository;
    private final ITabLogService logService;
    private final UtilSceService utilSceService;

    @Override
    public byte[]
    getPrecisionAsistAutomaControlDigitalizacion(FiltroPrecisionAsistAutomaControlDigitalizacionDto filtro) throws SQLException {
        //TypedParameterValue idEleccion = new TypedParameterValue(StandardBasicTypes.INTEGER, filtro.getIdEleccion());
        TypedParameterValue centroComputo = new TypedParameterValue(StandardBasicTypes.INTEGER, filtro.getIdCentroComputo());
        String reporte="porcentaje";
        if(filtro.getTipoReporte()==2){reporte="cifras";}
        try {
            String nombreReporte = REPORTE_PRECISION_ASISTENTE_AUTOMATIZADO_CONTROL_DIGITALIZACION;
            List<PrecisionAsistAutomaControlDigitalizacionDto> lista = this.precisionAsistAutomaControlDigitalizacionRepository.listaPrecisionAsistenteAutomatico(filtro);
            Map<String, Object> parametros = new java.util.HashMap<>();

            InputStream imagen = this.getClass().getClassLoader().getResourceAsStream(PATH_IMAGE_COMMON_NAC + "onpe.jpg");
            InputStream pixelTransparente = this.getClass().getClassLoader().getResourceAsStream(PATH_IMAGE_COMMON_NAC + "pixeltransparente.png");
            parametros.put(REPORT_PARAM_URL_IMAGE, imagen);
            parametros.put(REPORT_PARAM_PIXEL_TRANSPARENTE, pixelTransparente);
            parametros.put(REPORT_PARAM_SIN_VALOR_OFICIAL, utilSceService.getSinValorOficial(filtro.getIdProceso()));
            parametros.put(REPORT_PARAM_VERSION, utilSceService.getVersionSistema());
            parametros.put(REPORT_PARAM_USUARIO, filtro.getUsuario());
            parametros.put("tituloPrincipal", filtro.getProceso());
            parametros.put("centroComputo", filtro.getCentroComputo());
            parametros.put("eleccion", filtro.getEleccion());
            parametros.put("enCifras", filtro.getTipoReporte()==2?true:false);

            String cc = filtro.getIdCentroComputo()!=null?filtro.getIdCentroComputo().toString():"";

            this.logService.registrarLog(filtro.getUsuario(),Thread.currentThread().getStackTrace()[1].getMethodName(),
                    this.getClass().getName(), TransactionalLogUtil.crearMensajeLog("precisión asistente automático control digitalización en "+reporte),
                    cc, LOG_TRANSACCIONES_AUTORIZACION_NO, LOG_TRANSACCIONES_ACCION);

            return Funciones.generarReporte(this.getClass(), lista, nombreReporte, parametros);
        }catch(Exception e) {
            String msgError = "Error al registrar log de reporte de precisión asistente automático control digitalización en "+reporte+": ";
            log.error(msgError, e);
            return null;
        }
    }
}
