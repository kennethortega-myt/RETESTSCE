package pe.gob.onpe.scebackend.model.orc.repository.reportes;

import pe.gob.onpe.scebackend.model.dto.request.reporte.ReporteDetalleAvanceRegistroUbigeoRequestDto;
import pe.gob.onpe.scebackend.model.dto.response.reporte.ReporteDetalleAvanceRegistroUbigeoDto;

import java.sql.SQLException;
import java.util.List;

public interface IReporteDetalleAvanceRegistroUbigeoRepository {
    List<ReporteDetalleAvanceRegistroUbigeoDto> listarReporteDetalleAvanceRegistroUbigeoMiembroMesa(ReporteDetalleAvanceRegistroUbigeoRequestDto filtro) throws SQLException;
    List<ReporteDetalleAvanceRegistroUbigeoDto> listarReporteDetalleAvanceRegistroUbigeoElector(ReporteDetalleAvanceRegistroUbigeoRequestDto filtro) throws SQLException;
}
