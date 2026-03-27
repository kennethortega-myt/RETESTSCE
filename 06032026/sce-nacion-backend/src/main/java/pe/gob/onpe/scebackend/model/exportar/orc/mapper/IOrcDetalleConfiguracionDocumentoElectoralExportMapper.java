package pe.gob.onpe.scebackend.model.exportar.orc.mapper;

import org.mapstruct.*;

import pe.gob.onpe.scebackend.model.exportar.orc.dto.OrcDetConfigDocElectoralExportDto;
import pe.gob.onpe.scebackend.model.orc.entities.OrcDetalleConfiguracionDocumentoElectoral;


@Mapper(componentModel = "spring", nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS, nullValueMappingStrategy = NullValueMappingStrategy.RETURN_NULL)
public interface IOrcDetalleConfiguracionDocumentoElectoralExportMapper extends IMigracionMapper<OrcDetConfigDocElectoralExportDto, OrcDetalleConfiguracionDocumentoElectoral>, IFechaMapper {

    @Mapping(target = "idDetalleTipoEleccionDocumentoElectoral", source = "entity.detalleTipoEleccionDocumentoElectoral.id")
	@Mapping(target = "idSeccion", source = "entity.seccion.id")
    @Mapping(target = "audUsuarioCreacion", source = "usuarioCreacion")
	@Mapping(target = "audUsuarioModificacion", source = "usuarioModificacion")
	@Mapping(target = "audFechaCreacion", source = "fechaCreacion", qualifiedByName = "convertirFecha")
	@Mapping(target = "audFechaModificacion", source = "fechaModificacion", qualifiedByName = "convertirFecha")
    OrcDetConfigDocElectoralExportDto toDto(OrcDetalleConfiguracionDocumentoElectoral entity);


}
