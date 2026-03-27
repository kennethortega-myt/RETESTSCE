package pe.gob.onpe.scebackend.model.orc.repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import pe.gob.onpe.scebackend.model.orc.entities.DetParametro;


public interface DetParametroRepository extends JpaRepository<DetParametro, Long> {
	
	List<DetParametro> findAll();
	List<DetParametro> findByParametroId(Long idParametro);

	Optional<DetParametro> findById(Long id);

    @Modifying
    @Transactional
    @Query("UPDATE DetParametro d " +
            "SET d.activo = :activo, d.fechaModificacion =:fechaModificacion, "
            + "d.usuarioModificacion =:usuario  WHERE d.id =:idParametro ")
    int actualizarEstado(@Param("activo") Integer activo,
                         @Param("fechaModificacion") Date fechaModificacion,
                         @Param("usuario") String usuario,
                         @Param("idParametro") Long idParametro);

}
