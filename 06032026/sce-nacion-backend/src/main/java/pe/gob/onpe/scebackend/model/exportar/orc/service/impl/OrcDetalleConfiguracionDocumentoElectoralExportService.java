package pe.gob.onpe.scebackend.model.exportar.orc.service.impl;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.gob.onpe.scebackend.model.exportar.orc.dto.OrcDetConfigDocElectoralExportDto;
import pe.gob.onpe.scebackend.model.exportar.orc.mapper.IOrcDetalleConfiguracionDocumentoElectoralExportMapper;
import pe.gob.onpe.scebackend.model.exportar.orc.service.IOrcDetalleConfiguracionDocumentoElectoralExportService;
import pe.gob.onpe.scebackend.model.orc.entities.OrcDetalleConfiguracionDocumentoElectoral;
import pe.gob.onpe.scebackend.model.orc.repository.OrcDetalleConfiguracionDocumentoElectoralRepository;

@Service
public class OrcDetalleConfiguracionDocumentoElectoralExportService implements IOrcDetalleConfiguracionDocumentoElectoralExportService {

	@Autowired
	private OrcDetalleConfiguracionDocumentoElectoralRepository repository;
	
	@Autowired
	private IOrcDetalleConfiguracionDocumentoElectoralExportMapper mapper;
	
	@Override
	public List<OrcDetConfigDocElectoralExportDto> findByCc(String cc) {
		List<OrcDetalleConfiguracionDocumentoElectoral> entidades = (List<OrcDetalleConfiguracionDocumentoElectoral>) this.repository.findByCc(cc);
		List<OrcDetConfigDocElectoralExportDto> dtos = null;
		if(!Objects.isNull(entidades)) {
			dtos = entidades.stream().map(
					entity ->  this.mapper.toDto(entity)).collect(Collectors.toList());
		}
		return dtos;
	}

}
