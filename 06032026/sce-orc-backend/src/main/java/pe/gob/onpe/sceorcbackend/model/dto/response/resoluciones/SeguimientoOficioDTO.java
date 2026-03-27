package pe.gob.onpe.sceorcbackend.model.dto.response.resoluciones;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Date;

@Data
@NoArgsConstructor
public class SeguimientoOficioDTO implements Serializable {

	private static final long serialVersionUID = -5578091677307991840L;

	private Long idOficio;
	private String numeroficio;

    private Long actaPlomaId;
    private String idArchivoEscrutinio;
    private String idArchivoInstalacionSufragio;
    private String numeroActaPloma;

    private Long actaCelesteId;
    private String numeroActaCeleste;
    
    private String eleccion;

    private Date fechaEnvio;
    private Date fechaRespuesta;

    private Long idResolucion;
    private String numeroResolucion;
    private String numeroExpediente;
    private Integer archivoJNE;

    private String estadoOficio;
}
