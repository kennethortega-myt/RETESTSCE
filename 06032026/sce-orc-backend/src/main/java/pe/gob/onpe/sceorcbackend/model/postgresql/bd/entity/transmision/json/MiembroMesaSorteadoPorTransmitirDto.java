package pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.transmision.json;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class MiembroMesaSorteadoPorTransmitirDto implements Serializable {

	private static final long serialVersionUID = 7873293492167798002L;
	
	private Long idMesa;
	private Long idMiembroMesaSorteado;
	private Integer asistenciaManual;
	private Integer asistenciaAutomatico;
	private Integer activo;
	private String usuarioCreacion;
	private String usuarioModificacion;
	private String fechaCreacion;
	private String fechaModificacion;
	private List<OmisoMiembroMesaPorTransmitirDto> omisosMiembroMesa;
	
}
