package pe.gob.onpe.scebackend.model.orc.repository.reportes;


import pe.gob.onpe.scebackend.model.dto.request.reporte.ReporteMesasObservacionesRequestDto;
import pe.gob.onpe.scebackend.model.dto.response.reporte.ReporteAvanceDigitalizacionDenunciasDto;

import java.util.List;

public interface IReporteAvanceDigitalizacionDenunciasRepository {
    List<ReporteAvanceDigitalizacionDenunciasDto> listarReporteAvanceDigitalizacionDenuncia(ReporteMesasObservacionesRequestDto filtro);
}
