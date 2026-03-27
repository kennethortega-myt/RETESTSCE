package pe.gob.onpe.scebackend.model.exportar.orc.service;

import java.util.List;

import pe.gob.onpe.scebackend.model.exportar.orc.dto.OrcDetConfigDocElectoralExportDto;

public interface IOrcDetalleConfiguracionDocumentoElectoralExportService {
	
	public List<OrcDetConfigDocElectoralExportDto> findByCc(String cc);
	
}
