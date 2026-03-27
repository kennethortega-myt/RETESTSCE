package pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.reportes.omisos;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteOmisosDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteOmisosRequestDto;
import pe.gob.onpe.sceorcbackend.model.enums.TipoReporteOmiso;

import java.sql.PreparedStatement;
import java.util.List;

@Log4j2
@Repository
public class ReporteOmisosPersonerosRepository extends ReporteOmisosRepository {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public ReporteOmisosPersonerosRepository(JdbcTemplate jdbcTemplate) {
    	super(TipoReporteOmiso.PERSONERO);
    	this.jdbcTemplate = jdbcTemplate;        
    }

    public List<ReporteOmisosDto> listarReporteOmisos(ReporteOmisosRequestDto filtro) {
        String sql = "SELECT * FROM fn_reporte_avance_registro_omisos_personeros(?, ?, ?)";
        return jdbcTemplate.execute(sql, (PreparedStatement ps) -> preparedStatementCall(filtro, ps));
    }
    
}
