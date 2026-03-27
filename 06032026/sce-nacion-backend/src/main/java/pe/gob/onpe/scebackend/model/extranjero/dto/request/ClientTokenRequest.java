package pe.gob.onpe.scebackend.model.extranjero.dto.request;

import java.io.Serializable;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClientTokenRequest implements Serializable {
    
    private static final long serialVersionUID = -8753300257373061154L;
    
    private String clientId;
    private String clientSecret;
    
    private String username;              // Nombre de usuario
    private Integer userId;              // ID de usuario
    private String acronimoProceso;      // Acrónimo del proceso electoral
    private String codigoCentroComputo;  // Código del centro de cómputo
    private String nombreCentroComputo;  // Nombre del centro de cómputo
    private Integer perfilId;            // ID del perfil
    private String autoridad;            // Ej. EXTRANJERO.
    private String idSession;           //ID SESSION
}
