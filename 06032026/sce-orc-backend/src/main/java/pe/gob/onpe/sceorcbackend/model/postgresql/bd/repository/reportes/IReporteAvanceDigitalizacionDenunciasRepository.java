package pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.reportes;

import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteAvanceDigitalizacionDenunciasDto;
import pe.gob.onpe.sceorcbackend.model.dto.request.ReporteMesasObservacionesRequestDto;

import java.util.List;

public interface IReporteAvanceDigitalizacionDenunciasRepository {
    List<ReporteAvanceDigitalizacionDenunciasDto> listarReporteAvanceDigitalizacionDenuncia(ReporteMesasObservacionesRequestDto filtro);
}
