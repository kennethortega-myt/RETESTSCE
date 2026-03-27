package pe.gob.onpe.scebackend.model.dto.response;

import lombok.Data;

@Data
public class DetalleTipoEleccionDocumentoElectoralEscrutinioResponseDTO {

    private Integer id;
    private Integer eleccion;
    private Integer distritoElectoral;
    private String codigoDistritoElectoral;
    private String nombreDistritoElectoral;
    private Integer documentoElectoral;
    private String abreviaturaDocumentoElectoral;
    private String nombreDocumentoElectoral;


}
