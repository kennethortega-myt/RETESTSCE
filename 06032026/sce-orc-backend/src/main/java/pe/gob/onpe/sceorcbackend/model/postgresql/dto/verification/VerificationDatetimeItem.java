package pe.gob.onpe.sceorcbackend.model.postgresql.dto.verification;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Data
public class VerificationDatetimeItem {
    private Long fileId;
    private String systemValue;
    private String userValue;
    private String nextText;
    @JsonIgnore
    private String filePngUrl;
}
