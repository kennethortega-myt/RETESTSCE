package pe.gob.onpe.scebackend.model.exportar.orc.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.gob.onpe.scebackend.model.entities.DetalleConfiguracionDocumentoElectoral;
import pe.gob.onpe.scebackend.model.exportar.orc.dto.AdmDetConfigDocElectoralExportDto;
import pe.gob.onpe.scebackend.model.exportar.orc.mapper.IAdmDetalleConfiguracionDocumentoElectoralExportMapper;
import pe.gob.onpe.scebackend.model.exportar.orc.mapper.IMigracionMapper;
import pe.gob.onpe.scebackend.model.exportar.orc.service.IDetalleConfiguracionDocumentoElectoralExportService;
import pe.gob.onpe.scebackend.model.repository.DetalleConfiguracionDocumentoElectoralRepository;
import pe.gob.onpe.scebackend.model.repository.MigracionRepository;

@Service
public class DetalleConfiguracionDocumentoElectoralExportService extends MigracionService<AdmDetConfigDocElectoralExportDto, DetalleConfiguracionDocumentoElectoral, String> implements IDetalleConfiguracionDocumentoElectoralExportService {
    
    
    @Autowired
    private IAdmDetalleConfiguracionDocumentoElectoralExportMapper detalleConfiguracionDocumentoElectoralMapper;
    
    @Autowired
    private DetalleConfiguracionDocumentoElectoralRepository detalleConfiguracionDocumentoElectoralRepository;
    
	@Override
	public MigracionRepository<DetalleConfiguracionDocumentoElectoral, String> getRepository() {
		return detalleConfiguracionDocumentoElectoralRepository;
	}

	@Override
	public IMigracionMapper<AdmDetConfigDocElectoralExportDto, DetalleConfiguracionDocumentoElectoral> getMapper() {
		return detalleConfiguracionDocumentoElectoralMapper;
	}
}
