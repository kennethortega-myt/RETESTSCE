package pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.impl;


import pe.gob.onpe.sceorcbackend.repository.resultados.ResultadosActaRepository;

/**
 * Strategy para reportes detallados de eleccion Diputados
 */
public class TipoReporteSenadoresDistritoUnicoDetalladoStrategyImpl extends TipoReportePreferencialDetalladoStrategyImpl {

    public TipoReporteSenadoresDistritoUnicoDetalladoStrategyImpl(ResultadosActaRepository resultadosActaRepository) {
        super(resultadosActaRepository);
    }

}
