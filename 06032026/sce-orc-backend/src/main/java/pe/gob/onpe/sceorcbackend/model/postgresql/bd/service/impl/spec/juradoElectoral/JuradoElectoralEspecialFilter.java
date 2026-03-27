package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl.spec.juradoElectoral;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import pe.gob.onpe.sceorcbackend.model.dto.BaseFilter;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
public class JuradoElectoralEspecialFilter  extends BaseFilter{
    private String texto;
}
