package pe.gob.onpe.scebackend.model.exportar.orc.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import pe.gob.onpe.scebackend.model.entities.DetalleTipoEleccionDocumentoElectoralHistorial;
import pe.gob.onpe.scebackend.model.exportar.orc.dto.AdmDetTipoEleccionDocElectoralHistExportDto;
import pe.gob.onpe.scebackend.model.exportar.orc.mapper.IAdmDetalleTipoEleccionDocumentoElectoralHistorialExportMapper;
import pe.gob.onpe.scebackend.model.exportar.orc.mapper.IMigracionMapper;
import pe.gob.onpe.scebackend.model.exportar.orc.service.IDetalleTipoEleccionDocumentoElectoralHistorialExportService;
import pe.gob.onpe.scebackend.model.repository.DetalleTipoEleccionDocumentoElectoralHistorialRepository;
import pe.gob.onpe.scebackend.model.repository.MigracionRepository;

@Service
public class DetalleTipoEleccionDocumentoElectoralHistorialExportService
	extends MigracionService<AdmDetTipoEleccionDocElectoralHistExportDto, DetalleTipoEleccionDocumentoElectoralHistorial, String>
	implements IDetalleTipoEleccionDocumentoElectoralHistorialExportService{

	@Autowired
	private DetalleTipoEleccionDocumentoElectoralHistorialRepository detalleTipoEleccionDocumentoHistorialRepository;
	
	@Autowired
	private IAdmDetalleTipoEleccionDocumentoElectoralHistorialExportMapper detalleTipoEleccionDocumentoHistorialMapper;
	
	@Override
	public MigracionRepository<DetalleTipoEleccionDocumentoElectoralHistorial, String> getRepository() {
		return detalleTipoEleccionDocumentoHistorialRepository;
	}

	@Override
	public IMigracionMapper<AdmDetTipoEleccionDocElectoralHistExportDto, DetalleTipoEleccionDocumentoElectoralHistorial> getMapper() {
		return detalleTipoEleccionDocumentoHistorialMapper;
	}

}
