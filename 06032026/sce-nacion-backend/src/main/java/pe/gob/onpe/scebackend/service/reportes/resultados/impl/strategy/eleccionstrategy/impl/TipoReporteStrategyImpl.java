package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.eleccionstrategy.impl;

import org.springframework.stereotype.Component;
import pe.gob.onpe.scebackend.model.orc.repository.ActaRepository;


/**
 * Implementación base para estrategias de tipo de reporte
 */
@Component
public class TipoReporteStrategyImpl {
    
    private final ActaRepository actaRepository;
    
    public TipoReporteStrategyImpl(ActaRepository actaRepository) {
        this.actaRepository = actaRepository;
    }
    

    








}
