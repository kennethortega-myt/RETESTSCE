package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.eleccionstrategy.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import pe.gob.onpe.scebackend.model.dto.reportes.DetalleResultadosContabilizadas;
import pe.gob.onpe.scebackend.model.dto.reportes.FiltroResultadoContabilizadasDto;
import pe.gob.onpe.scebackend.model.dto.reportes.ReporteResultadoActasContDto;
import pe.gob.onpe.scebackend.model.dto.reportes.ResultadoActasContabilizadasDto;
import pe.gob.onpe.scebackend.model.service.UtilSceService;
import pe.gob.onpe.scebackend.service.reportes.resultados.impl.factory.TipoReporteStrategyFactory;
import pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.tiporeportestrategy.TipoReporteStrategy;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;

/**
 * Estrategia para manejar reportes de elecciones Revocatoria Distrital
 * (Consulta Popular de Revocatoria)
 */
@Component
public class EleccionCPRStrategyImpl extends EleccionStrategyAbstract {

    private static final String KEY_N_VOTOS = "n_votos";
    private static final String KEY_N_VOTO_SI = "n_voto_opcion_si";
    private static final String KEY_N_VOTO_NO = "n_voto_opcion_no";
    private static final String KEY_N_VOTO_BLANCO = "n_voto_opcion_blanco";
    private static final String KEY_N_VOTO_NULO = "n_voto_opcion_nulo";

    private static final String KEY_C_NOMBRES_APELLIDOS = "c_nombres_apellidos";
    private static final String KEY_C_CODIGO_UBIGEO = "c_codigo_ubigeo";
    private static final String KEY_C_DEPARTAMENTO = "c_departamento";
    private static final String KEY_C_PROVINCIA = "c_provincia";
    private static final String KEY_C_DISTRITO = "c_distrito";
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

    private final TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory;

    public EleccionCPRStrategyImpl(UtilSceService utilSceService,
            TipoReporteStrategyFactory resultadosTipoReporteStrategyFactory) {
        super(utilSceService);
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
        return ResultadoActasContabilizadasDto.builder().detalleResultado(getDetalleResultado(resultadosMap))
                .resumenActas(getResumenActasContabilizadas(resultadosMap.get(0))).cantidadVotosPref(0).build();
    }

    private static List<DetalleResultadosContabilizadas> getDetalleResultado(List<Map<String, Object>> resultadosMap) {
        return resultadosMap.stream().map(resultado -> {

            int votosSi = getIntOrZero(resultado, KEY_N_VOTO_SI);
            int votosNo = getIntOrZero(resultado, KEY_N_VOTO_NO);
            int votosBlancos = getIntOrZero(resultado, KEY_N_VOTO_BLANCO);
            int votosNulos = getIntOrZero(resultado, KEY_N_VOTO_NULO);

            int ciudadanosVotaron = votosSi + votosNo + votosBlancos + votosNulos;
            int siNo2 = Math.ceilDiv(votosSi + votosNo, 2);

            return DetalleResultadosContabilizadas.builder()
                    .agrupacionPolitica(getStringOrEmpty(resultado, KEY_C_NOMBRES_APELLIDOS)).votosSi(votosSi)
                    .votosNo(votosNo).votosBlancos(votosBlancos).votosNulos(votosNulos)
                    .ciudadanosVotaron(ciudadanosVotaron).votosSiNo2(siNo2 + 1).build();
        }).toList();
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
        return resultadosMap.stream().map(EleccionCPRStrategyImpl::toReporteResultadoActasContDto).toList();
    }

    private static ReporteResultadoActasContDto toReporteResultadoActasContDto(Map<String, Object> resultado) {
        int votosSi = getIntOrZero(resultado, KEY_N_VOTO_SI);
        int votosNo = getIntOrZero(resultado, KEY_N_VOTO_NO);
        int siNo2 = Math.ceilDiv(votosSi + votosNo, 2);

        Integer totalVotos = getIntOrNull(resultado, KEY_N_VOTOS);

        return ReporteResultadoActasContDto.builder()
                .desAgrupacion(getStringOrEmpty(resultado, KEY_C_NOMBRES_APELLIDOS))
                .numVotos(getIntOrZero(resultado, KEY_N_VOTOS))
                .codUbigeo(getStringOrEmpty(resultado, KEY_C_CODIGO_UBIGEO))
                .departamento(getStringOrEmpty(resultado, KEY_C_DEPARTAMENTO))
                .provincia(getStringOrEmpty(resultado, KEY_C_PROVINCIA))
                .distrito(getStringOrEmpty(resultado, KEY_C_DISTRITO))
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
                .actSin(getStringOrNull(resultado, KEY_N_ESTADO_SINIESTRADA))

                .totalVotos(totalVotos).votosSI(votosSi).votosNO(votosNo)
                .votosBL(getIntOrZero(resultado, KEY_N_VOTO_BLANCO)).votosNL(getIntOrZero(resultado, KEY_N_VOTO_NULO))
                .calculo(siNo2 + 1).build();
    }

    private static String getStringOrEmpty(Map<String, Object> row, String key) {
        Object v = row.get(key);
        return v == null ? "" : v.toString();
    }

    private static int getIntOrZero(Map<String, Object> row, String key) {
        Object v = row.get(key);
        if (v == null) {
            return 0;
        }
        if (v instanceof Number n) {
            return n.intValue();
        }
        return Integer.parseInt(v.toString());
    }

    private static Integer getIntOrNull(Map<String, Object> row, String key) {
        Object v = row.get(key);
        if (v == null) {
            return null;
        }
        if (v instanceof Number n) {
            return n.intValue();
        }
        return Integer.valueOf(v.toString());
    }

    private static String getStringOrNull(Map<String, Object> row, String key) {
        Object v = row.get(key);
        return v == null ? null : v.toString();
    }
}