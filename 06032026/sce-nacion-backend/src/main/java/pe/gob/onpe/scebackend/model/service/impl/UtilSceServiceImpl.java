package pe.gob.onpe.scebackend.model.service.impl;

import org.springframework.stereotype.Service;
import pe.gob.onpe.scebackend.model.orc.entities.ProcesoElectoral;
import pe.gob.onpe.scebackend.model.orc.entities.Version;
import pe.gob.onpe.scebackend.model.orc.repository.ProcesoElectoralRepository;
import pe.gob.onpe.scebackend.model.orc.repository.VersionRepository;
import pe.gob.onpe.scebackend.model.service.UtilSceService;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;

import java.util.Calendar;
import java.util.Date;
import java.util.Optional;

@Service
public class UtilSceServiceImpl implements UtilSceService {

    private final VersionRepository versionRepository;

    private final ProcesoElectoralRepository procesoElectoralRepository;

    public UtilSceServiceImpl(VersionRepository versionRepository,ProcesoElectoralRepository procesoElectoralRepository) {
        this.versionRepository = versionRepository;
        this.procesoElectoralRepository = procesoElectoralRepository;
    }

    @Override
    public String getVersionSistema() {
        return versionRepository.findAll().stream()
            .findFirst()
            .map(Version::getCodversion)
            .orElse("S/V");
    }

    @Override
    public String getSinValorOficial() {

        ProcesoElectoral procesoElectoral = this.procesoElectoralRepository.findByActivo(ConstantesComunes.ACTIVO);

        if (procesoElectoral == null || procesoElectoral.getFechaConvocatoria() == null) {
            return ConstantesComunes.SVO;
        }

        Date fechaConvocatoria = procesoElectoral.getFechaConvocatoria();

        // Restamos 2 días a la fecha de convocatoria
        Calendar calendario = Calendar.getInstance();
        calendario.setTime(fechaConvocatoria);
        calendario.add(Calendar.DAY_OF_MONTH, ConstantesComunes.DIAS_PREVIOS_MARCA_DE_AGUA);
        Date fechaLimite = calendario.getTime();

        return new Date().before(fechaLimite)
                ? ConstantesComunes.SVO
                : ConstantesComunes.VACIO;
    }


    @Override
    public String getSinValorOficial(Long idProceso) {
        if(idProceso == null ) return ConstantesComunes.SVO;
        Optional<ProcesoElectoral> procesoElectoral = this.procesoElectoralRepository.findById(idProceso);
        return calculoSinValor(procesoElectoral);
    }

    @Override
    public String getSinValorOficial(Integer idProceso) {
        if(idProceso == null ) return ConstantesComunes.SVO;
        Optional<ProcesoElectoral> procesoElectoral = this.procesoElectoralRepository.findById(idProceso.longValue());
        return calculoSinValor(procesoElectoral);
    }

    @Override
    public String getSinValorOficial(String acronimoProceso) {
        if(acronimoProceso == null ) return ConstantesComunes.SVO;
        Optional<ProcesoElectoral> procesoElectoral = this.procesoElectoralRepository.findByAcronimo(acronimoProceso);
        return calculoSinValor(procesoElectoral);
    }

    private String calculoSinValor(Optional<ProcesoElectoral> optionalProcesoElectoral) {

        if (optionalProcesoElectoral.isEmpty() || optionalProcesoElectoral.get().getFechaConvocatoria() == null)
            return ConstantesComunes.SVO;

        Date fechaConvocatoria = optionalProcesoElectoral.get().getFechaConvocatoria();

        //Restamos 2 días a la fecha de convocatoria
        Calendar calendario = Calendar.getInstance();
        calendario.setTime(fechaConvocatoria);
        calendario.add(Calendar.DAY_OF_MONTH, ConstantesComunes.DIAS_PREVIOS_MARCA_DE_AGUA);
        Date fechaLimite = calendario.getTime();

        return new Date().before(fechaLimite)
            ? ConstantesComunes.SVO
            : ConstantesComunes.VACIO;
    }


}
