package pe.gob.onpe.sceorcbackend.model.postgresql.dto.verification;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Data
public class VerificationDatetimeTotal {
    private Long fileId;
    private Long fileIdNumber;
    private Long fileIdNumberEscrutinio;
    private String textSystemValue;
    private String textUserValue;
    private String numberSystemValue;
    private String numberUserValue;

    @JsonIgnore
    private String filePngTextoUrl;
    @JsonIgnore
    private String filePngNumberUrl;

    @JsonIgnore
    private String filePngNumberEscrutinioUrl;

}
