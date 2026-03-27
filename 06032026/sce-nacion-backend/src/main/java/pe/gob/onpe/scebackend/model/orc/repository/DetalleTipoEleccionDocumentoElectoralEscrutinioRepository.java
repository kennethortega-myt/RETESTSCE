package pe.gob.onpe.scebackend.model.orc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.gob.onpe.scebackend.model.orc.entities.DetalleTipoEleccionDocumentoElectoralEscrutinio;

import java.util.Date;


public interface DetalleTipoEleccionDocumentoElectoralEscrutinioRepository extends JpaRepository<DetalleTipoEleccionDocumentoElectoralEscrutinio, Long> {

    @Modifying
    @Query("update DetalleTipoEleccionDocumentoElectoralEscrutinio det set det.documentoElectoral = :documentoElectoral, det.usuarioModificacion = :usuario, det.fechaModificacion = :fecha where det.id = :id")
    public void updateDocumentoElectoral(@Param("documentoElectoral") Integer documentoElectoral, @Param("usuario") String usuario, @Param("fecha") Date fecha, @Param("id") Long id);
}
