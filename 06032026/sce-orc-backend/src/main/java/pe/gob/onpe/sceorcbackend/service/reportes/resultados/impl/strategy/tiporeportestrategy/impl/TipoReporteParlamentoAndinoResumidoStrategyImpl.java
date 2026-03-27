package pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.impl;


import pe.gob.onpe.sceorcbackend.repository.resultados.ResultadosActaRepository;

/**
 * Strategy para reportes resumido de eleccion Parlamento Andino
 */
public class TipoReporteParlamentoAndinoResumidoStrategyImpl extends TipoReportePreferencialResumidoStrategyImpl {

    public TipoReporteParlamentoAndinoResumidoStrategyImpl(ResultadosActaRepository resultadosActaRepository) {
        super(resultadosActaRepository);
    }
}