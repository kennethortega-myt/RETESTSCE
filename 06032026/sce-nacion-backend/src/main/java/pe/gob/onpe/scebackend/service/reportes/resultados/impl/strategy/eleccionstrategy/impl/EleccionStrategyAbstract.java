package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.eleccionstrategy.impl;

import pe.gob.onpe.scebackend.model.dto.reportes.DetalleResultadosContabilizadas;
import pe.gob.onpe.scebackend.model.dto.reportes.FiltroResultadoContabilizadasDto;
import pe.gob.onpe.scebackend.model.dto.reportes.ResumenActasContabilizadas;
import pe.gob.onpe.scebackend.model.service.UtilSceService;
import pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.eleccionstrategy.EleccionStrategy;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesReportes;
import pe.gob.onpe.scebackend.utils.funciones.Funciones;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Clase base abstracta que implementa funcionalidades comunes para todas las estrategias de elección
 * Utiliza Template Method Pattern para compartir código común
 */
public abstract class EleccionStrategyAbstract implements EleccionStrategy {
    
    protected final UtilSceService utilSceService;

    protected EleccionStrategyAbstract(UtilSceService utilSceService) {
        this.utilSceService = utilSceService;
    }
    
    /**
     * Genera parámetros comunes para todos los reportes PDF
     */
    protected Map<String, Object> generarParametrosComunes(FiltroResultadoContabilizadasDto filtro, Map<String, Object> datos) {
        try {
            Map<String, Object> parametros = new java.util.HashMap<>();
            
            ResumenActasContabilizadas resumen = getResumenActasContabilizadas(datos);
            
            String tituloReporte = resumen.getPorcentajeAvance().intValue() == 100 ? 
            			ConstantesReportes.TITULO_REPORTE_RESULTADO_ACTAS_CONTABILIZADAS_100 : 
            				ConstantesReportes.TITULO_REPORTE_RESULTADO_ACTAS_CONTABILIZADAS_AVANCE;
            
            InputStream imagen = this.getClass().getClassLoader().getResourceAsStream(ConstantesComunes.PATH_IMAGE_COMMON + "onpe.jpg");

            parametros.put("logo_onpe", imagen);
            parametros.put("sinvaloroficial", utilSceService.getSinValorOficial());
            parametros.put("version", utilSceService.getVersionSistema());
            parametros.put("servidor", InetAddress.getLocalHost().getHostName());
            parametros.put("usuario", filtro.getUsuario());
            parametros.put("proceso", filtro.getProceso());
            parametros.put("tituloEleccionSimple", filtro.getEleccion());
            parametros.put("TituloRep", tituloReporte);
            parametros.put("odpe", filtro.getOdpe());
            parametros.put("ccomputo", filtro.getCentroComputo());
            parametros.put("ubigeo", filtro.getUbigeo());
            parametros.put("codigoEleccion", filtro.getCodigoEleccion());
            
            return parametros;
        } catch (Exception e) {
            throw new RuntimeException("Error generando parámetros comunes", e);
        }
    }
    
    /**
     * Calcula el detalle total de resultados común para todos los tipos de elección
     */
    protected List<DetalleResultadosContabilizadas> getDetalleTotalResultados(List<Map<String, Object>> resultadosMap, boolean isVotoPref) {
        
        List<Map <String, Object>> resultadosValidosMap = resultadosMap
                .parallelStream()
                .filter(detalle -> !detalle.get("c_codigo_agrupacion_politica").equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_BLANCOS.toString())
                        && !detalle.get("c_codigo_agrupacion_politica").equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_NULOS.toString()))
                .toList();
        
        Double totalVotosEmitidos = resultadosMap
                .parallelStream()
                .map(v -> ((BigDecimal) v.get("n_votos")).doubleValue() )
                .reduce(0.0, (total, votos) -> total + votos);
        
        Double totalVotosValidos = resultadosValidosMap
                .parallelStream()
                .map(v -> ((BigDecimal) v.get("n_votos")).doubleValue() )
                .reduce(0.0, (total, votos) -> total + votos);
        
        BigInteger totalVotosBlancos = resultadosMap
                .parallelStream()
                .filter(detalle -> detalle.get("c_codigo_agrupacion_politica").equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_BLANCOS.toString()))
                .map(v -> ((BigDecimal) v.get("n_votos")).toBigInteger() )
                .reduce(BigInteger.ZERO, (total, votos) -> total.add(votos));
        
        BigInteger totalVotosNulos = resultadosMap
                .parallelStream()
                .filter(detalle -> detalle.get("c_codigo_agrupacion_politica").equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_NULOS.toString()))
                .map(v -> ((BigDecimal) v.get("n_votos")).toBigInteger() )
                .reduce(BigInteger.ZERO, (total, votos) -> total.add(votos));
        
        DetalleResultadosContabilizadas detalleTotalValidos = DetalleResultadosContabilizadas
                    .builder()
                    .numeroAp(null)
                    .codigoAp(null)
                    .agrupacionPolitica("TOTAL DE VOTOS VÁLIDOS")
                    .cantidadVotos( BigInteger.valueOf(totalVotosValidos.longValue()) )
                    .votosValidados(totalVotosValidos.compareTo(0.0) == 0 ? 0.0 : 100.000)
                    .votosEmitidos( totalVotosEmitidos.compareTo(0.0) == 0 ? 0.0 
                            : totalVotosValidos * 100 / totalVotosEmitidos  )
                    .build();
        
        Double votosEmitidosBlancos = totalVotosEmitidos.compareTo(0.0) == 0 ? 0.0 
                : Double.parseDouble(totalVotosBlancos.toString()) * 100 / totalVotosEmitidos;
        
        DetalleResultadosContabilizadas detalleTotalBlancos = DetalleResultadosContabilizadas
                .builder()
                .numeroAp(null)
                .codigoAp(ConstantesComunes.NCODI_AGRUPOL_VOTOS_BLANCOS.toString())
                .agrupacionPolitica("VOTOS BLANCOS")
                .cantidadVotos(totalVotosBlancos)
                .votosValidados(null)
                .votosEmitidos( isVotoPref ? null : votosEmitidosBlancos )
                .build();
        
        Double votosEmitidosNulos = totalVotosEmitidos.compareTo(0.0) == 0 ? 0.0 
                : Double.parseDouble(totalVotosNulos.toString()) * 100 / totalVotosEmitidos;
        DetalleResultadosContabilizadas detalleTotalNulos = DetalleResultadosContabilizadas
                .builder()
                .numeroAp(null)
                .codigoAp(ConstantesComunes.NCODI_AGRUPOL_VOTOS_NULOS.toString())
                .agrupacionPolitica("VOTOS NULOS")
                .cantidadVotos(totalVotosNulos)
                .votosValidados(null)
                .votosEmitidos( isVotoPref ? null :  votosEmitidosNulos )
                .build();
        
        Double votosEmitidos = totalVotosEmitidos.compareTo(0.0) == 0 ? 0.0 : 100.00;
        DetalleResultadosContabilizadas detalleTotalEmitidos = DetalleResultadosContabilizadas
                .builder()
                .numeroAp(null)
                .codigoAp(null)
                .agrupacionPolitica("TOTAL DE VOTOS EMITIDOS")
                .cantidadVotos(BigInteger.valueOf(totalVotosEmitidos.longValue()))
                .votosValidados(null)
                .votosEmitidos( isVotoPref ? null : votosEmitidos  )
                .build();
        
        List<DetalleResultadosContabilizadas> detalleTotalResultados = new ArrayList<>();
        detalleTotalResultados.add(detalleTotalValidos);
        detalleTotalResultados.add(detalleTotalBlancos);
        detalleTotalResultados.add(detalleTotalNulos);
        detalleTotalResultados.add(detalleTotalEmitidos);
        
        return detalleTotalResultados;
    }
    
    /**
     * Genera el resumen de actas contabilizadas común para todos los tipos de elección
     */
    protected ResumenActasContabilizadas getResumenActasContabilizadas(Map<String, Object> resumenMap) {
        Double actasProcesadasPorcentaje = 0.000;
        Double actasPorProcesarPorcentaje = 0.000;
        
        Integer actasProcesadas = Integer.parseInt(resumenMap.get("n_actas_procesadas").toString());
        Integer actasPorProcesar = Integer.parseInt(resumenMap.get("n_mesas_por_procesar").toString());
        Integer mesasAinstalar = Integer.parseInt(resumenMap.get("n_mesas_a_instalar").toString());
        Integer actasContabilizadasNormal = Integer.parseInt(resumenMap.get("n_estado_contabilizada_normal").toString());
        Integer actasAnuladas = Integer.parseInt( resumenMap.get("n_estado_contabilizada_anulada").toString());
        Integer actasNoInstaladas = Integer.parseInt(resumenMap.get("n_estado_no_instalada").toString());
        Double porcentajeAvance = 0.000;
        
        if(mesasAinstalar.compareTo(0) != 0) {
            if(actasProcesadas.compareTo(0) != 0 ){
                actasProcesadasPorcentaje = (actasProcesadas * 100.000) / mesasAinstalar;
            }
            if(actasPorProcesar.compareTo(0) != 0){
                actasPorProcesarPorcentaje = (actasPorProcesar * 100.000) / mesasAinstalar;
            }
            porcentajeAvance = Math.round(((actasContabilizadasNormal + actasAnuladas + actasNoInstaladas) * 100.000 / mesasAinstalar) * 1000.0) / 1000.0;
        }
        
        return ResumenActasContabilizadas
                .builder()
                .actasNoInstalada(actasNoInstaladas)
                .actasProcesadas(actasProcesadas)
                .anulada(actasAnuladas)
                .contabilizadasNormal(actasContabilizadasNormal)
                .electoresHabiles(resumenMap.get("n_electores_habiles") == null ? null : Integer.parseInt(resumenMap.get("n_electores_habiles").toString()))
                .enDigitacion(resumenMap.get("n_estado_en_digitacion") == null ? null : Integer.parseInt(resumenMap.get("n_estado_en_digitacion").toString()))
                .errorMaterial(resumenMap.get("n_estado_error_material") == null ? null :Integer.parseInt(resumenMap.get("n_estado_error_material").toString()))
                .extraviada(resumenMap.get("n_estado_extraviada") == null ? null :Integer.parseInt(resumenMap.get("n_estado_extraviada").toString()))
                .ilegible(resumenMap.get("n_estado_ilegible") == null ? null :Integer.parseInt(resumenMap.get("n_estado_ilegible").toString()))
                .impugnados(resumenMap.get("n_estado_contabilidad_impugnada") == null ? null :Integer.parseInt(resumenMap.get("n_estado_contabilidad_impugnada").toString()))
                .incompleta(resumenMap.get("n_estado_incompleta") == null ? null :Integer.parseInt(resumenMap.get("n_estado_incompleta").toString()))
                .mesasAinstalar(mesasAinstalar)
                .mesasHabiles(resumenMap.get("n_mesas_habiles") == null ? null :Integer.parseInt(resumenMap.get("n_mesas_habiles").toString()))
                .mesasInstaladas(resumenMap.get("n_mesas_instaladas") == null ? null :Integer.parseInt(resumenMap.get("n_mesas_instaladas").toString()))
                .mesasNoInstaladas(resumenMap.get("n_mesas_no_instaladas") == null ? null :Integer.parseInt(resumenMap.get("n_mesas_no_instaladas").toString()))
                .mesasPorProcesar(actasPorProcesar)
                .nulidad(resumenMap.get("n_estado_solicitud_nulidad") == null ? null :Integer.parseInt(resumenMap.get("n_estado_solicitud_nulidad").toString()))
                .otrasObservaciones(resumenMap.get("n_estado_otras_observaciones") == null ? null :Integer.parseInt(resumenMap.get("n_estado_otras_observaciones").toString()))
                .pendiente(resumenMap.get("n_estado_pendiente") == null ? null :Integer.parseInt(resumenMap.get("n_estado_pendiente").toString()))
                .sinDatos(resumenMap.get("n_estado_sin_datos") == null ? null :Integer.parseInt(resumenMap.get("n_estado_sin_datos").toString()))
                .sinFirma(resumenMap.get("n_estado_sin_firma") == null ? null :Integer.parseInt(resumenMap.get("n_estado_sin_firma").toString()))
                .siniestrada(resumenMap.get("n_estado_siniestrada") == null ? null :Integer.parseInt(resumenMap.get("n_estado_siniestrada").toString()))
                .actasProcesadasPorcentaje(actasProcesadasPorcentaje)
                .actasPorProcesarPorcentaje(actasPorProcesarPorcentaje)
                .porcentajeAvance(porcentajeAvance)
                .build();
    }
    
    /**
     * Genera el reporte PDF usando Jasper Reports
     */
    protected byte[] generarReportePDF(List<?> datos, String nombreReporte, Map<String, Object> parametros) {
        try {
            return Funciones.generarReporte(this.getClass(), datos, nombreReporte, parametros);
        } catch (Exception e) {
            throw new RuntimeException("Error generando reporte PDF: " + nombreReporte, e);
        }
    }

    Boolean esAgrupacionPolitica(String codigoAgrupacionPolitica) {
        if (codigoAgrupacionPolitica.equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_BLANCOS.toString()) ||
                codigoAgrupacionPolitica.equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_NULOS.toString()) ||
                codigoAgrupacionPolitica.equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_IMPUGNADOS.toString())) {
            return false;
        }
        return true;
    }
}
