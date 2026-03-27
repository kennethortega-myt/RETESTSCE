package pe.gob.onpe.scebackend.model.exportar.pr.service.impl;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import pe.gob.onpe.scebackend.model.exportar.orc.dto.DetUbigeoEleccionAgrupacionPoliticaExportDto;
import pe.gob.onpe.scebackend.model.exportar.pr.mapper.IDetUbigeoEleccionAgrupacionPoliticaExportPrMapper;
import pe.gob.onpe.scebackend.model.exportar.pr.service.IDetUbigeoEleccionAgrupacionPoliticaExportPrService;
import pe.gob.onpe.scebackend.model.orc.entities.DetUbigeoEleccionAgrupacionPolitica;
import pe.gob.onpe.scebackend.model.orc.repository.DetUbigeoEleccionAgrupacionPoliticaRepository;

@Service
public class DetUbigeoEleccionAgrupacionPoliticaExportPrService implements IDetUbigeoEleccionAgrupacionPoliticaExportPrService {

	@Autowired
	private DetUbigeoEleccionAgrupacionPoliticaRepository detUbigeoAgrupacionPoliticaRepository;
	
	@Autowired
	private IDetUbigeoEleccionAgrupacionPoliticaExportPrMapper mapper;
	
	
	@Override
	public List<DetUbigeoEleccionAgrupacionPoliticaExportDto> findAll() {
		List<DetUbigeoEleccionAgrupacionPolitica> entities = this.detUbigeoAgrupacionPoliticaRepository.findAll();
		List<DetUbigeoEleccionAgrupacionPoliticaExportDto> dtos = null;
		if(!Objects.isNull(entities)) {
			dtos = entities.stream().map(
					entity ->  this.mapper.toDto(entity)).collect(Collectors.toList());
		}
		return dtos;
	}

}
