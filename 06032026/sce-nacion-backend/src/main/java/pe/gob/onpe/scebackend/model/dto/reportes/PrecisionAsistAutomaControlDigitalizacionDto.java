package pe.gob.onpe.scebackend.model.dto.reportes;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PrecisionAsistAutomaControlDigitalizacionDto {
    private String nombreEleccion;
    private String codigoCentroComputo;
    private String nombreCentroComputo;
    private Integer actasAprobadasAutomatica;
    private Integer actasAprobadasManual;
    private Integer actasNoReconocidas;
    private Integer actasPendientes;
    private Integer actasExtraviadas;
    private Integer totalActas;
    private Double porcentajeAprobadasAutomatica;
    private Double porcentajeAprobadasManual;
    private Double porcentajeNoReconocidas;
    private Double porcentajePendientes;
    private Double porcentajeExtraviadas;
}