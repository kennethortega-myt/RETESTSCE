package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl.spec.miembroMesaEscrutinio;

import java.util.ArrayList;
import java.util.List;

import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.MiembroMesaEscrutinio;
import pe.gob.onpe.sceorcbackend.model.postgresql.util.AbstractSpec;

import jakarta.persistence.criteria.Predicate;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class MiembroMesaEscrutinioSpecImpl extends AbstractSpec implements MiembroMesaEscrutinioSpec {

  @Override
  public Specification<MiembroMesaEscrutinio> filter(MiembroMesaEscrutinioFilter filter) {
    return (root, query, criteriaBuilder) -> {
      List<Predicate> conditions = new ArrayList<>();
      if (StringUtils.isNotBlank(filter.getNumeroDocumento())) {
        conditions.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("documentoIdentidadPresidente")), "%" + filter.getNumeroDocumento().toLowerCase() + "%"));
      }
      return and(criteriaBuilder, conditions);
    };
  }
}
