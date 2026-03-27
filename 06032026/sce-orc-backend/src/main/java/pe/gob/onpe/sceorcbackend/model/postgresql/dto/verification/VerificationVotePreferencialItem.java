package pe.gob.onpe.sceorcbackend.model.postgresql.dto.verification;

import lombok.Data;

@Data
public class VerificationVotePreferencialItem {
    private Integer position;
    private Long fileId;
    private Integer estado;
    private String systemValue;
    private String userValue;
}
