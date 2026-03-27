package pe.gob.onpe.sceorcbackend.model.postgresql.importar.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.gob.onpe.sceorcbackend.model.postgresql.importar.entity.ImportPadronElectoralProgreso;
import pe.gob.onpe.sceorcbackend.model.postgresql.importar.repository.ImportPadronElectoralProgresoRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.importar.service.ImportPadronElectoralProgresoService;

@Service
public class ImportPadronElectoralProgresoServiceImpl implements ImportPadronElectoralProgresoService {

	private final ImportPadronElectoralProgresoRepository padronElectoralProgresoRepository;
	
	public ImportPadronElectoralProgresoServiceImpl(
			ImportPadronElectoralProgresoRepository padronElectoralProgresoRepository) {
		this.padronElectoralProgresoRepository = padronElectoralProgresoRepository;
	}
	
	@Override
	@Transactional
	public void save(ImportPadronElectoralProgreso k) {
		this.padronElectoralProgresoRepository.save(k);
	}

	@Override
	@Transactional
	public void saveAll(List<ImportPadronElectoralProgreso> k) {
		this.padronElectoralProgresoRepository.saveAll(k);
	}

	@Override
	@Transactional
	public void deleteAll() {
		this.padronElectoralProgresoRepository.deleteAll();
	}

	@Override
	@Transactional(readOnly = true)
	public List<ImportPadronElectoralProgreso> findAll() {
		return this.padronElectoralProgresoRepository.findAll();
	}
	
	@Transactional(readOnly = true)
	public Optional<ImportPadronElectoralProgreso> findFirstByOrderByIdDesc(){
		return this.padronElectoralProgresoRepository.findFirstByOrderByIdDesc();
	}

}
