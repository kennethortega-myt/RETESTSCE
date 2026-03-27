package pe.gob.onpe.scebackend.model.service.impl.reporte;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.hibernate.query.TypedParameterValue;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.stereotype.Service;
import pe.gob.onpe.scebackend.model.dto.reportes.FiltroPrecisionAsistAutomaControlDigitalizacionDto;
import pe.gob.onpe.scebackend.model.dto.reportes.PrecisionAsistAutomaControlDigitalizacionDto;
import pe.gob.onpe.scebackend.model.orc.repository.reportes.IPrecisionAsistAutomaControlDigitalizacionRepository;
import pe.gob.onpe.scebackend.model.service.ITabLogTransaccionalService;
import pe.gob.onpe.scebackend.model.service.UtilSceService;
import pe.gob.onpe.scebackend.model.service.reporte.IPrecisionAsistAutomaControlDigitalizacionService;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;
import pe.gob.onpe.scebackend.utils.funciones.Funciones;

import java.io.InputStream;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import static pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes.*;

@Log4j2
@RequiredArgsConstructor
@Service
public class PrecisionAsistAutomaControlDigitalizacionServiceImpl implements IPrecisionAsistAutomaControlDigitalizacionService {

    private final IPrecisionAsistAutomaControlDigitalizacionRepository precisionAsistAutomaControlDigitalizacionRepository;
    private final ITabLogTransaccionalService logService;
    private final UtilSceService utilSceService;

    @Override
    public byte[] getPrecisionAsistAutomaControlDigitalizacion(FiltroPrecisionAsistAutomaControlDigitalizacionDto filtro) throws SQLException {
        //TypedParameterValue idEleccion = new TypedParameterValue(StandardBasicTypes.INTEGER, filtro.getIdEleccion());
        TypedParameterValue centroComputo = new TypedParameterValue(StandardBasicTypes.INTEGER, filtro.getIdCentroComputo());
        try {
            String nombreReporte = ConstantesComunes.REPORTE_PRECISION_ASISTENTE_AUTOMATIZADO_CONTROL_DIGITALIZACION;
            List<PrecisionAsistAutomaControlDigitalizacionDto> lista = this.precisionAsistAutomaControlDigitalizacionRepository.listaPrecisionAsistenteAutomatico(filtro);
            Map<String, Object> parametros = new java.util.HashMap<>();

            InputStream imagen = this.getClass().getClassLoader().getResourceAsStream(ConstantesComunes.PATH_IMAGE_COMMON_NAC + "onpe.jpg");
            InputStream pixelTransparente = this.getClass().getClassLoader().getResourceAsStream(PATH_IMAGE_COMMON_NAC + "pixel_transparente.png");
            parametros.put(REPORT_PARAM_URL_IMAGE, imagen);
            parametros.put(REPORT_PARAM_PIXEL_TRANSPARENTE, pixelTransparente);
            parametros.put(REPORT_PARAM_SIN_VALOR_OFICIAL, utilSceService.getSinValorOficial(filtro.getIdProceso()));
            parametros.put(REPORT_PARAM_VERSION, utilSceService.getVersionSistema());
            parametros.put(REPORT_PARAM_USUARIO, filtro.getUsuario());
            parametros.put("tituloPrincipal", filtro.getProceso());
            parametros.put("centroComputo", filtro.getCentroComputo());
            parametros.put("eleccion", filtro.getEleccion());
            parametros.put("enCifras", filtro.getTipoReporte()==2?true:false);

            String reporte="porcentaje";
            if(filtro.getTipoReporte()==2){reporte="cifras";}
            String cc = filtro.getIdCentroComputo()!=null?filtro.getIdCentroComputo().toString():"";

            this.logService.registrarLog(filtro.getUsuario(), ConstantesComunes.LOG_TRANSACCIONES_TIPO_REPORTE,
                    this.getClass().getSimpleName(), "Se consultó el reporte de precisión asistente automático control digitalización en "+reporte,
                    cc, filtro.getCentroComputoCod(), ConstantesComunes.LOG_TRANSACCIONES_AUTORIZACION_NO, ConstantesComunes.LOG_TRANSACCIONES_ACCION);

            return Funciones.generarReporte(this.getClass(), lista, nombreReporte, parametros);
        }catch(Exception e) {
            log.error("excepcion", e);
            return null;
        }
    }
}
