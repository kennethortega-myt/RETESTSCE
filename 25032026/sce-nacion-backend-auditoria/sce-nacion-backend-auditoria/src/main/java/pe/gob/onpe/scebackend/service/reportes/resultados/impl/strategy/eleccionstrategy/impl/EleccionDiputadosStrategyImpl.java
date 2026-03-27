package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.eleccionstrategy.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

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

/**
 * Estrategia para manejar reportes de elecciones Diputados
 */
@Component
public class EleccionDiputadosStrategyImpl extends PreferencialEleccionStrategyAbstract {

    private static final String KEY_C_CODIGO_AGRUPACION_POLITICA = "c_codigo_agrupacion_politica";
    private static final String KEY_N_POSICION = "n_posicion";
    private static final String KEY_C_DESCRIPCION_AGRUPACION_POLITICA = "c_descripcion_agrupacion_politica";
    private static final String KEY_N_VOTOS = "n_votos";
    private static final String KEY_N_VOTO_PREF_LISTA_PREFIX = "n_voto_pref_lista_";
    private static final String KEY_C_NOMBRE_UBIGEO_NIVEL_01 = "c_nombre_ubigeo_nivel_01";
    private static final String KEY_C_NOMBRE_UBIGEO_NIVEL_02 = "c_nombre_ubigeo_nivel_02";
    private static final String KEY_C_NOMBRE_UBIGEO_NIVEL_03 = "c_nombre_ubigeo_nivel_03";
    private static final String KEY_N_ESTADO_PENDIENTE = "n_estado_pendiente";
    private static final String KEY_C_CODIGO_UBIGEO = "c_codigo_ubigeo";
    private static final String KEY_C_CODIGO_AMBITO_ELECTORAL = "c_codigo_ambito_electoral";
    private static final String KEY_C_CODIGO_CENTRO_COMPUTO = "c_codigo_centro_computo";

    private static final String KEY_N_ELECTORES_HABILES = "n_electores_habiles";
    private static final String KEY_N_CIUDADANOS_VOTARON = "n_ciudadanos_votaron";
    private static final String KEY_N_MESAS_A_INSTALAR = "n_mesas_a_instalar";
    private static final String KEY_N_MESAS_POR_PROCESAR = "n_mesas_por_procesar";

    private static final String KEY_N_ESTADO_CONTABILIZADA_NORMAL = "n_estado_contabilizada_normal";
    private static final String KEY_N_ESTADO_CONTABILIDAD_IMPUGNADA = "n_estado_contabilidad_impugnada";
    private static final String KEY_N_ESTADO_ERROR_MATERIAL = "n_estado_error_material";
    private static final String KEY_N_ESTADO_ILEGIBLE = "n_estado_ilegible";
    private static final String KEY_N_ESTADO_INCOMPLETA = "n_estado_incompleta";
    private static final String KEY_N_ESTADO_SOLICITUD_NULIDAD = "n_estado_solicitud_nulidad";
    private static final String KEY_N_ESTADO_SIN_DATOS = "n_estado_sin_datos";
    private static final String KEY_N_ESTADO_EXTRAVIADA = "n_estado_extraviada";
    private static final String KEY_N_ESTADO_SIN_FIRMA = "n_estado_sin_firma";
    private static final String KEY_N_ESTADO_OTRAS_OBSERVACIONES = "n_estado_otras_observaciones";
    private static final String KEY_N_ESTADO_CONTABILIZADA_ANULADA = "n_estado_contabilizada_anulada";
    private static final String KEY_N_MESAS_NO_INSTALADAS = "n_mesas_no_instaladas";
    private static final String KEY_N_MESAS_INSTALADAS = "n_mesas_instaladas";
    private static final String KEY_N_ACTAS_PROCESADAS = "n_actas_procesadas";
    private static final String KEY_N_ESTADO_SINIESTRADA = "n_estado_siniestrada";

    private static final int MAX_VOTOS_PREFERENCIALES = 36;
    private static final String BUILDER_SETTER_PREFIX = "numVotos";

    private static final Logger logger = LoggerFactory.getLogger(EleccionDiputadosStrategyImpl.class);
    private final TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory;

    public EleccionDiputadosStrategyImpl(UtilSceService utilSceService,
            IUbiEleccionAgrupolRepositoryCustom ubiEleccionAgrupolRepositoryCustom,
            TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory) {
        super(utilSceService, ubiEleccionAgrupolRepositoryCustom);
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

        return ResultadoActasContabilizadasDto.builder()
                .detalleResultado(getDetalleResultado(resultadosMap, cantidadVotosPreferencial))
                .detalleTotal(getDetalleTotalResultados(resultadosMap, Boolean.TRUE))
                .resumenActas(resultadosMap.isEmpty() ? null : getResumenActasContabilizadas(resultadosMap.getFirst()))
                .cantidadVotosPref(cantidadVotosPreferencial).build();
    }

    private static List<DetalleResultadosContabilizadas> getDetalleResultado(List<Map<String, Object>> resultadosMap,
            Integer cantidadVotosPreferencial) {
        return resultadosMap.stream()
                .filter(detalle -> !ConstantesComunes.NCODI_AGRUPOL_VOTOS_BLANCOS.toString()
                        .equals(detalle.get(KEY_C_CODIGO_AGRUPACION_POLITICA))
                        && !ConstantesComunes.NCODI_AGRUPOL_VOTOS_NULOS.toString()
                                .equals(detalle.get(KEY_C_CODIGO_AGRUPACION_POLITICA)))
                .map(resultado -> {

                    Integer[] votosPreferenciales = new Integer[cantidadVotosPreferencial];

                    for (int i = 0; i < cantidadVotosPreferencial; i++) {
                        Object valorVoto = resultado.get(KEY_N_VOTO_PREF_LISTA_PREFIX + (i + 1));
                        votosPreferenciales[i] = valorVoto == null ? null : Integer.parseInt(valorVoto.toString());
                    }

                    return DetalleResultadosContabilizadas.builder()
                            .numeroAp(Integer.parseInt(resultado.get(KEY_N_POSICION).toString()))
                            .codigoAp(resultado.get(KEY_C_CODIGO_AGRUPACION_POLITICA).toString())
                            .agrupacionPolitica(resultado.get(KEY_C_DESCRIPCION_AGRUPACION_POLITICA).toString())
                            .cantidadVotos(((BigDecimal) resultado.get(KEY_N_VOTOS)).toBigInteger())
                            .votosPreferenciales(votosPreferenciales).build();
                }).toList();
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
        return resultadosMap.stream().map(this::toReporteResultadoActasContDto).toList();
    }

    private ReporteResultadoActasContDto toReporteResultadoActasContDto(Map<String, Object> resultado) {
        String codigoAgrupacionPolitica = getStringOrEmpty(resultado, KEY_C_CODIGO_AGRUPACION_POLITICA);

        ReporteResultadoActasContDto.ReporteResultadoActasContDtoBuilder builder = buildBaseReporte(resultado,
                codigoAgrupacionPolitica);

        setVotosPreferenciales(builder, resultado);

        return builder.build();
    }

    private ReporteResultadoActasContDto.ReporteResultadoActasContDtoBuilder buildBaseReporte(
            Map<String, Object> resultado, String codigoAgrupacionPolitica) {

        Integer votos = getIntOrNull(resultado, KEY_N_VOTOS);

        return ReporteResultadoActasContDto.builder().codAgrupacion(codigoAgrupacionPolitica)
                .desAgrupacion(getStringOrEmpty(resultado, KEY_C_DESCRIPCION_AGRUPACION_POLITICA))
                .numVotos(getIntOrZero(resultado, KEY_N_VOTOS))
                .codUbigeo(getStringOrEmpty(resultado, KEY_C_CODIGO_UBIGEO))
                .departamento(getStringOrEmpty(resultado, KEY_C_NOMBRE_UBIGEO_NIVEL_01))
                .provincia(getStringOrEmpty(resultado, KEY_C_NOMBRE_UBIGEO_NIVEL_02))
                .distrito(getStringOrEmpty(resultado, KEY_C_NOMBRE_UBIGEO_NIVEL_03))
                .codOdpe(getStringOrEmpty(resultado, KEY_C_CODIGO_AMBITO_ELECTORAL))
                .codCompu(getStringOrEmpty(resultado, KEY_C_CODIGO_CENTRO_COMPUTO))
                .electoresHabiles(getIntOrNull(resultado, KEY_N_ELECTORES_HABILES))
                .totalCiudadVotaron(getIntOrNull(resultado, KEY_N_CIUDADANOS_VOTARON))
                .ainstalar(getIntOrNull(resultado, KEY_N_MESAS_A_INSTALAR))
                .porProcesar(getIntOrNull(resultado, KEY_N_MESAS_POR_PROCESAR))
                .contabNormal(getIntOrNull(resultado, KEY_N_ESTADO_CONTABILIZADA_NORMAL))
                .contabInpugnadas(getIntOrNull(resultado, KEY_N_ESTADO_CONTABILIDAD_IMPUGNADA))
                .errorMaterial(getStringOrNull(resultado, KEY_N_ESTADO_ERROR_MATERIAL))
                .ilegible(getStringOrNull(resultado, KEY_N_ESTADO_ILEGIBLE))
                .incompleta(getStringOrNull(resultado, KEY_N_ESTADO_INCOMPLETA))
                .solicitudNulidad(getStringOrNull(resultado, KEY_N_ESTADO_SOLICITUD_NULIDAD))
                .sinDatos(getStringOrNull(resultado, KEY_N_ESTADO_SIN_DATOS))
                .actExt(getStringOrNull(resultado, KEY_N_ESTADO_EXTRAVIADA))
                .sinFirma(getStringOrNull(resultado, KEY_N_ESTADO_SIN_FIRMA))
                .otrasObserv(getStringOrNull(resultado, KEY_N_ESTADO_OTRAS_OBSERVACIONES))
                .contabAnuladas(getIntOrNull(resultado, KEY_N_ESTADO_CONTABILIZADA_ANULADA))
                .mesasNoInstaladas(getIntOrNull(resultado, KEY_N_MESAS_NO_INSTALADAS))
                .mesasInstaladas(getIntOrNull(resultado, KEY_N_MESAS_INSTALADAS))
                .actasProcesadas(getIntOrNull(resultado, KEY_N_ACTAS_PROCESADAS))
                .actSin(getStringOrNull(resultado, KEY_N_ESTADO_SINIESTRADA)).totalVotos(votos)
                .pendiente(getIntOrNull(resultado, KEY_N_ESTADO_PENDIENTE))
                .esAgrupacionPolitica(esAgrupacionPolitica(codigoAgrupacionPolitica));
    }

    /**
     * Método auxiliar para asignar los votos preferenciales de forma dinámica
     */
    private void setVotosPreferenciales(ReporteResultadoActasContDto.ReporteResultadoActasContDtoBuilder builder,
            Map<String, Object> resultado) {
        try {
            Class<?> builderClass = builder.getClass();
            for (int i = 1; i <= MAX_VOTOS_PREFERENCIALES; i++) {
                String fieldName = BUILDER_SETTER_PREFIX + i;
                String resultKey = KEY_N_VOTO_PREF_LISTA_PREFIX + i;

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

    private static String getStringOrEmpty(Map<String, Object> row, String key) {
        Object v = row.get(key);
        return v == null ? "" : v.toString();
    }

    private static Integer getIntOrNull(Map<String, Object> row, String key) {
        Object v = row.get(key);
        if (v == null)
            return null;
        if (v instanceof Number n)
            return n.intValue();
        return Integer.valueOf(v.toString());
    }

    private static int getIntOrZero(Map<String, Object> row, String key) {
        Object v = row.get(key);
        if (v == null)
            return 0;
        if (v instanceof Number n)
            return n.intValue();
        return Integer.parseInt(v.toString());
    }

    private static String getStringOrNull(Map<String, Object> row, String key) {
        Object v = row.get(key);
        return v == null ? null : v.toString();
    }
}
