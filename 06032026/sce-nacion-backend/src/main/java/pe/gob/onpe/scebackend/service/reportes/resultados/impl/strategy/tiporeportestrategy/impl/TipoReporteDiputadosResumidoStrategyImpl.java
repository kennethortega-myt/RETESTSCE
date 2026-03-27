package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.impl;


import pe.gob.onpe.scebackend.repository.resultados.ResultadosActaRepository;

/**
 * Strategy para reportes resumido de eleccion Diputados
 */
public class TipoReporteDiputadosResumidoStrategyImpl extends TipoReportePreferencialResumidoStrategyImpl {

    public TipoReporteDiputadosResumidoStrategyImpl(ResultadosActaRepository resultadosActaRepository) {
        super(resultadosActaRepository);
    }
}