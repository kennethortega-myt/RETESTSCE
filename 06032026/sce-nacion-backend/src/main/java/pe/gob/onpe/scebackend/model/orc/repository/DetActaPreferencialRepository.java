package pe.gob.onpe.scebackend.model.orc.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.gob.onpe.scebackend.model.orc.entities.DetActaPreferencial;
import pe.gob.onpe.scebackend.model.repository.MigracionRepository;

public interface DetActaPreferencialRepository  extends JpaRepository<DetActaPreferencial, Long>, MigracionRepository<DetActaPreferencial, String> {

	
	@Query(value = """
			SELECT dap.* FROM det_acta_preferencial dap 
			INNER JOIN det_acta da ON dap.n_det_acta = da.n_det_acta_pk 
			INNER JOIN cab_acta ca ON da.n_acta = ca.n_acta_pk 
			INNER JOIN det_ubigeo_eleccion due ON ca.n_det_ubigeo_eleccion = due.n_det_ubigeo_eleccion_pk
			INNER JOIN mae_ubigeo ub ON ub.n_distrito_electoral = dap.n_distrito_electoral AND due.n_ubigeo = ub.n_ubigeo_pk
			INNER JOIN mae_centro_computo mcc ON mcc.n_centro_computo_pk = ub.n_centro_computo
			WHERE mcc.c_codigo = ?1
        """, nativeQuery = true)
	List<DetActaPreferencial> findByCc(String codigo);

	@Query("SELECT distinct dp FROM DetActaPreferencial dp WHERE dp.idOrc=?1")
	Optional<DetActaPreferencial> findByIdOrc(String id);
	
}
