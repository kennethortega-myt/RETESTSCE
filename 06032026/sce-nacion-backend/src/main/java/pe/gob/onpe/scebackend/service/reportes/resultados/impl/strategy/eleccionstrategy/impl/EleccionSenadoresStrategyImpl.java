package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.eleccionstrategy.impl;

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
public class EleccionSenadoresStrategyImpl extends PreferencialEleccionStrategyAbstract {

    Logger logger = LoggerFactory.getLogger(EleccionSenadoresStrategyImpl.class);

    // Constantes para nombres de campos en resultados
    private static final String CAMPO_CODIGO_AGRUPACION_POLITICA = "c_codigo_agrupacion_politica";
    private static final String CAMPO_DESCRIPCION_AGRUPACION_POLITICA = "c_descripcion_agrupacion_politica";
    private static final String CAMPO_POSICION = "n_posicion";
    private static final String CAMPO_VOTOS = "n_votos";
    private static final String CAMPO_CODIGO_UBIGEO = "c_codigo_ubigeo";
    private static final String CAMPO_NOMBRE_UBIGEO_NIVEL_01 = "c_nombre_ubigeo_nivel_01";
    private static final String CAMPO_NOMBRE_UBIGEO_NIVEL_02 = "c_nombre_ubigeo_nivel_02";
    private static final String CAMPO_NOMBRE_UBIGEO_NIVEL_03 = "c_nombre_ubigeo_nivel_03";
    private static final String CAMPO_CODIGO_AMBITO_ELECTORAL = "c_codigo_ambito_electoral";
    private static final String CAMPO_CODIGO_CENTRO_COMPUTO = "c_codigo_centro_computo";
    private static final String CAMPO_ELECTORES_HABILES = "n_electores_habiles";
    private static final String CAMPO_CIUDADANOS_VOTARON = "n_ciudadanos_votaron";
    private static final String CAMPO_MESAS_A_INSTALAR = "n_mesas_a_instalar";
    private static final String CAMPO_MESAS_POR_PROCESAR = "n_mesas_por_procesar";
    private static final String CAMPO_ESTADO_CONTABILIZADA_NORMAL = "n_estado_contabilizada_normal";
    private static final String CAMPO_ESTADO_CONTABILIDAD_IMPUGNADA = "n_estado_contabilidad_impugnada";
    private static final String CAMPO_ESTADO_ERROR_MATERIAL = "n_estado_error_material";
    private static final String CAMPO_ESTADO_ILEGIBLE = "n_estado_ilegible";
    private static final String CAMPO_ESTADO_INCOMPLETA = "n_estado_incompleta";
    private static final String CAMPO_ESTADO_SOLICITUD_NULIDAD = "n_estado_solicitud_nulidad";
    private static final String CAMPO_ESTADO_SIN_DATOS = "n_estado_sin_datos";
    private static final String CAMPO_ESTADO_EXTRAVIADA = "n_estado_extraviada";
    private static final String CAMPO_ESTADO_SIN_FIRMA = "n_estado_sin_firma";
    private static final String CAMPO_ESTADO_OTRAS_OBSERVACIONES = "n_estado_otras_observaciones";
    private static final String CAMPO_ESTADO_CONTABILIZADA_ANULADA = "n_estado_contabilizada_anulada";
    private static final String CAMPO_MESAS_NO_INSTALADAS = "n_mesas_no_instaladas";
    private static final String CAMPO_MESAS_INSTALADAS = "n_mesas_instaladas";
    private static final String CAMPO_ACTAS_PROCESADAS = "n_actas_procesadas";
    private static final String CAMPO_ESTADO_SINIESTRADA = "n_estado_siniestrada";
    private static final String CAMPO_ESTADO_PENDIENTE = "n_estado_pendiente";
    private static final String PREFIJO_VOTO_PREFERENCIAL = "n_voto_pref_lista_";

    private final TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory;

    public EleccionSenadoresStrategyImpl(UtilSceService utilService, IUbiEleccionAgrupolRepositoryCustom ubiRepository, TipoReporteStrategyFactory tipoReporteFactory) {
        super(utilService, ubiRepository);
        this.resultadosTipoReporteStrategyFactory = tipoReporteFactory;
    }

    @Override
    public boolean puedeManejar(FiltroResultadoContabilizadasDto filtro) {
        return filtro.getCodigoEleccion().equals(ConstantesComunes.COD_ELEC_SENADO_UNICO) ||
                filtro.getCodigoEleccion().equals(ConstantesComunes.COD_ELEC_SENADO_MULTIPLE);
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
                .filter(detalle -> !detalle.get(CAMPO_CODIGO_AGRUPACION_POLITICA).equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_BLANCOS.toString())
                        && !detalle.get(CAMPO_CODIGO_AGRUPACION_POLITICA).equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_NULOS.toString()))
                .toList();
        return resultadosValidosMap
                .parallelStream()
                .map(resultado -> {

                    Integer[] votosPreferenciales = new Integer[cantidadVotosPreferencial];
                    for(int i = 0; i < cantidadVotosPreferencial; i++) {
                        Object valorVoto = resultado.get(PREFIJO_VOTO_PREFERENCIAL + (i+1));
                        votosPreferenciales[i] = valorVoto == null ? null : Integer.parseInt(valorVoto.toString());
                    }

                    return DetalleResultadosContabilizadas
                            .builder()
                            .numeroAp(Integer.parseInt(resultado.get(CAMPO_POSICION).toString()))
                            .codigoAp(resultado.get(CAMPO_CODIGO_AGRUPACION_POLITICA).toString())
                            .agrupacionPolitica(resultado.get(CAMPO_DESCRIPCION_AGRUPACION_POLITICA).toString())
                            .cantidadVotos( ((BigDecimal) resultado.get(CAMPO_VOTOS)).toBigInteger() )
                            .votosPreferenciales(votosPreferenciales)
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional("locationTransactionManager")
    public byte[] generarReportePdf(FiltroResultadoContabilizadasDto filtro) {
        TipoReporteStrategy reportStrategy = resultadosTipoReporteStrategyFactory.obtenerEstrategia(filtro);
        List<Map<String, Object>> resultadosMap = reportStrategy.obtenerDatos(filtro);
        Integer cantidadVotosPreferencial = obtenerCantidadVotosPreferencial(filtro);

        List<ReporteResultadoActasContDto> resultadosList = mapearResultadosParaPdf(resultadosMap);
        Map<String, Object> parametros = generarParametrosComunes(filtro, resultadosMap.getFirst());

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
                .map(this::mapearResultadoIndividual)
                .toList();
    }

    /**
     * Mapea un resultado individual a DTO para PDF
     */
    private ReporteResultadoActasContDto mapearResultadoIndividual(Map<String, Object> resultado) {
        String codigoAgrupacionPolitica = obtenerValorString(resultado, CAMPO_CODIGO_AGRUPACION_POLITICA);
        
        ReporteResultadoActasContDto.ReporteResultadoActasContDtoBuilder builder = ReporteResultadoActasContDto
                .builder()
                .codAgrupacion(codigoAgrupacionPolitica)
                .desAgrupacion(obtenerValorString(resultado, CAMPO_DESCRIPCION_AGRUPACION_POLITICA))
                .numVotos(obtenerValorInteger(resultado, CAMPO_VOTOS))
                .codUbigeo(obtenerValorString(resultado, CAMPO_CODIGO_UBIGEO))
                .departamento(obtenerValorString(resultado, CAMPO_NOMBRE_UBIGEO_NIVEL_01))
                .provincia(obtenerValorString(resultado, CAMPO_NOMBRE_UBIGEO_NIVEL_02))
                .distrito(obtenerValorString(resultado, CAMPO_NOMBRE_UBIGEO_NIVEL_03))
                .codOdpe(obtenerValorString(resultado, CAMPO_CODIGO_AMBITO_ELECTORAL))
                .codCompu(obtenerValorString(resultado, CAMPO_CODIGO_CENTRO_COMPUTO))
                .electoresHabiles(obtenerValorInteger(resultado, CAMPO_ELECTORES_HABILES))
                .totalCiudadVotaron(obtenerValorInteger(resultado, CAMPO_CIUDADANOS_VOTARON))
                .ainstalar(obtenerValorInteger(resultado, CAMPO_MESAS_A_INSTALAR))
                .porProcesar(obtenerValorInteger(resultado, CAMPO_MESAS_POR_PROCESAR))
                .contabNormal(obtenerValorInteger(resultado, CAMPO_ESTADO_CONTABILIZADA_NORMAL))
                .contabInpugnadas(obtenerValorInteger(resultado, CAMPO_ESTADO_CONTABILIDAD_IMPUGNADA))
                .errorMaterial(obtenerValorString(resultado, CAMPO_ESTADO_ERROR_MATERIAL))
                .ilegible(obtenerValorString(resultado, CAMPO_ESTADO_ILEGIBLE))
                .incompleta(obtenerValorString(resultado, CAMPO_ESTADO_INCOMPLETA))
                .solicitudNulidad(obtenerValorString(resultado, CAMPO_ESTADO_SOLICITUD_NULIDAD))
                .sinDatos(obtenerValorString(resultado, CAMPO_ESTADO_SIN_DATOS))
                .actExt(obtenerValorString(resultado, CAMPO_ESTADO_EXTRAVIADA))
                .sinFirma(obtenerValorString(resultado, CAMPO_ESTADO_SIN_FIRMA))
                .otrasObserv(obtenerValorString(resultado, CAMPO_ESTADO_OTRAS_OBSERVACIONES))
                .contabAnuladas(obtenerValorInteger(resultado, CAMPO_ESTADO_CONTABILIZADA_ANULADA))
                .mesasNoInstaladas(obtenerValorInteger(resultado, CAMPO_MESAS_NO_INSTALADAS))
                .mesasInstaladas(obtenerValorInteger(resultado, CAMPO_MESAS_INSTALADAS))
                .actasProcesadas(obtenerValorInteger(resultado, CAMPO_ACTAS_PROCESADAS))
                .actSin(obtenerValorString(resultado, CAMPO_ESTADO_SINIESTRADA))
                .totalVotos(obtenerValorInteger(resultado, CAMPO_VOTOS))
                .pendiente(obtenerValorInteger(resultado, CAMPO_ESTADO_PENDIENTE))
                .esAgrupacionPolitica(esAgrupacionPolitica(codigoAgrupacionPolitica));

        setVotosPreferenciales(builder, resultado);
        
        return builder.build();
    }

    /**
     * Obtiene un valor String del mapa, retornando cadena vacía si es null
     */
    private String obtenerValorString(Map<String, Object> resultado, String campo) {
        Object valor = resultado.get(campo);
        return valor == null ? "" : valor.toString();
    }

    /**
     * Obtiene un valor Integer del mapa
     */
    private Integer obtenerValorInteger(Map<String, Object> resultado, String campo) {
        return Integer.parseInt(resultado.get(campo).toString());
    }

    /**
     * Método auxiliar para asignar los votos preferenciales de forma dinámica
     */
    private void setVotosPreferenciales(ReporteResultadoActasContDto.ReporteResultadoActasContDtoBuilder builder, Map<String, Object> resultado) {
        try {
            Class<?> builderClass = builder.getClass();
            for (int i = 1; i <= 36; i++) {
                asignarVotoPreferencial(builder, builderClass, resultado, i);
            }
        } catch (Exception e) {
            // En caso de error, log y continuar
            logger.error("Error al asignar votos preferenciales: ",e);
        }
    }

    /**
     * Asigna un voto preferencial individual al builder
     */
    private void asignarVotoPreferencial(ReporteResultadoActasContDto.ReporteResultadoActasContDtoBuilder builder, 
                                         Class<?> builderClass, 
                                         Map<String, Object> resultado, 
                                         int numeroVoto) {
        String fieldName = "numVotos" + numeroVoto;
        String resultKey = PREFIJO_VOTO_PREFERENCIAL + numeroVoto;

        Object valor = resultado.get(resultKey);
        Integer valorVoto = valor == null ? null : Integer.parseInt(valor.toString());

        try {
            java.lang.reflect.Method method = builderClass.getMethod(fieldName, Integer.class);
            method.invoke(builder, valorVoto);
        } catch (NoSuchMethodException e) {
            // Ignorado: El método no existe cuando el número de voto supera los campos disponibles en el DTO
        } catch (Exception e) {
            // Otros errores de reflexión, continuar con el siguiente
            logger.error("Error al asignar voto preferencial {} ",numeroVoto,e);
        }
    }
}
