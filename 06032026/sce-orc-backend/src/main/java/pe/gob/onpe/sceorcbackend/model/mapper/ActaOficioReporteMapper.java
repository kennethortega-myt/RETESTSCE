package pe.gob.onpe.sceorcbackend.model.mapper;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import pe.gob.onpe.sceorcbackend.model.dto.response.resoluciones.ActaBean;
import pe.gob.onpe.sceorcbackend.model.dto.response.resoluciones.ActaOficioBean;
import pe.gob.onpe.sceorcbackend.model.dto.response.resoluciones.DetActaOficioBean;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Acta;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.ActaCeleste;
import pe.gob.onpe.sceorcbackend.utils.ConstantesOficio;

public final class ActaOficioReporteMapper {

    private ActaOficioReporteMapper() {
    }

    public static List<ActaOficioBean> construirListaReporte(List<ActaBean> actaBeanList,
            List<DetActaOficioBean> actasValidas) {

        Map<Long, ActaBean> map = actaBeanList.stream().collect(Collectors.toMap(ActaBean::getActaId, ab -> ab));

        return actasValidas.stream().filter(det -> det.getActaPlomo() != null && det.getActaCeleste() != null)
                .flatMap(det -> {

                    Acta acta = det.getActaPlomo();
                    ActaCeleste celeste = det.getActaCeleste();

                    String eleccion = Optional.ofNullable(map.get(acta.getId())).map(ActaBean::getEleccion).orElse("");

                    return List
                            .of(build(acta, eleccion, ConstantesOficio.TIPO_SOBRE_PLOMO), build(celeste,
                                    acta.getMesa().getCodigo(), eleccion, ConstantesOficio.TIPO_SOBRE_CELESTE))
                            .stream();
                }).toList();
    }

    private static ActaOficioBean build(Acta acta, String eleccion, String sobre) {

        ActaOficioBean dto = new ActaOficioBean();
        dto.setMesa(acta.getMesa().getCodigo());
        dto.setCopia(acta.getNumeroCopia());
        dto.setDigitoChequeo(acta.getDigitoChequeoEscrutinio());
        dto.setEleccion(eleccion);
        dto.setSobre(sobre);
        return dto;
    }

    private static ActaOficioBean build(ActaCeleste celeste, String mesa, String eleccion, String sobre) {

        ActaOficioBean dto = new ActaOficioBean();
        dto.setMesa(mesa);
        dto.setCopia(celeste.getNumeroCopia());
        dto.setDigitoChequeo(celeste.getDigitoChequeoEscrutinio());
        dto.setEleccion(eleccion);
        dto.setSobre(sobre);
        return dto;
    }
}
