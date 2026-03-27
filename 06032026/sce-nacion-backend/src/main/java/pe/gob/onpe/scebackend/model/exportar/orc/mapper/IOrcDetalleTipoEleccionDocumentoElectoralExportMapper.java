package pe.gob.onpe.scebackend.model.exportar.orc.mapper;

import org.mapstruct.*;

import pe.gob.onpe.scebackend.model.exportar.orc.dto.OrcDetTipoEleccionDocElectoralExportDto;
import pe.gob.onpe.scebackend.model.orc.entities.OrcDetalleTipoEleccionDocumentoElectoral;


@Mapper(componentModel = "spring", nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS, nullValueMappingStrategy = NullValueMappingStrategy.RETURN_NULL)
public interface IOrcDetalleTipoEleccionDocumentoElectoralExportMapper extends IMigracionMapper<OrcDetTipoEleccionDocElectoralExportDto, OrcDetalleTipoEleccionDocumentoElectoral>, IFechaMapper {


    @Mapping(target = "idEleccion", source = "entity.eleccion.id")
	@Mapping(target = "idProcesoElectoral", source = "entity.procesoElectoral.id")
    @Mapping(target = "idDocumentoElectoral", source = "entity.documentoElectoral.id")
    @Mapping(target = "audUsuarioCreacion", source = "usuarioCreacion")
	@Mapping(target = "audUsuarioModificacion", source = "usuarioModificacion")
	@Mapping(target = "audFechaCreacion", source = "fechaCreacion", qualifiedByName = "convertirFecha")
	@Mapping(target = "audFechaModificacion", source = "fechaModificacion", qualifiedByName = "convertirFecha")
    OrcDetTipoEleccionDocElectoralExportDto toDto(OrcDetalleTipoEleccionDocumentoElectoral entity);

}
