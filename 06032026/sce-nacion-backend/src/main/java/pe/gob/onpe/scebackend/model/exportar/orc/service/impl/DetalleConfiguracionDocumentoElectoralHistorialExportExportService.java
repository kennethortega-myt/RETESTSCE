package pe.gob.onpe.scebackend.model.exportar.orc.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.gob.onpe.scebackend.model.entities.DetalleConfiguracionDocumentoElectoralHistorial;
import pe.gob.onpe.scebackend.model.exportar.orc.dto.AdmDetConfigDocElectoralHistExportDto;
import pe.gob.onpe.scebackend.model.exportar.orc.mapper.IAdmDetalleConfiguracionDocumentoElectoralHistorialExportMapper;
import pe.gob.onpe.scebackend.model.exportar.orc.mapper.IMigracionMapper;
import pe.gob.onpe.scebackend.model.exportar.orc.service.IDetalleConfiguracionDocumentoElectoralHistorialExportService;
import pe.gob.onpe.scebackend.model.repository.DetalleConfiguracionDocumentoElectoralHistorialRepository;
import pe.gob.onpe.scebackend.model.repository.MigracionRepository;

@Service
public class DetalleConfiguracionDocumentoElectoralHistorialExportExportService 
	extends MigracionService<AdmDetConfigDocElectoralHistExportDto, DetalleConfiguracionDocumentoElectoralHistorial, String>
	implements IDetalleConfiguracionDocumentoElectoralHistorialExportService{
	
	@Autowired
	private DetalleConfiguracionDocumentoElectoralHistorialRepository detalleConfDocumElecHistrepository;
	
	@Autowired
	private IAdmDetalleConfiguracionDocumentoElectoralHistorialExportMapper detalleConfDocumElecMapper;

	@Override
	public MigracionRepository<DetalleConfiguracionDocumentoElectoralHistorial, String> getRepository() {
		return this.detalleConfDocumElecHistrepository;
	}

	@Override
	public IMigracionMapper<AdmDetConfigDocElectoralHistExportDto, DetalleConfiguracionDocumentoElectoralHistorial> getMapper() {
		return detalleConfDocumElecMapper;
	}

}
