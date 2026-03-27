package pe.gob.onpe.scebackend.model.dto.reportes;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PrecisionAsistAutomaDigitacionDetalleDto {
    private Integer idEeleccion;
    private Integer centroComputoId;
    private String centroComputoCodigo;
    private String centroComputoNombre;
    private String acta;
    private Integer coincideVotos;
    private Integer noCoincideVotos;
    private Integer totalVotos;
    private Integer coincidePreferencial;
    private Integer noCoincidePreferencial;
    private Integer totalPreferencial;
    private Integer coincideCvas;
    private Double presicionActa;
}
