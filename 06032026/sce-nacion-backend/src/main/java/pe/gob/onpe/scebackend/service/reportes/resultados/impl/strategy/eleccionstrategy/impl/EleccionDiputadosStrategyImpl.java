package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.eleccionstrategy.impl;

import org.apache.commons.math3.exception.NoDataException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import pe.gob.onpe.scebackend.exeption.DataNoFoundException;
import pe.gob.onpe.scebackend.model.dto.reportes.DetalleResultadosContabilizadas;
import pe.gob.onpe.scebackend.model.dto.reportes.FiltroResultadoContabilizadasDto;
import pe.gob.onpe.scebackend.model.dto.reportes.ReporteResultadoActasContDto;
import pe.gob.onpe.scebackend.model.dto.reportes.ResultadoActasContabilizadasDto;
import pe.gob.onpe.scebackend.model.orc.repository.comun.IUbiEleccionAgrupolRepositoryCustom;
import pe.gob.onpe.scebackend.model.service.UtilSceService;
import pe.gob.onpe.scebackend.service.reportes.resultados.impl.factory.TipoReporteStrategyFactory;
import pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.TipoReporteStrategy;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesReportes;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Estrategia para manejar reportes de elecciones Diputados
 */
@Component
public class EleccionDiputadosStrategyImpl extends PreferencialEleccionStrategyAbstract {

    private static final Logger logger = LoggerFactory.getLogger(EleccionDiputadosStrategyImpl.class);
    private final UtilSceService utilSceService;
    private IUbiEleccionAgrupolRepositoryCustom ubiEleccionAgrupolRepositoryCustom;
    private final TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory;

    public EleccionDiputadosStrategyImpl(UtilSceService utilSceService, IUbiEleccionAgrupolRepositoryCustom ubiEleccionAgrupolRepositoryCustom, TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory) {
        super(utilSceService, ubiEleccionAgrupolRepositoryCustom);
        this.utilSceService = utilSceService;
        this.ubiEleccionAgrupolRepositoryCustom = ubiEleccionAgrupolRepositoryCustom;
        this.resultadosTipoReporteStrategyFactory = resultadosTipoReporteStrategyFactory;
    }

    @Override
    public boolean puedeManejar(FiltroResultadoContabilizadasDto filtro) {
        return filtro.getCodigoEleccion().equals(ConstantesComunes.COD_ELEC_DIPUTADO);
    }

    @Override
    public ResultadoActasContabilizadasDto procesarResultados(FiltroResultadoContabilizadasDto filtro) {
        TipoReporteStrategy reportStrategy = resultadosTipoReporteStrategyFactory.obtenerEstrategia(filtro);
        List<Map<String, Object>> resultadosMap = reportStrategy.obtenerDatos(filtro);
        Integer cantidadVotosPreferencial = obtenerCantidadVotosPreferencial(filtro);
        if (resultadosMap.isEmpty())
            throw new DataNoFoundException(ConstantesReportes.DATA_NO_ENCONTRADA);

        return ResultadoActasContabilizadasDto
                .builder()
                .detalleResultado(getDetalleResultado(resultadosMap, cantidadVotosPreferencial))
                .detalleTotal(getDetalleTotalResultados(resultadosMap, Boolean.TRUE))
                .resumenActas(resultadosMap.isEmpty() ? null : getResumenActasContabilizadas(resultadosMap.getFirst()))
                .cantidadVotosPref(cantidadVotosPreferencial)
                .build();
    }

    private static List<DetalleResultadosContabilizadas> getDetalleResultado(List<Map<String, Object>> resultadosMap, Integer cantidadVotosPreferencial) {
        List<Map<String, Object>> resultadosValidosMap = resultadosMap
                .parallelStream()
                .filter(detalle -> !detalle.get("c_codigo_agrupacion_politica").equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_BLANCOS.toString())
                        && !detalle.get("c_codigo_agrupacion_politica").equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_NULOS.toString()))
                .toList();
        List<DetalleResultadosContabilizadas> detalleResultado = resultadosValidosMap
                .parallelStream()
                .map(resultado -> {

                    Integer[] votosPreferenciales = new Integer[cantidadVotosPreferencial];
                    for(int i = 0; i < cantidadVotosPreferencial; i++) {
                        Object valorVoto = resultado.get("n_voto_pref_lista_" + (i+1));
                        votosPreferenciales[i] = valorVoto == null ? null : Integer.parseInt(valorVoto.toString());
                    }

                    return DetalleResultadosContabilizadas
                            .builder()
                            .numeroAp(Integer.parseInt(resultado.get("n_posicion").toString()))
                            .codigoAp(resultado.get("c_codigo_agrupacion_politica").toString())
                            .agrupacionPolitica(resultado.get("c_descripcion_agrupacion_politica").toString())
                            .cantidadVotos( ((BigDecimal) resultado.get("n_votos")).toBigInteger() )
                            .votosPreferenciales(votosPreferenciales)
                            .build();
                })
                .toList();
        return detalleResultado;
    }

    @Override
    @Transactional("locationTransactionManager")
    public byte[] generarReportePdf(FiltroResultadoContabilizadasDto filtro) {
        TipoReporteStrategy reportStrategy = resultadosTipoReporteStrategyFactory.obtenerEstrategia(filtro);
        List<Map<String, Object>> resultadosMap = reportStrategy.obtenerDatos(filtro);
        Integer cantidadVotosPreferencial = obtenerCantidadVotosPreferencial(filtro);

        List<ReporteResultadoActasContDto> resultadosList = mapearResultadosParaPdf(resultadosMap);
        Map<String, Object> parametros = generarParametrosComunes(filtro, resultadosMap.get(0));

        agregarParametroCantidadColumnas(parametros, cantidadVotosPreferencial);
        parametros.put("tipoReporte", filtro.getTipoReporte().toString());
        
        return generarReportePDF(resultadosList, obtenerNombreReporteDinamico(cantidadVotosPreferencial), parametros);
    }

    private void agregarParametroCantidadColumnas(Map<String, Object> parametros, Integer cantidadVotosPreferencial) {
        parametros.put("p_cantidad_columna", cantidadVotosPreferencial);
    }

    @Override
    public List<ReporteResultadoActasContDto> mapearResultadosParaPdf(List<Map<String, Object>> resultadosMap) {
        return resultadosMap
                .parallelStream()
                .map(resultado -> {
                    String codigoAgrupacionPolitica = resultado.get("c_codigo_agrupacion_politica") == null ? "" : resultado.get("c_codigo_agrupacion_politica").toString();
                    ReporteResultadoActasContDto.ReporteResultadoActasContDtoBuilder builder = ReporteResultadoActasContDto
                            .builder()
                            .codAgrupacion(codigoAgrupacionPolitica)
                            .desAgrupacion(resultado.get("c_descripcion_agrupacion_politica") == null ? "" : resultado.get("c_descripcion_agrupacion_politica").toString())
                            .numVotos(Integer.parseInt(resultado.get("n_votos").toString()))
                            .codUbigeo(resultado.get("c_codigo_ubigeo") == null ? "" : resultado.get("c_codigo_ubigeo").toString())
                            .departamento(resultado.get("c_nombre_ubigeo_nivel_01") == null ? "" : resultado.get("c_nombre_ubigeo_nivel_01").toString())
                            .provincia(resultado.get("c_nombre_ubigeo_nivel_02") == null ? "" : resultado.get("c_nombre_ubigeo_nivel_02").toString())
                            .distrito(resultado.get("c_nombre_ubigeo_nivel_03") == null ? "" : resultado.get("c_nombre_ubigeo_nivel_03").toString())
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
                            .totalVotos(Integer.parseInt(resultado.get("n_votos").toString()))
                            .pendiente(Integer.parseInt(resultado.get("n_estado_pendiente").toString()))
                            .esAgrupacionPolitica(esAgrupacionPolitica(codigoAgrupacionPolitica));

                    // Asignar votos preferenciales de forma dinámica
                    setVotosPreferenciales(builder, resultado);

                    return builder.build();
                })
                .toList();
    }

    /**
     * Método auxiliar para asignar los votos preferenciales de forma dinámica
     */
    private void setVotosPreferenciales(ReporteResultadoActasContDto.ReporteResultadoActasContDtoBuilder builder, Map<String, Object> resultado) {
        try {
            Class<?> builderClass = builder.getClass();
            for (int i = 1; i <= 36; i++) {
                String fieldName = "numVotos" + i;
                String resultKey = "n_voto_pref_lista_" + i;

                Object valor = resultado.get(resultKey);
                Integer valorVoto = valor == null ? null : Integer.parseInt(valor.toString());

                // Buscar y ejecutar el método setter correspondiente
                try {
                    java.lang.reflect.Method method = builderClass.getMethod(fieldName, Integer.class);
                    method.invoke(builder, valorVoto);
                } catch (NoSuchMethodException e) {
                    // El método no existe, continuar con el siguiente
                    continue;
                }
            }
        } catch (Exception e) {
            // En caso de error, log y continuar
            logger.error("Error al asignar votos preferenciales: ", e);
        }
    }
}
