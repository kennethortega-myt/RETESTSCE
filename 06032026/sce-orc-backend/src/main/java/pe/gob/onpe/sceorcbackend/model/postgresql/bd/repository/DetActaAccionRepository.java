package pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Acta;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.DetActaAccion;

import java.util.List;

public interface DetActaAccionRepository extends JpaRepository<DetActaAccion, Long> {
	
	List<DetActaAccion> findByActa_Id(Long idActa);
	
    List<DetActaAccion> findByActaAndAccionAndIteracion(Acta acta, String accion, Integer iteracion);

    List<DetActaAccion> findByActa_IdAndAccionAndTiempoOrderByIteracion(Long acta, String accion, String tiempo);

    List<DetActaAccion> findByActa_IdAndAccionOrderByIteracion(Long acta, String accion);

    List<DetActaAccion> findByActa_IdAndAccionAndIteracion (Long aLong, String accion, Integer iteracion);
    
    @Modifying
    @Query("DELETE FROM DetActaAccion")
    void deleteAllInBatch();
}
