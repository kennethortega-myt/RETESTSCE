package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.impl;

import pe.gob.onpe.scebackend.repository.resultados.ResultadosActaRepository;

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