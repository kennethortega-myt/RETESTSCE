package pe.gob.onpe.scebackend.model.exportar.pr.service.impl;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import pe.gob.onpe.scebackend.model.exportar.pr.dto.VwPrTotalCandidatosPorAgrupacionPoliticaExportDto;
import pe.gob.onpe.scebackend.model.exportar.pr.mapper.IVwPrTotalCandidatosPorAgrupacionPoliticaExportPrMapper;
import pe.gob.onpe.scebackend.model.exportar.pr.service.IVwPrTotalCandidatosPorAgrupacionPoliticaService;
import pe.gob.onpe.scebackend.model.orc.entities.VwPrTotalCandidatosPorAgrupacionPolitica;
import pe.gob.onpe.scebackend.model.orc.repository.VwPrTotalCandidatosPorAgrupacionPoliticaRepository;

@Service
public class VwPrTotalCandidatosPorAgrupacionPoliticaService implements IVwPrTotalCandidatosPorAgrupacionPoliticaService{

	@Autowired
	private VwPrTotalCandidatosPorAgrupacionPoliticaRepository vwPrTotalCandidatosPorAgrupacionPoliticaRepository;
	
	@Autowired
	private IVwPrTotalCandidatosPorAgrupacionPoliticaExportPrMapper vwPrTotalCandidatosPorAgrupacionPoliticaMapper;
	
	@Override
	public List<VwPrTotalCandidatosPorAgrupacionPoliticaExportDto> findAll() {
		List<VwPrTotalCandidatosPorAgrupacionPolitica> entities = this.vwPrTotalCandidatosPorAgrupacionPoliticaRepository.findAll();
		List<VwPrTotalCandidatosPorAgrupacionPoliticaExportDto> dtos = null;
		if(!Objects.isNull(entities)) {
			dtos = entities.stream().map(
					entity ->  this.vwPrTotalCandidatosPorAgrupacionPoliticaMapper.toDto(entity)).collect(Collectors.toList());
		}
		return dtos;
	}

}
