package pe.gob.onpe.scebackend.model.orc.repository.reportes;

import pe.gob.onpe.scebackend.model.dto.reportes.FiltroPrecisionAsistAutomaControlDigitalizacionDto;
import pe.gob.onpe.scebackend.model.dto.reportes.PrecisionAsistAutomaControlDigitalizacionDto;

import java.sql.SQLException;
import java.util.List;

public interface IPrecisionAsistAutomaControlDigitalizacionRepository {

    public List<PrecisionAsistAutomaControlDigitalizacionDto> listaPrecisionAsistenteAutomatico(FiltroPrecisionAsistAutomaControlDigitalizacionDto filtro) throws SQLException;
}
