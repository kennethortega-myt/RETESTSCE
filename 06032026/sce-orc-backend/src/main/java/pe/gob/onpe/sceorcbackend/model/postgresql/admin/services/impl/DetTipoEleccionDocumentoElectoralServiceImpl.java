package pe.gob.onpe.sceorcbackend.model.postgresql.admin.services.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.gob.onpe.sceorcbackend.exception.BadRequestException;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.ProcesoElectoral;
import pe.gob.onpe.sceorcbackend.model.postgresql.admin.entity.DetTipoEleccionDocumentoElectoral;
import pe.gob.onpe.sceorcbackend.model.postgresql.admin.entity.DocumentoElectoral;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.ProcesoElectoralRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.admin.repository.DetTipoEleccionDocumentoElectoralRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.admin.repository.DocumentoElectoralRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.admin.services.DetTipoEleccionDocumentoElectoralService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Eleccion;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;
import pe.gob.onpe.sceorcbackend.utils.ConstantesMensajes;


@Service
public class DetTipoEleccionDocumentoElectoralServiceImpl implements DetTipoEleccionDocumentoElectoralService {

	private final DetTipoEleccionDocumentoElectoralRepository detTipoEleccionDocumentoElectoralRepository;
	private final ProcesoElectoralRepository procesoElectoralRepository;
	private final DocumentoElectoralRepository documentoElectoralRepository;

	public DetTipoEleccionDocumentoElectoralServiceImpl(
			DetTipoEleccionDocumentoElectoralRepository adminDetalleTipoEleccionDocumentoElectoralRepository,
			ProcesoElectoralRepository procesoElectoralRepository,
			DocumentoElectoralRepository adminDocumentoElectoralRepository
			) {
		this.detTipoEleccionDocumentoElectoralRepository = adminDetalleTipoEleccionDocumentoElectoralRepository;
		this.procesoElectoralRepository = procesoElectoralRepository;
		this.documentoElectoralRepository = adminDocumentoElectoralRepository;
	}
	
	@Override
	@Transactional
	public void save(DetTipoEleccionDocumentoElectoral k) {
		this.detTipoEleccionDocumentoElectoralRepository.save(k);
	}

	@Override
	@Transactional
	public void saveAll(List<DetTipoEleccionDocumentoElectoral> k) {
		this.detTipoEleccionDocumentoElectoralRepository.saveAll(k);
	}

	@Override
	@Transactional
	public void deleteAll() {
		this.detTipoEleccionDocumentoElectoralRepository.deleteAll();
	}

	@Override
	@Transactional(readOnly = true)
	public List<DetTipoEleccionDocumentoElectoral> findAll() {
		return this.detTipoEleccionDocumentoElectoralRepository.findAll();
	}

	@Override
	public DetTipoEleccionDocumentoElectoral findByRangoInicialLessThanEqualAndRangoFinalGreaterThanEqualAndDocumentoElectoral(String rangoInicial, String rangoFinal, DocumentoElectoral documentoElectoral) {
		return this.detTipoEleccionDocumentoElectoralRepository.findByRangoInicialLessThanEqualAndRangoFinalGreaterThanEqualAndDocumentoElectoral(rangoInicial, rangoFinal, documentoElectoral);
	}

	@Override
	public DetTipoEleccionDocumentoElectoral findByEleccionAndDocumentoElectoral(Eleccion eleccion, DocumentoElectoral documentoElectoral) {
		return this.detTipoEleccionDocumentoElectoralRepository.findByEleccionAndDocumentoElectoral(eleccion, documentoElectoral);
	}

	@Override
	public List<DetTipoEleccionDocumentoElectoral> findByDocumentoElectoral(DocumentoElectoral documentoElectoral) {
		return this.detTipoEleccionDocumentoElectoralRepository.findByDocumentoElectoral(documentoElectoral);
	}

	@Override
	public DetTipoEleccionDocumentoElectoral findAdminDetalleTipoEleccionByRangoAndDocumentoElectoral(Long idProcesoElectoral, String copia, String abrevDocElectoral) {
		DetTipoEleccionDocumentoElectoral tipoDocumento = null;
		Optional<ProcesoElectoral> optProcesoElectoral = this.procesoElectoralRepository.findById(idProcesoElectoral);
		DocumentoElectoral documentoElectoral = this.documentoElectoralRepository.findByAbreviatura(abrevDocElectoral);
		if (optProcesoElectoral.isPresent() && documentoElectoral != null){
			tipoDocumento = this.detTipoEleccionDocumentoElectoralRepository.findByRangoInicialLessThanEqualAndRangoFinalGreaterThanEqualAndDocumentoElectoral(
					copia,copia,documentoElectoral
			);
		}
		return tipoDocumento;
	}

	@Override
	public DetTipoEleccionDocumentoElectoral findByConfiguracionProcesoElectoralAndEleccionAndDocumentoElectoral(Long idProcesoElectoral, Long codiEleccion, String tipoDocumento) {
		List<String> abreviaturas = new ArrayList<>();

		if(tipoDocumento.equals(ConstantesComunes.ABREV_ACTA_ESCRUTINIO)){
			abreviaturas = Arrays.asList(
					ConstantesComunes.ABREV_ACTA_ESCRUTINIO,
					ConstantesComunes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL,
					ConstantesComunes.ABREV_ACTA_ESCRUTINIO_STAE,
					ConstantesComunes.ABREV_ACTA_ESCRUTINIO_STAE_HORIZONTAL);
		}else if(tipoDocumento.equals(ConstantesComunes.ABREV_ACTA_INSTALACION_SUGRAFIO)){
			abreviaturas = List.of(
                    ConstantesComunes.ABREV_ACTA_INSTALACION_SUGRAFIO);
		}

		List<DetTipoEleccionDocumentoElectoral> resultados =  this.detTipoEleccionDocumentoElectoralRepository
				.findConfiguracionDocumentoElectoral(idProcesoElectoral, codiEleccion, abreviaturas);

		return resultados.stream().findFirst().orElse(null);

	}



	/*
	* Solo busca para las ABREVIATURAS DE ACTAS DE ESCRUTINIO
	* Pueden traer varios registros si coincide la copia, como AE y AEH para diputados ya q comparten los mismo rango
	* solo se tomara el primer registro si la lista no esta vacia
	*
	* si la lista esta vacia, no esta configurada la copia que viene como parámetro
	* */
	@Override
	@Transactional(readOnly = true)
	public DetTipoEleccionDocumentoElectoral findByCopia(String copia) {

		List<String> abreviaturas = Arrays.asList(
				ConstantesComunes.ABREV_ACTA_ESCRUTINIO,
				ConstantesComunes.ABREV_ACTA_ESCRUTINIO_HORIZONTAL,
				ConstantesComunes.ABREV_ACTA_ESCRUTINIO_STAE,
				ConstantesComunes.ABREV_ACTA_ESCRUTINIO_STAE_HORIZONTAL
		);

		return this.detTipoEleccionDocumentoElectoralRepository
				.findByAbreviaturasAndCopia(abreviaturas, copia)
				.stream()
				.findFirst()
				.orElseThrow(() -> new BadRequestException(
						String.format(ConstantesMensajes.MSJ_FORMAT_NO_CONFIGURADO_ACTA_ESCRUTINIO, copia)
				));
	}

	@Override
	@Transactional(readOnly = true)
	public DetTipoEleccionDocumentoElectoral findAisByCopia(String copia) {

		List<String> abreviaturas = List.of(
				ConstantesComunes.ABREV_ACTA_INSTALACION_SUGRAFIO
		);

		return this.detTipoEleccionDocumentoElectoralRepository
				.findByAbreviaturasAndCopia(abreviaturas, copia)
				.stream()
				.findFirst()
				.orElseThrow(() -> new BadRequestException(
						String.format(ConstantesMensajes.MSJ_FORMAT_NO_CONFIGURADO_ACTA_AIS, copia)
				));
	}

}
