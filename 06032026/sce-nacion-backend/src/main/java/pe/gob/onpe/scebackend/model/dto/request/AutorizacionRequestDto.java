package pe.gob.onpe.scebackend.model.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AutorizacionRequestDto {
    Long idAutorizacion;
    String descTipoAutorizacion;
    String codigoCentroComputo;
    String nombreCentroComputo;
}
