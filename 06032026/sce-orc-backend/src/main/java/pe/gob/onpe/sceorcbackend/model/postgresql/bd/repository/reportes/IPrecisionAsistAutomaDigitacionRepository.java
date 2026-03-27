package pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.reportes;

import pe.gob.onpe.sceorcbackend.model.dto.reporte.FiltroPrecisionAsistAutomaDigitacionDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.PrecisionAsistAutomaDigitacionDetalleDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.PrecisionAsistAutomaDigitacionResumenDto;

import java.util.List;

public interface IPrecisionAsistAutomaDigitacionRepository {
    public List<PrecisionAsistAutomaDigitacionResumenDto> listaPrecisionAsistAutomaResumen(FiltroPrecisionAsistAutomaDigitacionDto filtro);
    public List<PrecisionAsistAutomaDigitacionDetalleDto> listaPrecisionAsistAutomaDetalle(FiltroPrecisionAsistAutomaDigitacionDto filtro);
    public List<PrecisionAsistAutomaDigitacionDetalleDto> listaPrecisionAsistAutomaDetallePref(FiltroPrecisionAsistAutomaDigitacionDto filtro);
}
