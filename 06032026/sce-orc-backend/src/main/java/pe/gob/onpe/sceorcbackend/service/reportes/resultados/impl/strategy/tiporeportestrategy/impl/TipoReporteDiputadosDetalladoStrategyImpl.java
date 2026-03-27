package pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.impl;


import pe.gob.onpe.sceorcbackend.repository.resultados.ResultadosActaRepository;

/**
 * Strategy para reportes detallados de eleccion Diputados
 */
public class TipoReporteDiputadosDetalladoStrategyImpl extends TipoReportePreferencialDetalladoStrategyImpl {

    public TipoReporteDiputadosDetalladoStrategyImpl(ResultadosActaRepository resultadosActaRepository) {
        super(resultadosActaRepository);
    }

}
