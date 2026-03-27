package pe.gob.onpe.sceorcbackend.model.postgresql.importar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.importar.entity.ImportDetalleConfiguracionDocumentoElectoralHistorial;


public interface ImportDetalleConfiguracionDocumentoElectoralHistorialRepository 
		extends JpaRepository<ImportDetalleConfiguracionDocumentoElectoralHistorial, Integer> {

    
}
