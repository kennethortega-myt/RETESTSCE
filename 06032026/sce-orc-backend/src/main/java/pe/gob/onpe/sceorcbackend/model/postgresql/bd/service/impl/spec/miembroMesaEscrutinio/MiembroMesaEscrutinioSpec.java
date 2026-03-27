package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl.spec.miembroMesaEscrutinio;

import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.MiembroMesaEscrutinio;

import org.springframework.data.jpa.domain.Specification;

public interface MiembroMesaEscrutinioSpec {

  Specification<MiembroMesaEscrutinio> filter(final MiembroMesaEscrutinioFilter filter);

}
