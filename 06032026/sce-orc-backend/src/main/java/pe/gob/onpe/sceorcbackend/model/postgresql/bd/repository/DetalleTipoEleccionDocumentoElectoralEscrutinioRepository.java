package pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.DetalleTipoEleccionDocumentoElectoralEscrutinio;

public interface DetalleTipoEleccionDocumentoElectoralEscrutinioRepository extends JpaRepository<DetalleTipoEleccionDocumentoElectoralEscrutinio, Long> {

	@Modifying
    @Query("DELETE FROM DetalleTipoEleccionDocumentoElectoralEscrutinio")
    void deleteAllInBatch();
	
}
