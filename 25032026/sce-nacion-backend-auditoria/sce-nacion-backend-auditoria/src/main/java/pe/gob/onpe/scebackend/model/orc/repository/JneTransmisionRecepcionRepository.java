package pe.gob.onpe.scebackend.model.orc.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pe.gob.onpe.scebackend.model.orc.entities.JneTransmisionRecepcion;

public interface JneTransmisionRecepcionRepository extends JpaRepository<JneTransmisionRecepcion, Long> {

    @Query("""
            SELECT r
            FROM JneTransmisionRecepcion r
            LEFT JOIN FETCH r.archivo
            WHERE r.estado IN :estados
            AND r.activo = :activo
            AND r.intentos < :maxIntentos
            ORDER BY r.audFechaCreacion ASC
            """)
    List<JneTransmisionRecepcion> findTop50Pendientes(@Param("estados") List<Short> estados,
            @Param("activo") Short activo, @Param("maxIntentos") Short maxIntentos, Pageable pageable);

    boolean existsByCodigoJneEnvio(String codigoJneEnvio);
}
