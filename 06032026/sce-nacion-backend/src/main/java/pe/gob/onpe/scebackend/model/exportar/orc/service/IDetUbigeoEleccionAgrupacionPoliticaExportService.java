package pe.gob.onpe.scebackend.model.exportar.orc.service;

import java.util.List;

import pe.gob.onpe.scebackend.model.exportar.orc.dto.DetUbigeoEleccionAgrupacionPoliticaExportDto;

public interface IDetUbigeoEleccionAgrupacionPoliticaExportService {

	List<DetUbigeoEleccionAgrupacionPoliticaExportDto> findByCc(String codigo);
	
}

