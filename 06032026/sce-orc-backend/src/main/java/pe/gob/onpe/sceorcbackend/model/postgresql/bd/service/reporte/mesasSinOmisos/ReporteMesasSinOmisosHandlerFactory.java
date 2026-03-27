package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.reporte.mesasSinOmisos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteMesasSinOmisosRequestDto;

@Component
public class ReporteMesasSinOmisosHandlerFactory {

    @Autowired
    private ReporteMesasSinOmisosElectoresHandler reporteMesasSinOmisosElectoresHandler;
    @Autowired
    private ReporteMesasSinOmisosMiembrosMesaHandler reporteMesasSinOmisosMiembrosMesaHandler;

    public ReporteMesasSinOmisosHandler getHandler(ReporteMesasSinOmisosRequestDto filtro) {
        if (filtro.getTipoReporteActorElectoral() == 1) {
            return reporteMesasSinOmisosElectoresHandler;
        } else if (filtro.getTipoReporteActorElectoral() == 2) {
            return reporteMesasSinOmisosMiembrosMesaHandler;
        } else {
            throw new IllegalArgumentException("Tipo de reporte no soportado");
        }
    }
}
