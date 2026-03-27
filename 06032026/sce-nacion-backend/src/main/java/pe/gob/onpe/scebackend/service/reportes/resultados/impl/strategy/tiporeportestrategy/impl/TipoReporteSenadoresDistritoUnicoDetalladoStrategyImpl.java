package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.impl;


import pe.gob.onpe.scebackend.repository.resultados.ResultadosActaRepository;

/**
 * Strategy para reportes detallados de eleccion Diputados
 */
public class TipoReporteSenadoresDistritoUnicoDetalladoStrategyImpl extends TipoReportePreferencialDetalladoStrategyImpl {

    public TipoReporteSenadoresDistritoUnicoDetalladoStrategyImpl(ResultadosActaRepository resultadosActaRepository) {
        super(resultadosActaRepository);
    }

}
