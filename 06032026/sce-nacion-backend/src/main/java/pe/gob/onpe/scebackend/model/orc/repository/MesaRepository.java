package pe.gob.onpe.scebackend.model.orc.repository;

import java.util.List;
import java.util.Map;

import org.hibernate.query.TypedParameterValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.gob.onpe.scebackend.model.orc.entities.Mesa;
import pe.gob.onpe.scebackend.model.repository.MigracionRepository;

@SuppressWarnings("rawtypes")
public interface MesaRepository extends JpaRepository<Mesa, Long>, MigracionRepository<Mesa, String>{

	@Query("SELECT m FROM Mesa m "
			+ "JOIN m.localVotacion l "
			+ "JOIN l.ubigeo u "
			+ "JOIN u.centroComputo c "
			+ "WHERE c.codigo = ?1")
	public List<Mesa> findByCc(String codigo);


	Mesa findByCodigo(String numeroMesa);

	@Query(
			value = "SELECT DISTINCT * FROM fn_reporte_mesas_por_ubigeo(:pi_esquema, :pi_c_centro_computo, " +
					"(SELECT NULLIF (:pi_departamento,'0')), " +
					"(SELECT NULLIF (:pi_provincia,'0')), " +
					"(SELECT NULLIF (:pi_distrito,'0'))) " +
					"ORDER BY c_ubigeo, c_codigo_local, c_numero_mesa",
			nativeQuery = true)
	public List<Map<String, Object>> getReporteMesaPorUbigeo(@Param("pi_esquema") String piEsquema,
															 @Param("pi_c_centro_computo") TypedParameterValue piCentroComputo,
															 @Param("pi_departamento") String piDepartamento,
															 @Param("pi_provincia") String piProvincia,
															 @Param("pi_distrito") String piDistrito);


}
