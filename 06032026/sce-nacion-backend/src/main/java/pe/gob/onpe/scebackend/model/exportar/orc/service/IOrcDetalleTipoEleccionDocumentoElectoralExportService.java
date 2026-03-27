package pe.gob.onpe.scebackend.model.exportar.orc.service;

import java.util.List;

import pe.gob.onpe.scebackend.model.exportar.orc.dto.OrcDetTipoEleccionDocElectoralExportDto;
import pe.gob.onpe.scebackend.model.orc.entities.OrcDetalleTipoEleccionDocumentoElectoral;

public interface IOrcDetalleTipoEleccionDocumentoElectoralExportService {

	public List<OrcDetTipoEleccionDocElectoralExportDto> findByCc(String cc);
	
	public OrcDetalleTipoEleccionDocumentoElectoral findByCopiaExt(String copia);
	
	public OrcDetalleTipoEleccionDocumentoElectoral findAisByCopiaExt(String copia);
	
}
