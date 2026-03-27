package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.eleccionstrategy.impl;

import org.springframework.stereotype.Component;
import pe.gob.onpe.scebackend.model.dto.reportes.DetalleResultadosContabilizadas;
import pe.gob.onpe.scebackend.model.dto.reportes.FiltroResultadoContabilizadasDto;
import pe.gob.onpe.scebackend.model.dto.reportes.ReporteResultadoActasContDto;
import pe.gob.onpe.scebackend.model.dto.reportes.ResultadoActasContabilizadasDto;
import pe.gob.onpe.scebackend.model.service.UtilSceService;
import pe.gob.onpe.scebackend.service.reportes.resultados.impl.factory.TipoReporteStrategyFactory;
import pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.TipoReporteStrategy;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;


import java.util.List;
import java.util.Map;

/**
 * Estrategia para manejar reportes de elecciones Revocatoria Distrital (Consulta Popular de Revocatoria)
 */
@Component
public class EleccionCPRStrategyImpl extends EleccionStrategyAbstract {

    private final UtilSceService utilSceService;
    private final TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory;

    public EleccionCPRStrategyImpl(UtilSceService utilSceService, TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory) {
        super(utilSceService);
        this.utilSceService = utilSceService;
        this.resultadosTipoReporteStrategyFactory = resultadosTipoReporteStrategyFactory;
    }

    @Override
    public boolean puedeManejar(FiltroResultadoContabilizadasDto filtro) {
        return filtro.getCodigoEleccion().equals(ConstantesComunes.COD_ELEC_REV_DIST);
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
                .resumenActas(getResumenActasContabilizadas(resultadosMap.get(0)))
                .cantidadVotosPref(0)
                .build();
    }

    private static List<DetalleResultadosContabilizadas> getDetalleResultado(List<Map<String, Object>> resultadosMap) {
        List<DetalleResultadosContabilizadas> detalleResultado = resultadosMap
                .parallelStream()
                .map(resultado -> {

                    int votosSi = Integer.parseInt(resultado.get("n_voto_opcion_si") == null ? "0" : resultado.get("n_voto_opcion_si").toString());
                    int votosNo = Integer.parseInt(resultado.get("n_voto_opcion_no") == null ? "0" : resultado.get("n_voto_opcion_no").toString());
                    int votosBlancos = Integer.parseInt(resultado.get("n_voto_opcion_blanco") == null ? "0" : resultado.get("n_voto_opcion_blanco").toString());
                    int votosNulos = Integer.parseInt(resultado.get("n_voto_opcion_nulo") == null ? "0" : resultado.get("n_voto_opcion_nulo").toString());
                    int siNo2 = Math.ceilDiv((votosSi + votosNo), 2);

                    return DetalleResultadosContabilizadas
                            .builder()
                            .agrupacionPolitica(resultado.get("c_nombres_apellidos").toString())
                            .votosSi( votosSi )
                            .votosNo( votosNo )
                            .votosBlancos( votosBlancos )
                            .votosNulos( votosNulos )
                            .ciudadanosVotaron( votosSi + votosNo + votosBlancos + votosNulos )
                            .votosSiNo2(siNo2+1)
                            .build();
                })
                .toList();
        return detalleResultado;
    }

    @Override
    public byte[] generarReportePdf(FiltroResultadoContabilizadasDto filtro) {
        // Usar la estrategia de tipo de reporte para obtener los datos
        TipoReporteStrategy reportStrategy = resultadosTipoReporteStrategyFactory.obtenerEstrategia(filtro);
        List<Map<String, Object>> resultadosMap = reportStrategy.obtenerDatos(filtro);
        List<ReporteResultadoActasContDto> resultadosList = mapearResultadosParaPdf(resultadosMap);
        Map<String, Object> parametros = generarParametrosComunes(filtro, resultadosMap.get(0));
        return generarReportePDF(resultadosList, obtenerNombreReporte(), parametros);
    }

    public String obtenerNombreReporte() {
        return ConstantesComunes.RESULTADO_ACTAS_CONTABILIZADAS_CPR_REPORT_JRXML;
    }
    @Override
    public List<ReporteResultadoActasContDto> mapearResultadosParaPdf(List<Map<String, Object>> resultadosMap) {
        return resultadosMap
                .parallelStream()
                .map(resultado -> {

                    int votosSi = Integer.parseInt(resultado.get("n_voto_opcion_si") == null ? "0" : resultado.get("n_voto_opcion_si").toString());
                    int votosNo = Integer.parseInt(resultado.get("n_voto_opcion_no") == null ? "0" : resultado.get("n_voto_opcion_no").toString());
                    int siNo2 = Math.ceilDiv((votosSi + votosNo), 2);

                    return ReporteResultadoActasContDto
                            .builder()
                            .desAgrupacion(resultado.get("c_nombres_apellidos") == null ? "" : resultado.get("c_nombres_apellidos").toString())
                            .numVotos(Integer.parseInt(resultado.get("n_votos").toString()))
                            .codUbigeo(resultado.get("c_codigo_ubigeo") == null ? "" : resultado.get("c_codigo_ubigeo").toString())
                            .departamento(resultado.get("c_departamento") == null ? "" : resultado.get("c_departamento").toString())
                            .provincia(resultado.get("c_provincia") == null ? "" : resultado.get("c_provincia").toString())
                            .distrito(resultado.get("c_distrito") == null ? "" : resultado.get("c_distrito").toString())
                            .codOdpe(resultado.get("c_codigo_ambito_electoral") == null ? "" : resultado.get("c_codigo_ambito_electoral").toString())
                            .codCompu(resultado.get("c_codigo_centro_computo") == null ? "" : resultado.get("c_codigo_centro_computo").toString())
                            .electoresHabiles(resultado.get("n_electores_habiles") == null ? null : Integer.parseInt(resultado.get("n_electores_habiles").toString()))
                            .totalCiudadVotaron(resultado.get("n_ciudadanos_votaron") == null ? null : Integer.parseInt(resultado.get("n_ciudadanos_votaron").toString()))
                            .ainstalar(resultado.get("n_mesas_a_instalar") == null ? null : Integer.parseInt(resultado.get("n_mesas_a_instalar").toString()))
                            .porProcesar(resultado.get("n_mesas_por_procesar") == null ? null : Integer.parseInt(resultado.get("n_mesas_por_procesar").toString()))
                            .contabNormal(resultado.get("n_estado_contabilizada_normal") == null ? null : Integer.parseInt(resultado.get("n_estado_contabilizada_normal").toString()))
                            .contabInpugnadas(resultado.get("n_estado_contabilidad_impugnada") == null ? null : Integer.parseInt(resultado.get("n_estado_contabilidad_impugnada").toString()))
                            .errorMaterial(resultado.get("n_estado_error_material") == null ? null : resultado.get("n_estado_error_material").toString())
                            .ilegible(resultado.get("n_estado_ilegible") == null ? null : resultado.get("n_estado_ilegible").toString())
                            .incompleta(resultado.get("n_estado_incompleta") == null ? null : resultado.get("n_estado_incompleta").toString())
                            .solicitudNulidad(resultado.get("n_estado_solicitud_nulidad") == null ? null : resultado.get("n_estado_solicitud_nulidad").toString())
                            .sinDatos(resultado.get("n_estado_sin_datos") == null ? null : resultado.get("n_estado_sin_datos").toString())
                            .actExt(resultado.get("n_estado_extraviada") == null ? null : resultado.get("n_estado_extraviada").toString())
                            .sinFirma(resultado.get("n_estado_sin_firma") == null ? null : resultado.get("n_estado_sin_firma").toString())
                            .otrasObserv(resultado.get("n_estado_otras_observaciones") == null ? null : resultado.get("n_estado_otras_observaciones").toString())
                            .contabAnuladas(resultado.get("n_estado_contabilizada_anulada") == null ? null : Integer.parseInt(resultado.get("n_estado_contabilizada_anulada").toString()))
                            .mesasNoInstaladas(resultado.get("n_mesas_no_instaladas") == null ? null : Integer.parseInt(resultado.get("n_mesas_no_instaladas").toString()))
                            .mesasInstaladas(resultado.get("n_mesas_instaladas") == null ? null : Integer.parseInt(resultado.get("n_mesas_instaladas").toString()))
                            .actasProcesadas(resultado.get("n_actas_procesadas") == null ? null : Integer.parseInt(resultado.get("n_actas_procesadas").toString()))
                            .actSin(resultado.get("n_estado_siniestrada") == null ? null : resultado.get("n_estado_siniestrada").toString())

                            .totalVotos(resultado.get("n_votos") == null ? null : Integer.parseInt(resultado.get("n_votos").toString()))
                            .votosSI( votosSi )
                            .votosNO( votosNo )
                            .votosBL( Integer.parseInt(resultado.get("n_voto_opcion_blanco") == null ? "0" : resultado.get("n_voto_opcion_blanco").toString()) )
                            .votosNL( Integer.parseInt(resultado.get("n_voto_opcion_nulo") == null ? "0" : resultado.get("n_voto_opcion_nulo").toString()) )
                            .calculo( siNo2 + 1 )
                            .build();
                })
                .toList();
    }
}