package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.reporte.mesasSinOmisos;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteMesasSinOmisosRequestDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.reportes.mesassinomisos.ReporteMesasSinOmisosMiembrosMesaRepository;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteMesasSinOmisosDto;
import pe.gob.onpe.sceorcbackend.utils.ConstantesReportes;

import java.util.List;
import java.util.Map;

@Getter
@Component
public class ReporteMesasSinOmisosElectoresHandler implements ReporteMesasSinOmisosHandler {

    @Autowired
    private ReporteMesasSinOmisosMiembrosMesaRepository repository;
    private final Integer tipoReporteActorElectoral = 1;
    private final String tituloReporte = ConstantesReportes.TITULO_REPORTE_MESAS_SIN_OMISOS_ELECTORES;

    @Override
    public List<ReporteMesasSinOmisosDto> obtenerReporte(ReporteMesasSinOmisosRequestDto filtro) {
        return this.repository.listarReporteMesasSinOmisosElectores(filtro.getEsquema(),
									filtro.getIdEleccion(),
									filtro.getIdCentroComputo())
							.stream()
							.map(this::llenarDatos).toList();
    }
    
    private ReporteMesasSinOmisosDto llenarDatos(Map<String, Object> mapMesa) {
        ReporteMesasSinOmisosDto reporte = new ReporteMesasSinOmisosDto();
        reporte.setCodigoUbigeo((String) mapMesa.get("c_codigo_ubigeo"));
        reporte.setCodigoODPE((String) mapMesa.get("c_codigo_odpe"));
        reporte.setCodigoCentroComputo((String) mapMesa.get("c_codigo_centro_computo"));
        reporte.setDepartamento((String) mapMesa.get("c_departamento"));
        reporte.setProvincia((String) mapMesa.get("c_provincia"));
        reporte.setDistrito((String) mapMesa.get("c_distrito"));
        reporte.setNumeroMesa((String) mapMesa.get("c_mesa"));
        reporte.setTotalMesas(((Number) mapMesa.get("n_mesas")).intValue());
        
        return reporte;
    }
}
