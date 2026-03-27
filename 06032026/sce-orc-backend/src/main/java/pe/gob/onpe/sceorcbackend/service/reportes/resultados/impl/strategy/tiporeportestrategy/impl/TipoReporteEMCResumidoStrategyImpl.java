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
 * Strategy para reportes resumidos de eleccion EMC.
 */
public class TipoReporteEMCResumidoStrategyImpl extends TipoReportePresidencialResumidoStrategyImpl {
    private final ResultadosActaRepository resultadosActaRepository;

    public TipoReporteEMCResumidoStrategyImpl(ResultadosActaRepository resultadosActaRepository) {
        super(resultadosActaRepository);
        this.resultadosActaRepository = resultadosActaRepository;
    }
}