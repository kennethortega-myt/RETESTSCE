package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.reporte.mesasSinOmisos;

import net.sf.jasperreports.engine.JRException;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteMesasSinOmisosRequestDto;

public interface IReporteMesasSinOmisosService {
    byte[] reporteMesasSinOmisos(ReporteMesasSinOmisosRequestDto filtro) throws JRException;
}
