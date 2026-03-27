package pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.strategy.eleccionstrategy.impl;

import org.springframework.stereotype.Component;
import pe.gob.onpe.sceorcbackend.exception.DataNoFoundException;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.DetalleResultadosContabilizadas;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.FiltroResultadoContabilizadasDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ReporteResultadoActasContDto;
import pe.gob.onpe.sceorcbackend.model.dto.reporte.ResultadoActasContabilizadasDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.IUbiEleccionAgrupolRepositoryCustom;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.UtilSceService;
import pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.factory.TipoReporteStrategyFactory;
import pe.gob.onpe.sceorcbackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.TipoReporteStrategy;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;
import pe.gob.onpe.sceorcbackend.utils.ConstantesReportes;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Component
public class EleccionParlamentoAndinoStrategyImpl extends PreferencialEleccionStrategyAbstract {

    private final UtilSceService utilSceService;
    private final TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory;
    private IUbiEleccionAgrupolRepositoryCustom ubiEleccionAgrupolRepositoryCustom;


    public EleccionParlamentoAndinoStrategyImpl(UtilSceService utilSceService, TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory, IUbiEleccionAgrupolRepositoryCustom ubiEleccionAgrupolRepositoryCustom) {
        super(utilSceService, ubiEleccionAgrupolRepositoryCustom);
        this.utilSceService = utilSceService;
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
                .resumenActas(getResumenActasContabilizadas(resultadosMap.get(0)))
                .cantidadVotosPref(cantidadVotosPreferencial)
                .build();
    }

    @Override
    public byte[] generarReportePdf(FiltroResultadoContabilizadasDto filtro) {
        // Usar la estrategia de tipo de reporte para obtener los datos
        TipoReporteStrategy reportStrategy = resultadosTipoReporteStrategyFactory.obtenerEstrategia(filtro);
        List<Map<String, Object>> resultadosMap = reportStrategy.obtenerDatos(filtro);
        if (resultadosMap.isEmpty())
            throw new DataNoFoundException(ConstantesReportes.DATA_NO_ENCONTRADA);
        List<ReporteResultadoActasContDto> resultadosList = mapearResultadosParaPdf(resultadosMap);
        Map<String, Object> parametros = generarParametrosComunes(filtro, resultadosMap.get(0));
        agregarParametrosUbicacion(parametros, resultadosMap.get(0));
        Integer cantidadVotosPreferencial = ConstantesComunes.CANTIDAD_VOTOS_PREFERENCIALES_PARLAMENTO;
        parametros.put("p_cantidad_columna", cantidadVotosPreferencial);
        parametros.put("tipoReporte", filtro.getTipoReporte().toString());
        return generarReportePDF(resultadosList, obtenerNombreReporteDinamico(cantidadVotosPreferencial), parametros);
    }

    private static List<DetalleResultadosContabilizadas> getDetalleResultado(List<Map<String, Object>> resultadosMap, Integer cantidadVotosPreferencial) {
        List<Map<String, Object>> resultadosValidosMap = resultadosMap
                .parallelStream()
                .filter(detalle -> !detalle.get("c_codigo_agrupacion_politica").equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_BLANCOS.toString())
                        && !detalle.get("c_codigo_agrupacion_politica").equals(ConstantesComunes.NCODI_AGRUPOL_VOTOS_NULOS.toString()))
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
                            .codigoAp(resultado.get("c_codigo_agrupacion_politica").toString())
                            .agrupacionPolitica(resultado.get("c_descripcion_agrupacion_politica").toString())
                            .cantidadVotos( ((BigDecimal) resultado.get("n_votos")).toBigInteger() )
                            .votosPreferenciales(votosPreferenciales)
                            .build();
                })
                .toList();
    }

    @Override
    public List<ReporteResultadoActasContDto> mapearResultadosParaPdf(List<Map<String, Object>> resultadosMap) {
        return resultadosMap
                .parallelStream()
                .map(resultado -> {
                    String codigoAgrupacionPolitica = resultado.get("c_codigo_agrupacion_politica") == null ? "" : resultado.get("c_codigo_agrupacion_politica").toString();
                    return ReporteResultadoActasContDto
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
                            .esAgrupacionPolitica(esAgrupacionPolitica(codigoAgrupacionPolitica))
                            .pendiente(Integer.parseInt(resultado.get("n_estado_pendiente").toString()))

                            .totalVotos(Integer.parseInt(resultado.get("n_votos").toString()))
                            .numVotos1(Integer.parseInt(resultado.get("n_voto_pref_lista_1") == null ? "0" : resultado.get("n_voto_pref_lista_1").toString()))
                            .numVotos2(Integer.parseInt(resultado.get("n_voto_pref_lista_2") == null ? "0" : resultado.get("n_voto_pref_lista_2").toString()))
                            .numVotos3(Integer.parseInt(resultado.get("n_voto_pref_lista_3") == null ? "0" : resultado.get("n_voto_pref_lista_3").toString()))
                            .numVotos4(Integer.parseInt(resultado.get("n_voto_pref_lista_4") == null ? "0" : resultado.get("n_voto_pref_lista_4").toString()))
                            .numVotos5(Integer.parseInt(resultado.get("n_voto_pref_lista_5") == null ? "0" : resultado.get("n_voto_pref_lista_5").toString()))
                            .numVotos6(Integer.parseInt(resultado.get("n_voto_pref_lista_6") == null ? "0" : resultado.get("n_voto_pref_lista_6").toString()))
                            .numVotos7(Integer.parseInt(resultado.get("n_voto_pref_lista_7") == null ? "0" : resultado.get("n_voto_pref_lista_7").toString()))
                            .numVotos8(Integer.parseInt(resultado.get("n_voto_pref_lista_8") == null ? "0" : resultado.get("n_voto_pref_lista_8").toString()))
                            .numVotos9(Integer.parseInt(resultado.get("n_voto_pref_lista_9") == null ? "0" : resultado.get("n_voto_pref_lista_9").toString()))
                            .numVotos10(Integer.parseInt(resultado.get("n_voto_pref_lista_10") == null ? "0" : resultado.get("n_voto_pref_lista_10").toString()))
                            .numVotos11(Integer.parseInt(resultado.get("n_voto_pref_lista_11") == null ? "0" : resultado.get("n_voto_pref_lista_11").toString()))
                            .numVotos12(Integer.parseInt(resultado.get("n_voto_pref_lista_12") == null ? "0" : resultado.get("n_voto_pref_lista_12").toString()))
                            .numVotos13(Integer.parseInt(resultado.get("n_voto_pref_lista_13") == null ? "0" : resultado.get("n_voto_pref_lista_13").toString()))
                            .numVotos14(Integer.parseInt(resultado.get("n_voto_pref_lista_14") == null ? "0" : resultado.get("n_voto_pref_lista_14").toString()))
                            .numVotos15(Integer.parseInt(resultado.get("n_voto_pref_lista_15") == null ? "0" : resultado.get("n_voto_pref_lista_15").toString()))
                            .numVotos16(Integer.parseInt(resultado.get("n_voto_pref_lista_16") == null ? "0" : resultado.get("n_voto_pref_lista_16").toString()))
                            .numVotos17(Integer.parseInt(resultado.get("n_voto_pref_lista_17") == null ? "0" : resultado.get("n_voto_pref_lista_17").toString()))
                            .numVotos18(Integer.parseInt(resultado.get("n_voto_pref_lista_18") == null ? "0" : resultado.get("n_voto_pref_lista_18").toString()))
                            .numVotos19(Integer.parseInt(resultado.get("n_voto_pref_lista_19") == null ? "0" : resultado.get("n_voto_pref_lista_19").toString()))
                            .numVotos20(Integer.parseInt(resultado.get("n_voto_pref_lista_20") == null ? "0" : resultado.get("n_voto_pref_lista_20").toString()))
                            .numVotos21(Integer.parseInt(resultado.get("n_voto_pref_lista_21") == null ? "0" : resultado.get("n_voto_pref_lista_21").toString()))
                            .numVotos22(Integer.parseInt(resultado.get("n_voto_pref_lista_22") == null ? "0" : resultado.get("n_voto_pref_lista_22").toString()))
                            .numVotos23(Integer.parseInt(resultado.get("n_voto_pref_lista_23") == null ? "0" : resultado.get("n_voto_pref_lista_23").toString()))
                            .numVotos24(Integer.parseInt(resultado.get("n_voto_pref_lista_24") == null ? "0" : resultado.get("n_voto_pref_lista_24").toString()))
                            .numVotos25(Integer.parseInt(resultado.get("n_voto_pref_lista_25") == null ? "0" : resultado.get("n_voto_pref_lista_25").toString()))
                            .numVotos26(Integer.parseInt(resultado.get("n_voto_pref_lista_26") == null ? "0" : resultado.get("n_voto_pref_lista_26").toString()))
                            .numVotos27(Integer.parseInt(resultado.get("n_voto_pref_lista_27") == null ? "0" : resultado.get("n_voto_pref_lista_27").toString()))
                            .numVotos28(Integer.parseInt(resultado.get("n_voto_pref_lista_28") == null ? "0" : resultado.get("n_voto_pref_lista_28").toString()))
                            .numVotos29(Integer.parseInt(resultado.get("n_voto_pref_lista_29") == null ? "0" : resultado.get("n_voto_pref_lista_29").toString()))
                            .numVotos30(Integer.parseInt(resultado.get("n_voto_pref_lista_30") == null ? "0" : resultado.get("n_voto_pref_lista_30").toString()))
                            .numVotos31(Integer.parseInt(resultado.get("n_voto_pref_lista_31") == null ? "0" : resultado.get("n_voto_pref_lista_31").toString()))
                            .numVotos32(Integer.parseInt(resultado.get("n_voto_pref_lista_32") == null ? "0" : resultado.get("n_voto_pref_lista_32").toString()))
                            .numVotos33(Integer.parseInt(resultado.get("n_voto_pref_lista_33") == null ? "0" : resultado.get("n_voto_pref_lista_33").toString()))
                            .numVotos34(Integer.parseInt(resultado.get("n_voto_pref_lista_34") == null ? "0" : resultado.get("n_voto_pref_lista_34").toString()))
                            .numVotos35(Integer.parseInt(resultado.get("n_voto_pref_lista_35") == null ? "0" : resultado.get("n_voto_pref_lista_35").toString()))
                            .numVotos36(Integer.parseInt(resultado.get("n_voto_pref_lista_36") == null ? "0" : resultado.get("n_voto_pref_lista_36").toString()))
                            .build();
                })
                .toList();
    }


}
