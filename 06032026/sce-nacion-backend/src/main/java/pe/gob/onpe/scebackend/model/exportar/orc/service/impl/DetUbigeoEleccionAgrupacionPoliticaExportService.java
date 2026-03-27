package pe.gob.onpe.scebackend.model.exportar.orc.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.gob.onpe.scebackend.model.exportar.orc.dto.DetUbigeoEleccionAgrupacionPoliticaExportDto;
import pe.gob.onpe.scebackend.model.exportar.orc.mapper.IDetUbigeoEleccionAgrupacionPoliticaExportMapper;
import pe.gob.onpe.scebackend.model.exportar.orc.mapper.IMigracionMapper;
import pe.gob.onpe.scebackend.model.exportar.orc.service.IDetUbigeoEleccionAgrupacionPoliticaExportService;
import pe.gob.onpe.scebackend.model.orc.entities.DetUbigeoEleccionAgrupacionPolitica;
import pe.gob.onpe.scebackend.model.orc.repository.DetUbigeoEleccionAgrupacionPoliticaRepository;
import pe.gob.onpe.scebackend.model.repository.MigracionRepository;


@Service
public class DetUbigeoEleccionAgrupacionPoliticaExportService extends MigracionService<DetUbigeoEleccionAgrupacionPoliticaExportDto, DetUbigeoEleccionAgrupacionPolitica, String> implements IDetUbigeoEleccionAgrupacionPoliticaExportService {

	@Autowired
	private DetUbigeoEleccionAgrupacionPoliticaRepository detUbigeoEleccionApRepository;
	
	@Autowired
	private IDetUbigeoEleccionAgrupacionPoliticaExportMapper detUbigeoEleccionApMapper;

	@Override
	public MigracionRepository<DetUbigeoEleccionAgrupacionPolitica, String> getRepository() {
		return this.detUbigeoEleccionApRepository;
	}

	@Override
	public IMigracionMapper<DetUbigeoEleccionAgrupacionPoliticaExportDto, DetUbigeoEleccionAgrupacionPolitica> getMapper() {
		return this.detUbigeoEleccionApMapper;
	}
	
	
	

}
