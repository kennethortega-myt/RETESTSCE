package pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.reportes.mesassinomisos;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Acta;


public interface ReporteMesasSinOmisosMiembrosMesaRepository extends JpaRepository<Acta, Long> {

	@Query(value = "SELECT * FROM fn_reporte_lista_mesa_sin_omisos_miembro_mesa("
								+ ":pi_esquema, "
					    		+ ":pi_eleccion, "
					    		+ ":pi_centro_computo)", nativeQuery = true)
	List<Map<String, Object>> listarReporteMesasSinOmisos(@Param("pi_esquema") String piEsquema,
															@Param("pi_eleccion") Integer idEleccion,
															@Param("pi_centro_computo") Integer idCentroComputo);
	
	@Query(value = "SELECT * FROM fn_reporte_lista_mesa_sin_omisos_electores("
								+ ":pi_esquema, "
					    		+ ":pi_eleccion, "
					    		+ ":pi_centro_computo)", nativeQuery = true)
	List<Map<String, Object>> listarReporteMesasSinOmisosElectores(@Param("pi_esquema") String piEsquema,
																@Param("pi_eleccion") Integer idEleccion,
																@Param("pi_centro_computo") Integer idCentroComputo);
	
}