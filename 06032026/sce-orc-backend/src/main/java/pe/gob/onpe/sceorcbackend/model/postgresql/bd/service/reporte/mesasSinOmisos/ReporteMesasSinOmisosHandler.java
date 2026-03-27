package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.reporte.mesasSinOmisos;

import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteMesasSinOmisosRequestDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteMesasSinOmisosDto;
import java.util.List;

public interface ReporteMesasSinOmisosHandler {
    List<ReporteMesasSinOmisosDto> obtenerReporte(ReporteMesasSinOmisosRequestDto filtro);
    Integer getTipoReporteActorElectoral();
    String getTituloReporte();
}
