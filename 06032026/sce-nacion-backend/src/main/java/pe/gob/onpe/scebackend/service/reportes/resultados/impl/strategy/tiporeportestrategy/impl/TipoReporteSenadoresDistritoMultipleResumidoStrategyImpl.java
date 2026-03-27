package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.impl;

import pe.gob.onpe.scebackend.repository.resultados.ResultadosActaRepository;

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