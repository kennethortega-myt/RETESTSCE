package pe.gob.onpe.sceorcbackend.model.postgresql.dto.verification;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;

@Data
public class VerificationSignItem {
    private Long fileId;
    private String systemStatus;
    private String userStatus;
    @JsonIgnore
    private String filePngUrl;
}
