package pe.gob.onpe.scebackend.model.exportar.orc.service.impl;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.gob.onpe.scebackend.exeption.GenericException;
import pe.gob.onpe.scebackend.model.exportar.orc.dto.OrcDetTipoEleccionDocElectoralExportDto;
import pe.gob.onpe.scebackend.model.exportar.orc.mapper.IOrcDetalleTipoEleccionDocumentoElectoralExportMapper;
import pe.gob.onpe.scebackend.model.exportar.orc.service.IOrcDetalleTipoEleccionDocumentoElectoralExportService;
import pe.gob.onpe.scebackend.model.orc.entities.OrcDetalleTipoEleccionDocumentoElectoral;
import pe.gob.onpe.scebackend.model.orc.repository.OrcDetalleTipoEleccionDocumentoElectoralRepository;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;

@Service
public class OrcDetalleTipoEleccionDocumentoElectoralExportService implements IOrcDetalleTipoEleccionDocumentoElectoralExportService {

	@Autowired
	private OrcDetalleTipoEleccionDocumentoElectoralRepository repository;
	
	@Autowired
	private IOrcDetalleTipoEleccionDocumentoElectoralExportMapper mapper;
	
	@Override
	public List<OrcDetTipoEleccionDocElectoralExportDto> findByCc(String cc) {
		List<OrcDetalleTipoEleccionDocumentoElectoral> entidades = (List<OrcDetalleTipoEleccionDocumentoElectoral>) this.repository.findByCc(cc);
		List<OrcDetTipoEleccionDocElectoralExportDto> dtos = null;
		if(!Objects.isNull(entidades)) {
			dtos = entidades.stream().map(
					entity ->  this.mapper.toDto(entity)).collect(Collectors.toList());
		}
		return dtos;
	}
	
    @Override
    @Transactional("tenantTransactionManager")
    public OrcDetalleTipoEleccionDocumentoElectoral findByCopiaExt(String copia) {

        List<String> abreviaturas = Arrays.asList(
                ConstantesComunes.ABREV_ACTA_ESCRUTINIO_EXTRANJERO,
                ConstantesComunes.ABREV_ACTA_ESCRUTINIO_EXTRANJERO_HORIZONTAL
        );

        return this.repository
                .findByAbreviaturasAndCopia(abreviaturas, copia)
                .stream()
                .findFirst()
                .orElseThrow(() -> new GenericException(
                        String.format("No está configurado el acta de escrutinio para la copia %s.", copia)
                ));
    }

    @Override
    @Transactional("tenantTransactionManager")
    public OrcDetalleTipoEleccionDocumentoElectoral findAisByCopiaExt(String copia) {

        List<String> abreviaturas = List.of(
                ConstantesComunes.ABREV_ACTA_INSTALACION_SUGRAFIO_EXTRANJERO
        );

        return this.repository
                .findByAbreviaturasAndCopia(abreviaturas, copia)
                .stream()
                .findFirst()
                .orElseThrow(() -> new GenericException(
                        String.format("No está configurado el acta de instalación y sufragio para la copia %s.", copia)
                ));
    }

}
