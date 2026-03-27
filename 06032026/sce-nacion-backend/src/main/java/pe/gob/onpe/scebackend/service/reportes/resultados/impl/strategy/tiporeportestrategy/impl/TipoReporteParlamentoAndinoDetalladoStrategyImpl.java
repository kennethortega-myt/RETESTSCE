package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.impl;


import pe.gob.onpe.scebackend.repository.resultados.ResultadosActaRepository;

/**
 * Strategy para reportes detallados de eleccion Parlamento Andino
 */
public class TipoReporteParlamentoAndinoDetalladoStrategyImpl extends TipoReportePreferencialDetalladoStrategyImpl {

    public TipoReporteParlamentoAndinoDetalladoStrategyImpl(ResultadosActaRepository resultadosActaRepository) {
        super(resultadosActaRepository);
    }

}
