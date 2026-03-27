package pe.gob.onpe.sceorcbackend.model.dto.response.actas;

import java.util.Date;
import lombok.Data;

@Data
public class DigitizationListActasItem {
  private Long actaId;
  private String mesa;
  private String estado;

  private Long acta1FileId;
  private String acta1Status;
  private String observacionDigtalAe;

  private Long acta2FileId;
  private String acta2Status;
  private String observacionDigtalAis;

  private Date fecha;
}
