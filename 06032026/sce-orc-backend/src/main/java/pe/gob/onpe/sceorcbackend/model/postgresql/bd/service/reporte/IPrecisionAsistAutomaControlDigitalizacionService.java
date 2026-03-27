package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.reporte;

import pe.gob.onpe.sceorcbackend.model.dto.reporte.FiltroPrecisionAsistAutomaControlDigitalizacionDto;

import java.sql.SQLException;

public interface IPrecisionAsistAutomaControlDigitalizacionService {
    byte[] getPrecisionAsistAutomaControlDigitalizacion(FiltroPrecisionAsistAutomaControlDigitalizacionDto filtro) throws SQLException;
}
