package pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.impl;

import org.hibernate.query.TypedParameterValue;
import org.hibernate.type.StandardBasicTypes;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.FiltroResultadoContabilizadasDto;
import pe.gob.onpe.sceorcbackend.repository.resultados.ResultadosActaRepository;
import pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.TipoReporteStrategy;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;


import java.util.List;
import java.util.Map;

/**
 * Strategy para reportes resumidos de elecciones de condición preferencial.
 */
public class TipoReportePreferencialResumidoStrategyImpl implements TipoReporteStrategy {
    private final ResultadosActaRepository resultadosActaRepository;

    public TipoReportePreferencialResumidoStrategyImpl(ResultadosActaRepository resultadosActaRepository) {
        this.resultadosActaRepository = resultadosActaRepository;
    }

    @Override
    public List<Map<String, Object>> obtenerDatos(FiltroResultadoContabilizadasDto filtro) {
        TypedParameterValue<Integer> idEleccion = new TypedParameterValue<>(StandardBasicTypes.INTEGER, filtro.getIdEleccion());
        TypedParameterValue<Integer> centroComputo = new TypedParameterValue<>(StandardBasicTypes.INTEGER, filtro.getIdCentroComputo());
        TypedParameterValue<Integer> ambito = new TypedParameterValue<>(StandardBasicTypes.INTEGER, filtro.getIdOdpe());
        TypedParameterValue<String> ubigeo = new TypedParameterValue<>(StandardBasicTypes.STRING, filtro.getUbigeo());

        return resultadosActaRepository.resultadosActasContabilizadasResumidoPreferencial(
                filtro.getEsquema(), idEleccion, ambito, centroComputo, ubigeo);
    }

    @Override
    public boolean puedeManejar(Integer tipoReporte) {
        return tipoReporte.equals(ConstantesComunes.COD_TIPO_REPORTE_RESUMIDO);
    }
}
