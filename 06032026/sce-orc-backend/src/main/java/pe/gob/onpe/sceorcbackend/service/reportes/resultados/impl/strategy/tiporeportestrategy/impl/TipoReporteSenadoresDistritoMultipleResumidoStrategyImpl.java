package pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.impl;

import pe.gob.onpe.sceorcbackend.repository.resultados.ResultadosActaRepository;

/**
 * Strategy para reportes resumidos de eleccion Senadores Distrito Multiple.
 */
public class TipoReporteSenadoresDistritoMultipleResumidoStrategyImpl extends TipoReportePreferencialResumidoStrategyImpl {
    private final ResultadosActaRepository resultadosActaRepository;

    public TipoReporteSenadoresDistritoMultipleResumidoStrategyImpl(ResultadosActaRepository resultadosActaRepository) {
        super(resultadosActaRepository);
        this.resultadosActaRepository = resultadosActaRepository;
    }
}