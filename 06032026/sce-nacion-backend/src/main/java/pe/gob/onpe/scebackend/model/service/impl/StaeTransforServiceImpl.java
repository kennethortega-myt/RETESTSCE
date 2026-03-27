package pe.gob.onpe.scebackend.model.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.gob.onpe.scebackend.exeption.BadRequestException;
import pe.gob.onpe.scebackend.model.orc.entities.Mesa;
import pe.gob.onpe.scebackend.model.orc.repository.MesaRepository;
import pe.gob.onpe.scebackend.model.service.StaeTransforService;
import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralRequestDto;
import pe.gob.onpe.scebackend.utils.StaeUtils;

@Service
public class StaeTransforServiceImpl implements  StaeTransforService {

	private final StaeUtils staeUtils;
	
	private final MesaRepository mesaRepository;
	
	public StaeTransforServiceImpl(
			StaeUtils staeUtils,
			MesaRepository mesaRepository){
		this.staeUtils = staeUtils;
		this.mesaRepository = mesaRepository;
	}
	
	@Transactional("tenantTransactionManager")
	public void completarInfo(ActaElectoralRequestDto actaDto) {

		if(actaDto.getNumeroActa()==null || actaDto.getNumeroActa().length()!=6)
			throw new BadRequestException("El número de mesa no está presente.");

		Mesa mesa  = this.mesaRepository.findByCodigo(actaDto.getNumeroActa());
		if(mesa==null)
			throw new BadRequestException(String.format("La mesa %s no esta registrada en el sce.", actaDto.getNumeroActa()));

		if(mesa.getCantidadElectoresHabiles()==null)
			throw new BadRequestException(String.format("La mesa %s no presenta electores hábiles registrados.", actaDto.getNumeroActa()));

		staeUtils.completarEstadoActaComputoResolucionErrorAritmetico(actaDto, mesa.getCantidadElectoresHabiles());

	}
	
}
