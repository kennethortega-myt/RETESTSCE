package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl.spec.juradoElectoral;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import jakarta.persistence.criteria.Predicate;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.JuradoElectoralEspecial;

@Component
public class JuradoElectoralEspecialSpecImpl implements JuradoElectoralEspecialSpec{
    
    @Override
    public Specification<JuradoElectoralEspecial> filter(JuradoElectoralEspecialFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.isNotBlank(filter.getTexto())) {
                String pattern = "%" + filter.getTexto().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("nombre")), pattern),
                    cb.like(cb.lower(root.get("direccion")), pattern),
                    cb.like(cb.lower(root.get("apellidoPaternoRepresentante")), pattern),
                    cb.like(cb.lower(root.get("apellidoMaternoRepresentante")), pattern),
                    cb.like(cb.lower(root.get("nombresRepresentante")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

}
