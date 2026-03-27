package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.impl;


import pe.gob.onpe.scebackend.repository.resultados.ResultadosActaRepository;

/**
 * Strategy para reportes detallados de eleccion EMC.
 */
public class TipoReporteEMCDetalladoStrategyImpl extends TipoReportePresidencialDetalladoStrategyImpl {
    private final ResultadosActaRepository resultadosActaRepository;

    public TipoReporteEMCDetalladoStrategyImpl(ResultadosActaRepository resultadosActaRepository) {
        super(resultadosActaRepository);
        this.resultadosActaRepository = resultadosActaRepository;
    }
}
