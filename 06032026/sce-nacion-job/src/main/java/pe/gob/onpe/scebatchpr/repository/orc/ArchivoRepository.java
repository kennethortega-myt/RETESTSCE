package pe.gob.onpe.scebatchpr.repository.orc;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pe.gob.onpe.scebatchpr.entities.orc.Archivo;

public interface ArchivoRepository extends JpaRepository<Archivo, Long> {

	@Modifying
	@Query("UPDATE Archivo a SET a.estadoTransmision = :estado  WHERE a.guid = :guid")
	void updateTransmision(@Param("guid") String guid, @Param("estado") Integer estado);
	
}
