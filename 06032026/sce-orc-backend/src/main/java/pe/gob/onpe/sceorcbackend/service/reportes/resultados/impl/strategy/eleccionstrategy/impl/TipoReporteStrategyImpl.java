package pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.strategy.eleccionstrategy.impl;

import org.springframework.stereotype.Component;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.ActaRepository;


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
