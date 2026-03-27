package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl.spec.juradoElectoral;

import org.springframework.data.jpa.domain.Specification;

import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.JuradoElectoralEspecial;

public interface JuradoElectoralEspecialSpec {
    Specification<JuradoElectoralEspecial> filter(JuradoElectoralEspecialFilter filter);
}
