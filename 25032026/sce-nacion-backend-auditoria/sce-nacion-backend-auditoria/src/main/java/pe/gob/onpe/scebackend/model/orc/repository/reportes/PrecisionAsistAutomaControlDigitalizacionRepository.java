package pe.gob.onpe.scebackend.model.orc.repository.reportes;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;
import pe.gob.onpe.scebackend.model.dto.reportes.FiltroPrecisionAsistAutomaControlDigitalizacionDto;
import pe.gob.onpe.scebackend.model.dto.reportes.PrecisionAsistAutomaControlDigitalizacionDto;
import pe.gob.onpe.scebackend.model.dto.request.reporte.ReporteDetalleAvanceRegistroUbigeoRequestDto;
import pe.gob.onpe.scebackend.model.dto.response.reporte.ReporteRecepcionResponseDto;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class PrecisionAsistAutomaControlDigitalizacionRepository implements IPrecisionAsistAutomaControlDigitalizacionRepository {

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public PrecisionAsistAutomaControlDigitalizacionRepository(@Qualifier("namedParameterJdbcTemplateNacion") NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
    }

    @Override
    public List<PrecisionAsistAutomaControlDigitalizacionDto> listaPrecisionAsistenteAutomatico(FiltroPrecisionAsistAutomaControlDigitalizacionDto filtro) throws SQLException {
        String sql = "select * from fn_reporte_presicion_asistente_automatico(:pi_esquema, :pi_eleccion, :pi_centro_computo)";
        return namedParameterJdbcTemplate.query(sql, mapearParametrosQuery(filtro), this::llenarDatos);
    }

    private SqlParameterSource mapearParametrosQuery(FiltroPrecisionAsistAutomaControlDigitalizacionDto filtro) {
        return new MapSqlParameterSource("pi_esquema",filtro.getEsquema())
                .addValue("pi_eleccion",filtro.getIdEleccion())
                .addValue("pi_centro_computo",filtro.getIdCentroComputo());
    }

    private PrecisionAsistAutomaControlDigitalizacionDto llenarDatos(ResultSet resultSet, int i) throws SQLException {
        return PrecisionAsistAutomaControlDigitalizacionDto.builder()
                .nombreEleccion(resultSet.getString("c_nombre_eleccion"))
                .codigoCentroComputo(resultSet.getString("c_codigo_centro_computo"))
                .nombreCentroComputo(resultSet.getString("c_nombre_centro_computo"))
                .actasAprobadasAutomatica(resultSet.getInt("n_actas_aprobadas_automatica"))
                .actasAprobadasManual(resultSet.getInt("n_actas_aprobadas_manual"))
                .actasNoReconocidas(resultSet.getInt("n_actas_no_reconocidas"))
                .actasPendientes(resultSet.getInt("n_actas_pendientes"))
                .actasExtraviadas(resultSet.getInt("n_actas_extraviadas"))
                .totalActas(resultSet.getInt("n_total_actas"))
                .porcentajeAprobadasAutomatica(resultSet.getDouble("n_porcetaje_aprobadas_automatica"))
                .porcentajeAprobadasManual(resultSet.getDouble("n_porcetaje_aprobadas_manual"))
                .porcentajeNoReconocidas(resultSet.getDouble("n_porcetaje_no_reconocidas"))
                .porcentajePendientes(resultSet.getDouble("n_porcetaje_pendientes"))
                .porcentajeExtraviadas(resultSet.getDouble("n_porcetaje_extraviadas"))
                .build();
    }
}