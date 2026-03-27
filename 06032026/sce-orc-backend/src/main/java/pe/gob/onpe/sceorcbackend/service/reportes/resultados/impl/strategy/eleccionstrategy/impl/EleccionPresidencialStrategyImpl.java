package pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.strategy.eleccionstrategy.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.DetalleResultadosContabilizadas;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.FiltroResultadoContabilizadasDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteResultadoActasContDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ResultadoActasContabilizadasDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.UtilSceService;
import pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.factory.TipoReporteStrategyFactory;
import pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.TipoReporteStrategy;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;
import pe.gob.onpe.sceorcbackend.utils.ConstantesReportes;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;
import java.util.Map;

/**
 * Estrategia para manejar reportes de eleccion Presidencial
 */
@Component
public class EleccionPresidencialStrategyImpl extends EleccionStrategyAbstract {

    private static final Logger logger = LoggerFactory.getLogger(EleccionPresidencialStrategyImpl.class);

    private final UtilSceService utilSceService;
    private final TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory;

    public EleccionPresidencialStrategyImpl(UtilSceService utilSceService,
                                            TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory) {
        super(utilSceService);
        this.utilSceService = utilSceService;
        this.resultadosTipoReporteStrategyFactory = resultadosTipoReporteStrategyFactory;
    }

    @Override
    public boolean puedeManejar(FiltroResultadoContabilizadasDto filtro) {
        return filtro.getCodigoEleccion().equals(ConstantesComunes.COD_ELEC_PRE) ||
                filtro.getCodigoEleccion().equals(ConstantesComunes.COD_ELEC_DIST);
    }

    @Override
    public ResultadoActasContabilizadasDto procesarResultados(FiltroResultadoContabilizadasDto filtro) {
        // Usar la estrategia de tipo de reporte para obtener los datos
        TipoReporteStrategy reportStrategy = resultadosTipoReporteStrategyFactory.obtenerEstrategia(filtro);
        List<Map<String, Object>> resultadosMap = reportStrategy.obtenerDatos(filtro);

        if (resultadosMap.isEmpty())
            return null;

        return ResultadoActasContabilizadasDto
                .builder()
                .detalleResultado(getDetalleResultado(resultadosMap))
                .detalleTotal(getDetalleTotalResultados(resultadosMap, Boolean.FALSE))
                .resumenActas(getResumenActasContabilizadas(resultadosMap.get(0)))
                .cantidadVotosPref(0)
                .build();
    }

    @Override
    public byte[] generarReportePdf(FiltroResultadoContabilizadasDto filtro) {
        // Usar la estrategia de tipo de reporte para obtener los datos
        TipoReporteStrategy reportStrategy = resultadosTipoReporteStrategyFactory.obtenerEstrategia(filtro);
        List<Map<String, Object>> resultadosMap = reportStrategy.obtenerDatos(filtro);
        List<ReporteResultadoActasContDto> resultadosList = mapearResultadosParaPdf(resultadosMap);
        Map<String, Object> parametros = generarParametrosComunes(filtro, resultadosMap.get(0));
        agregarParametrosUbicacion(parametros, resultadosMap.get(0));
        parametros.put("tipoReporte", filtro.getTipoReporte().toString());
        return generarReportePDF(resultadosList, obtenerNombreReporte(), parametros);
    }

    @Override
    public List<ReporteResultadoActasContDto> mapearResultadosParaPdf(List<Map<String, Object>> resultadosMap) {
        return resultadosMap
                .parallelStream()
                .map(resultado -> {
                    return ReporteResultadoActasContDto
                            .builder()
                            .codAgrupacion(resultado.get("c_codigo_agrupacion_politica") == null ? "" : resultado.get("c_codigo_agrupacion_politica").toString())
                            .desAgrupacion(resultado.get("c_descripcion") == null ? "" : resultado.get("c_descripcion").toString())
                            .numVotos(Integer.parseInt(resultado.get("n_votos").toString()))
                            .codUbigeo(resultado.get("c_codigo_ubigeo") == null ? "" : resultado.get("c_codigo_ubigeo").toString())
                            .departamento(resultado.get("c_departamento") == null ? "" : resultado.get("c_departamento").toString())
                            .provincia(resultado.get("c_provincia") == null ? "" : resultado.get("c_provincia").toString())
                            .distrito(resultado.get("c_distrito") == null ? "" : resultado.get("c_distrito").toString())
                            .codOdpe(resultado.get("c_codigo_ambito_electoral") == null ? "" : resultado.get("c_codigo_ambito_electoral").toString())
                            .codCompu(resultado.get("c_codigo_centro_computo") == null ? "" : resultado.get("c_codigo_centro_computo").toString())
                            .electoresHabiles(Integer.parseInt(resultado.get("n_electores_habiles").toString()))
                            .totalCiudadVotaron(Integer.parseInt(resultado.get("n_ciudadanos_votaron").toString()))
                            .ainstalar(Integer.parseInt(resultado.get("n_mesas_a_instalar").toString()))
                            .porProcesar(Integer.parseInt(resultado.get("n_mesas_por_procesar").toString()))
                            .contabNormal(Integer.parseInt(resultado.get("n_estado_contabilizada_normal").toString()))
                            .contabInpugnadas(Integer.parseInt(resultado.get("n_estado_contabilidad_impugnada").toString()))
                            .errorMaterial(resultado.get("n_estado_error_material").toString())
                            .ilegible(resultado.get("n_estado_ilegible").toString())
                            .incompleta(resultado.get("n_estado_incompleta").toString())
                            .solicitudNulidad(resultado.get("n_estado_solicitud_nulidad").toString())
                            .sinDatos(resultado.get("n_estado_sin_datos").toString())
                            .actExt(resultado.get("n_estado_extraviada").toString())
                            .sinFirma(resultado.get("n_estado_sin_firma").toString())
                            .otrasObserv(resultado.get("n_estado_otras_observaciones").toString())
                            .contabAnuladas(Integer.parseInt(resultado.get("n_estado_contabilizada_anulada").toString()))
                            .mesasNoInstaladas(Integer.parseInt(resultado.get("n_mesas_no_instaladas").toString()))
                            .mesasInstaladas(Integer.parseInt(resultado.get("n_mesas_instaladas").toString()))
                            .actasProcesadas(Integer.parseInt(resultado.get("n_actas_procesadas").toString()))
                            .actSin(resultado.get("n_estado_siniestrada").toString())
                            .pendiente(Integer.parseInt(resultado.get("n_estado_pendiente").toString()))
                            .build();
                })
                .toList();
    }

    public String obtenerNombreReporte() {
        return ConstantesComunes.RESULTADO_ACTAS_CONTABILIZADAS_REPORT_JRXML;
    }

    private static List<DetalleResultadosContabilizadas> getDetalleResultado(List<Map<String, Object>> resultadosMap) {
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

        List<DetalleResultadosContabilizadas> detalleResultado = resultadosValidosMap
                .parallelStream()
                .map(resultado -> {

                    Double votosValidos = 0.0;
                    Double votosEmitidos = 0.0;
                    BigInteger votosBig = ((BigDecimal) resultado.get("n_votos")).toBigInteger();
                    Double votosDouble = ((BigDecimal) resultado.get("n_votos")).doubleValue();

                    if(totalVotosValidos.compareTo(0.0) != 0) {
                        votosValidos = votosDouble * 100 / totalVotosValidos;
                    }

                    if(totalVotosEmitidos.compareTo(0.0) != 0) {
                        votosEmitidos = votosDouble * 100 / totalVotosEmitidos;
                    }

                    return DetalleResultadosContabilizadas
                            .builder()
                            .numeroAp(Integer.parseInt(resultado.get("n_posicion").toString()))
                            .codigoAp(resultado.get("c_codigo_agrupacion_politica").toString())
                            .agrupacionPolitica(resultado.get("c_descripcion").toString())
                            .cantidadVotos(votosBig)
                            .votosValidados(votosValidos)
                            .votosEmitidos(votosEmitidos)
                            .build();
                })
                .toList();
        return detalleResultado;
    }

}
