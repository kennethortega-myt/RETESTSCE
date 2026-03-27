package pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.eleccionstrategy.impl;

import pe.gob.onpe.scebackend.model.dto.reportes.FiltroResultadoContabilizadasDto;
import pe.gob.onpe.scebackend.model.dto.request.comun.UbiEleccionAgrupolRequestDto;
import pe.gob.onpe.scebackend.model.orc.repository.comun.IUbiEleccionAgrupolRepositoryCustom;
import pe.gob.onpe.scebackend.model.service.UtilSceService;
import pe.gob.onpe.scebackend.service.reportes.resultados.impl.strategy.eleccionstrategy.EleccionStrategy;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;

/**
 * Clase base abstracta que implementa funcionalidades comunes para todas las estrategias de elección de condición preferencial.
 * Utiliza Template Method Pattern para compartir código común
 */
public abstract class PreferencialEleccionStrategyAbstract extends EleccionStrategyAbstract implements EleccionStrategy {

    protected final UtilSceService utilSceService;
    private IUbiEleccionAgrupolRepositoryCustom ubiEleccionAgrupolRepositoryCustom;

    protected PreferencialEleccionStrategyAbstract(UtilSceService utilSceService, IUbiEleccionAgrupolRepositoryCustom ubiEleccionAgrupolRepositoryCustom) {
        super(utilSceService);
        this.utilSceService = utilSceService;
        this.ubiEleccionAgrupolRepositoryCustom = ubiEleccionAgrupolRepositoryCustom;
    }

    protected Integer obtenerCantidadVotosPreferencial(FiltroResultadoContabilizadasDto filtro) {
        UbiEleccionAgrupolRequestDto ubiEleccionAgrupolRequestDto = new UbiEleccionAgrupolRequestDto();
        ubiEleccionAgrupolRequestDto.setIdEleccion(filtro.getIdEleccion());
        ubiEleccionAgrupolRequestDto.setEsquema(filtro.getEsquema());
        ubiEleccionAgrupolRequestDto.setUbigeo(filtro.getUbigeo());
        Integer cantidadVotosPreferencial = ubiEleccionAgrupolRepositoryCustom
                .obtenerCantidadAgrupacionPreferencial(ubiEleccionAgrupolRequestDto);
        return cantidadVotosPreferencial;
    }

    protected String obtenerNombreReporteDinamico(Integer cantidadVotosPreferencial) {
        if (cantidadVotosPreferencial <= 9) {
            return ConstantesComunes.RESULTADO_ACTAS_CONTABILIZADAS_REPORT_JRXML_9;
        } else if (cantidadVotosPreferencial <= 18) {
            return ConstantesComunes.RESULTADO_ACTAS_CONTABILIZADAS_REPORT_JRXML_18;
        } else if (cantidadVotosPreferencial <= 27) {
            return ConstantesComunes.RESULTADO_ACTAS_CONTABILIZADAS_REPORT_JRXML_27;
        } else {
            return ConstantesComunes.RESULTADO_ACTAS_CONTABILIZADAS_REPORT_JRXML_36;
        }
    }

}
