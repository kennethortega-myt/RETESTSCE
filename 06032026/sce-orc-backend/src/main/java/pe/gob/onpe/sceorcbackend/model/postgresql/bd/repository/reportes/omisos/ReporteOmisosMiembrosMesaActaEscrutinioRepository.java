package pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.reportes.omisos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Usuario;
import pe.gob.onpe.sceorcbackend.model.postgresql.projection.ReporteOmisosMmAeProjection;
import java.util.List;

public interface ReporteOmisosMiembrosMesaActaEscrutinioRepository extends JpaRepository<Usuario, Long> {

    @Query(
            value = "SELECT " +
                    " c_codigo_ubigeo AS codigoUbigeo, " +
                    " c_codigo_centro_computo AS codigoCentroComputo, " +
                    " c_departamento AS departamento, " +
                    " c_provincia AS provincia, " +
                    " c_distrito AS distrito, " +
                    " n_total_mesas AS totalMesas, " +
                    " n_total_mm_escrutinio AS totalElectores, " +
                    " n_mesas_registradas AS totalMesasRegistradas " +
                    " FROM fn_reporte_avance_registro_omisos_mm_escrutinio(:pi_esquema,:idEleccion, :idCentroComputo)",
            nativeQuery = true
    )
    List<ReporteOmisosMmAeProjection> listarReporteOmisos(
            @Param("pi_esquema") String esquema,
            @Param("idEleccion") Integer idEleccion,
            @Param("idCentroComputo") Integer idCentroComputo
    );

}
