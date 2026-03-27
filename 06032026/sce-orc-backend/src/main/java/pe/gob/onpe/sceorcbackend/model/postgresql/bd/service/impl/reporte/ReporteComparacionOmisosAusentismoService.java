package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl.reporte;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import net.sf.jasperreports.engine.JRException;
import org.springframework.stereotype.Service;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteComparacionOmisosAusentismoDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteComparacionOmisosAusentismoRequestDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.reportes.ReporteComparacionOmisosAusentismoRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ITabLogService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.UtilSceService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.reporte.IReporteComparacionOmisosAusentismoService;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;
import pe.gob.onpe.sceorcbackend.utils.ConstantesReportes;
import pe.gob.onpe.sceorcbackend.utils.TransactionalLogUtil;
import pe.gob.onpe.sceorcbackend.utils.funciones.Funciones;


import java.io.InputStream;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
@Log
public class ReporteComparacionOmisosAusentismoService implements IReporteComparacionOmisosAusentismoService {

    private final ITabLogService logService;
    private final ReporteComparacionOmisosAusentismoRepository reporteComparacionOmisosAusentismoRepository;
    private final UtilSceService utilSceService;

    @Override
    public byte[] reporteComparacionOmisosAusentismo(ReporteComparacionOmisosAusentismoRequestDto filtro) throws JRException{
        List<ReporteComparacionOmisosAusentismoDto> lista;
        Map<String, Object> parametrosReporte = new java.util.HashMap<>();
        String nombreReporte = "";
        InputStream imagen = this.getClass().getClassLoader().getResourceAsStream(ConstantesComunes.PATH_IMAGE_COMMON +  ConstantesComunes.NOMBRE_LOGO_ONPE);//logo onpe
        parametrosReporte.put("url_imagen", imagen);
        parametrosReporte.put("sinValorOficial", this.utilSceService.getSinValorOficial());

        lista = this.reporteComparacionOmisosAusentismoRepository
		        		.listarReporteComparacionOmisosAusentismo(filtro.getEsquema(),
								filtro.getIdAmbito(),
								filtro.getIdCentroComputo())
						.stream()
						.map(this::llenarDatos).toList();
        
        parametrosReporte.put("tituloReporte", ConstantesComunes.TITULO_REPORTE_COMPARACION_OMISOS_AUSENTISMO);

        nombreReporte = ConstantesComunes.REPORTE_COMPARACION_OMISOS_AUSENTISMO;
        parametrosReporte.put("reporte", ConstantesReportes.nameReporteComparacionOmisosAusentismo);

        mapearCamposCabeceraReporte(filtro, parametrosReporte);

        this.logService.registrarLog(filtro.getUsuario(),
                Thread.currentThread().getStackTrace()[1].getMethodName(),
                this.getClass().getName(),
                TransactionalLogUtil.crearMensajeLog(ConstantesComunes.TITULO_REPORTE_COMPARACION_OMISOS_AUSENTISMO),
                filtro.getCodigoCentroComputo(),
                0, 1);

        return Funciones.generarReporte(this.getClass(), lista, nombreReporte, parametrosReporte);
    }


    private void mapearCamposCabeceraReporte(
            ReporteComparacionOmisosAusentismoRequestDto filtro, Map<String, Object> parametrosReporte) {

        parametrosReporte.put("proceso", filtro.getProceso());
        parametrosReporte.put("usuario", filtro.getUsuario());
        parametrosReporte.put("version", utilSceService.getVersionSistema());
        parametrosReporte.put("tituloEleccionCompleto", "");
        parametrosReporte.put("tipoComparacion", "Todos");

    }
    
    private ReporteComparacionOmisosAusentismoDto llenarDatos(Map<String, Object> mapCompara) {
        ReporteComparacionOmisosAusentismoDto reporte = new ReporteComparacionOmisosAusentismoDto();
        Long votOmisos = (Long) mapCompara.get("n_votantes_omisos");
        
        reporte.setCodiDesCompu((String) mapCompara.get("c_codigo_centro_computo"));
        reporte.setCodiDesOdpe((String) mapCompara.get("c_codigo_ambito_electoral"));
        reporte.setCodigoUbigeo((String) mapCompara.get("c_codigo_ubigeo"));
        reporte.setDescDepartamento((String) mapCompara.get("c_departamento"));
        reporte.setDescProvincia((String) mapCompara.get("c_provincia"));
        reporte.setDescDistrito((String) mapCompara.get("c_distrito"));
        reporte.setCodiLocal((String) mapCompara.get("c_codigo_local"));
        reporte.setNombLocal((String) mapCompara.get("c_nombre_local"));
        reporte.setDirLocal((String) mapCompara.get("c_direccion"));
        reporte.setNumeroMesa((String) mapCompara.get("c_mesa"));
        reporte.setNroMesaOmisa((Integer) mapCompara.get("n_mesa_omisa"));
        reporte.setVotantesHabiles((Integer) mapCompara.get("n_votantes_habiles"));
        reporte.setVotantesAusentes((Integer) mapCompara.get("n_votantes_ausentes"));
        reporte.setVotantesOmisos(votOmisos.intValue());
        
        return reporte;
    }
}
