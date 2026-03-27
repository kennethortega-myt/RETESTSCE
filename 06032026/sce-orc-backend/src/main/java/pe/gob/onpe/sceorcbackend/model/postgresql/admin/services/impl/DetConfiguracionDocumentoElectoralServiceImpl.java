package pe.gob.onpe.sceorcbackend.model.postgresql.admin.services.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.gob.onpe.sceorcbackend.model.postgresql.admin.entity.DetConfiguracionDocumentoElectoral;
import pe.gob.onpe.sceorcbackend.model.postgresql.admin.repository.DetConfiguracionDocumentoElectoralRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.admin.services.DetConfiguracionDocumentoElectorallService;

@Service
public class DetConfiguracionDocumentoElectoralServiceImpl implements DetConfiguracionDocumentoElectorallService {

	private final DetConfiguracionDocumentoElectoralRepository detConfiguracionDocumentoElectoralRepository;
	
	public DetConfiguracionDocumentoElectoralServiceImpl(
			DetConfiguracionDocumentoElectoralRepository detConfiguracionDocumentoElectoralRepository) {
		this.detConfiguracionDocumentoElectoralRepository = detConfiguracionDocumentoElectoralRepository;
	}
	
	@Override
	@Transactional
	public void save(DetConfiguracionDocumentoElectoral k) {
		this.detConfiguracionDocumentoElectoralRepository.save(k);
	}

	@Override
	@Transactional
	public void saveAll(List<DetConfiguracionDocumentoElectoral> k) {
		this.detConfiguracionDocumentoElectoralRepository.saveAll(k);
	}

	@Override
	@Transactional
	public void deleteAll() {
		this.detConfiguracionDocumentoElectoralRepository.deleteAll();
	}

	@Override
	@Transactional(readOnly = true)
	public List<DetConfiguracionDocumentoElectoral> findAll() {
		return this.detConfiguracionDocumentoElectoralRepository.findAll();
	}

}
