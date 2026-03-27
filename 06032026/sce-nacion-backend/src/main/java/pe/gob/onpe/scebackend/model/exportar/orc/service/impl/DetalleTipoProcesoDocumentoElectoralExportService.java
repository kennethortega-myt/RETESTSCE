package pe.gob.onpe.scebackend.model.exportar.orc.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import pe.gob.onpe.scebackend.model.entities.DetalleTipoEleccionDocumentoElectoral;
import pe.gob.onpe.scebackend.model.exportar.orc.dto.AdmDetTipoEleccionDocElectoralExportDto;
import pe.gob.onpe.scebackend.model.exportar.orc.mapper.IAdmDetalleTipoProcesoDocumentoElectoralExportMapper;
import pe.gob.onpe.scebackend.model.exportar.orc.mapper.IMigracionMapper;
import pe.gob.onpe.scebackend.model.exportar.orc.service.IDetalleTipoProcesoDocumentoElectoralExportService;
import pe.gob.onpe.scebackend.model.repository.DetalleTipoEleccionDocumentoElectoralRepository;
import pe.gob.onpe.scebackend.model.repository.MigracionRepository;


@Service
public class DetalleTipoProcesoDocumentoElectoralExportService  extends MigracionService<AdmDetTipoEleccionDocElectoralExportDto, DetalleTipoEleccionDocumentoElectoral, String> implements IDetalleTipoProcesoDocumentoElectoralExportService {

    @Autowired
    private IAdmDetalleTipoProcesoDocumentoElectoralExportMapper detalleTipoProcesoDocumentoElectoralMapper;


    @Autowired
    private DetalleTipoEleccionDocumentoElectoralRepository detalleTipoEleccionDocumentoElectoralRepository;


	@Override
	public MigracionRepository<DetalleTipoEleccionDocumentoElectoral, String> getRepository() {
		return this.detalleTipoEleccionDocumentoElectoralRepository;
	}

	@Override
	public IMigracionMapper<AdmDetTipoEleccionDocElectoralExportDto, DetalleTipoEleccionDocumentoElectoral> getMapper() {
		return this.detalleTipoProcesoDocumentoElectoralMapper;
	}
}
