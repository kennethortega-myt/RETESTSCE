package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.impl;


import pe.gob.onpe.scebackend.repository.resultados.ResultadosActaRepository;

/**
 * Strategy para reportes detallados de eleccion Senadores Distrito Multiple.
 */
public class TipoReporteSenadoresDistritoMultpleDetalladoStrategyImpl extends TipoReportePreferencialDetalladoStrategyImpl {
    private final ResultadosActaRepository resultadosActaRepository;

    public TipoReporteSenadoresDistritoMultpleDetalladoStrategyImpl(ResultadosActaRepository resultadosActaRepository) {
        super(resultadosActaRepository);
        this.resultadosActaRepository = resultadosActaRepository;
    }
}
