package pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.reportes;

import pe.gob.onpe.sceorcbackend.model.dto.reporte.FiltroPrecisionAsistAutomaControlDigitalizacionDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.PrecisionAsistAutomaControlDigitalizacionDto;

import java.sql.SQLException;
import java.util.List;

public interface IPrecisionAsistAutomaControlDigitalizacionRepository {

    public List<PrecisionAsistAutomaControlDigitalizacionDto> listaPrecisionAsistenteAutomatico(FiltroPrecisionAsistAutomaControlDigitalizacionDto filtro) throws SQLException;
}
