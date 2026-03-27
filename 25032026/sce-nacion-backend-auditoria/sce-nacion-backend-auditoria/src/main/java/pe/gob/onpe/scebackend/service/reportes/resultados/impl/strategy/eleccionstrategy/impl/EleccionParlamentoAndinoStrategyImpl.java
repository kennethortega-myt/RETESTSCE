package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.eleccionstrategy.impl;

import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
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

@Log4j2
@Component
public class EleccionParlamentoAndinoStrategyImpl extends PreferencialEleccionStrategyAbstract {

    private final TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory;

    private static final String CAMPO_CODIGO_AGRUPOL = "c_codigo_agrupacion_politica";
    private static final String CAMPO_DESC_AGRUPOL = "c_descripcion_agrupacion_politica";
    public static final String VOTOS = "n_votos";

    public EleccionParlamentoAndinoStrategyImpl(UtilSceService utilSceService, TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory,
                                                IUbiEleccionAgrupolRepositoryCustom ubiEleccionAgrupolRepositoryCustom) {
        super(utilSceService, ubiEleccionAgrupolRepositoryCustom);
        this.resultadosTipoReporteStrategyFactory = resultadosTipoReporteStrategyFactory;
    }

    @Override
    public boolean puedeManejar(FiltroResultadoContabilizadasDto filtro) {
        return filtro.getCodigoEleccion().equals(ConstantesComunes.COD_ELEC_PAR);
    }

    @Override
    public ResultadoActasContabilizadasDto procesarResultados(FiltroResultadoContabilizadasDto filtro) {
        TipoReporteStrategy reportStrategy = resultadosTipoReporteStrategyFactory.obtenerEstrategia(filtro);
        List<Map<String, Object>> resultadosMap = reportStrategy.obtenerDatos(filtro);
        Integer cantidadVotosPreferencial = ConstantesComunes.CANTIDAD_VOTOS_PREFERENCIALES_PARLAMENTO;
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

    @Override
    public byte[] generarReportePdf(FiltroResultadoContabilizadasDto filtro) {
        TipoReporteStrategy reportStrategy = resultadosTipoReporteStrategyFactory.obtenerEstrategia(filtro);
        List<Map<String, Object>> resultadosMap = reportStrategy.obtenerDatos(filtro);
        if (resultadosMap.isEmpty())
            throw new DataNoFoundException(ConstantesReportes.DATA_NO_ENCONTRADA);
        List<ReporteResultadoActasContDto> resultadosList = mapearResultadosParaPdf(resultadosMap);
        Map<String, Object> parametros = generarParametrosComunes(filtro, resultadosMap.getFirst());
        Integer cantidadVotosPreferencial = ConstantesComunes.CANTIDAD_VOTOS_PREFERENCIALES_PARLAMENTO;
        parametros.put("p_cantidad_columna", cantidadVotosPreferencial);
        parametros.put("tipoReporte", filtro.getTipoReporte().toString());
        
        return generarReportePDF(resultadosList, obtenerNombreReporteDinamico(cantidadVotosPreferencial), parametros);
    }

    private static List<DetalleResultadosContabilizadas> getDetalleResultado(List<Map<String, Object>> resultadosMap, Integer cantidadVotosPreferencial) {
        List<Map<String, Object>> resultadosValidosMap = resultadosMap
                .parallelStream()
                .filter(detalle -> !detalle.get(CAMPO_CODIGO_AGRUPOL).equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_BLANCOS.toString())
                        && !detalle.get(CAMPO_CODIGO_AGRUPOL).equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_NULOS.toString()))
                .toList();
        return resultadosValidosMap
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
                            .codigoAp(resultado.get(CAMPO_CODIGO_AGRUPOL).toString())
                            .agrupacionPolitica(resultado.get(CAMPO_DESC_AGRUPOL).toString())
                            .cantidadVotos( ((BigDecimal) resultado.get(VOTOS)).toBigInteger() )
                            .votosPreferenciales(votosPreferenciales)
                            .build();
                })
                .toList();
    }

    @Override
    public List<ReporteResultadoActasContDto> mapearResultadosParaPdf(List<Map<String, Object>> resultadosMap) {
        return resultadosMap
                .parallelStream()
                .map(this::mapearResultado)
                .toList();
    }

    private ReporteResultadoActasContDto mapearResultado(Map<String, Object> resultado) {
        String codigoAgrupacionPolitica = resultado.get(CAMPO_CODIGO_AGRUPOL) == null ? "" : resultado.get(CAMPO_CODIGO_AGRUPOL).toString();

        ReporteResultadoActasContDto.ReporteResultadoActasContDtoBuilder builder = ReporteResultadoActasContDto.builder()
                .codAgrupacion(codigoAgrupacionPolitica)
                .desAgrupacion(resultado.get(CAMPO_DESC_AGRUPOL) == null ? "" : resultado.get(CAMPO_DESC_AGRUPOL).toString())
                .numVotos(Integer.parseInt(resultado.get(VOTOS).toString()))
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
                .pendiente(Integer.parseInt(resultado.get("n_estado_pendiente").toString()))
                .esAgrupacionPolitica(esAgrupacionPolitica(codigoAgrupacionPolitica))

                .totalVotos(Integer.parseInt(resultado.get(VOTOS).toString()));

        setVotosPreferenciales(builder, resultado);

        return builder.build();
    }

    private void setVotosPreferenciales(ReporteResultadoActasContDto.ReporteResultadoActasContDtoBuilder builder, Map<String, Object> resultado) {
        Class<?> builderClass = builder.getClass();

        for (int i = 1; i <= 36; i++) {
            String methodName = "numVotos" + i;
            String resultKey = "n_voto_pref_lista_" + i;

            Object valorRaw = resultado.get(resultKey);
            if (valorRaw == null) continue;

            try {
                Integer valorVoto = Integer.valueOf(valorRaw.toString());
                java.lang.reflect.Method method = builderClass.getMethod(methodName, Integer.class);
                method.invoke(builder, valorVoto);
            } catch (NoSuchMethodException e) {
                log.trace("El método {} no existe en el builder, omitiendo...", methodName);
            } catch (Exception e) {
                log.error("Error al procesar el campo {} con valor {}", methodName, valorRaw, e);
            }
        }
    }

}
