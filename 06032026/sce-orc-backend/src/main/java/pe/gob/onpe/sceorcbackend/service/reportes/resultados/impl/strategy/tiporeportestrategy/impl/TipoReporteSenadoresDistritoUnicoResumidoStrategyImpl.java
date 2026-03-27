package pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.impl;


import pe.gob.onpe.sceorcbackend.repository.resultados.ResultadosActaRepository;

/**
 * Strategy para reportes resumido de eleccion Diputados
 */
public class TipoReporteSenadoresDistritoUnicoResumidoStrategyImpl extends TipoReportePreferencialResumidoStrategyImpl {

    public TipoReporteSenadoresDistritoUnicoResumidoStrategyImpl(ResultadosActaRepository resultadosActaRepository) {
        super(resultadosActaRepository);
    }
}