package pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.reportes;

import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteAvanceDigitalizacionLeDto;
import pe.gob.onpe.sceorcbackend.model.dto.request.ReporteMesasObservacionesRequestDto;

import java.util.List;

public interface IReporteAvanceDigitalizacionLeRepository {
    List<ReporteAvanceDigitalizacionLeDto> listarReporteAvanceDigitalizacionLe(ReporteMesasObservacionesRequestDto filtro);
}
