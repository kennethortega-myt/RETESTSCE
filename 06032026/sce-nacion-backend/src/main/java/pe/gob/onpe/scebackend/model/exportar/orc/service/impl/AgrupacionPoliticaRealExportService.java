package pe.gob.onpe.scebackend.model.exportar.orc.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.gob.onpe.scebackend.model.exportar.orc.dto.AgrupacionPoliticaRealExportDto;
import pe.gob.onpe.scebackend.model.exportar.orc.service.IAgrupacionPoliticaRealExportService;
import pe.gob.onpe.scebackend.model.orc.repository.AgrupacionPoliticaRealRepository;
import pe.gob.onpe.scebackend.utils.DateUtil;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;


@Service
public class AgrupacionPoliticaRealExportService implements IAgrupacionPoliticaRealExportService {

	@Autowired
	private AgrupacionPoliticaRealRepository agrupacionPoliticaRealRepository;
	
	@Override
	public List<AgrupacionPoliticaRealExportDto> findAll() {
		return agrupacionPoliticaRealRepository.findAll()
	            .stream()
	            .map(candidato ->
	            	{
	            		AgrupacionPoliticaRealExportDto dto = new AgrupacionPoliticaRealExportDto();
	            		dto.setId(candidato.getId());
	            		dto.setCodigo(candidato.getCodigo());
	            		dto.setDescripcion(candidato.getDescripcion());
	            		dto.setTipoAgrupacionPolitica(candidato.getTipoAgrupacionPolitica());
	            		dto.setUbigeoMaximo(candidato.getUbigeoMaximo());
	                    dto.setActivo(candidato.getActivo());
	                    dto.setEstado(candidato.getEstado());
	                    dto.setAudUsuarioCreacion(candidato.getUsuarioCreacion());
	                    dto.setAudFechaCreacion(DateUtil.getDateString(candidato.getFechaCreacion(),ConstantesComunes.FORMATO_FECHA));
	                    dto.setAudUsuarioModificacion(candidato.getUsuarioModificacion());
	                    dto.setAudFechaModificacion(DateUtil.getDateString(candidato.getFechaModificacion(),ConstantesComunes.FORMATO_FECHA));
	            		return dto;
	            	}).toList();
	}

	@Override
	public List<AgrupacionPoliticaRealExportDto> findByCc(String cc) {
		return agrupacionPoliticaRealRepository.findByCc(cc)
	            .stream()
	            .map(candidato ->
	            	{
	            		AgrupacionPoliticaRealExportDto dto = new AgrupacionPoliticaRealExportDto();
	            		dto.setId(candidato.getId());
	            		dto.setCodigo(candidato.getCodigo());
	            		dto.setDescripcion(candidato.getDescripcion());
	            		dto.setTipoAgrupacionPolitica(candidato.getTipoAgrupacionPolitica());
	            		dto.setUbigeoMaximo(candidato.getUbigeoMaximo());
	                    dto.setActivo(candidato.getActivo());
	                    dto.setEstado(candidato.getEstado());
	                    dto.setAudUsuarioCreacion(candidato.getUsuarioCreacion());
	                    dto.setAudFechaCreacion(DateUtil.getDateString(candidato.getFechaCreacion(),ConstantesComunes.FORMATO_FECHA));
	                    dto.setAudUsuarioModificacion(candidato.getUsuarioModificacion());
	                    dto.setAudFechaModificacion(DateUtil.getDateString(candidato.getFechaModificacion(),ConstantesComunes.FORMATO_FECHA));
	            		return dto;
	            	}).toList();
	}

	

}
