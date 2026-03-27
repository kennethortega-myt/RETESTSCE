package pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.strategy.tiporeportestrategy;

import pe.gob.onpe.sceorcbackend.model.dto.reporte.FiltroResultadoContabilizadasDto;

import java.util.List;
import java.util.Map;

/**
 * Strategy interface para manejar diferentes tipos de reportes (Resumido/Detallado)
 */
public interface TipoReporteStrategy {
    
    /**
     * Obtiene los datos según el tipo de reporte (resumido o detallado)
     */
    List<Map<String, Object>> obtenerDatos(FiltroResultadoContabilizadasDto filtro);
    
    /**
     * Verifica si esta estrategia puede manejar el tipo de reporte dado
     */
    boolean puedeManejar(Integer tipoReporte);
}
