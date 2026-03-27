package pe.gob.onpe.scebackend.model.exportar.orc.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.NullValueMappingStrategy;

import pe.gob.onpe.scebackend.model.entities.DetalleConfiguracionDocumentoElectoralHistorial;
import pe.gob.onpe.scebackend.model.exportar.orc.dto.AdmDetConfigDocElectoralHistExportDto;

@Mapper(componentModel = "spring", nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS, nullValueMappingStrategy = NullValueMappingStrategy.RETURN_NULL)
public interface IAdmDetalleConfiguracionDocumentoElectoralHistorialExportMapper 
	extends IMigracionMapper<AdmDetConfigDocElectoralHistExportDto, DetalleConfiguracionDocumentoElectoralHistorial>, IFechaMapper {

	@Mapping(target = "idDetalleTipoEleccionDocumentoElectoralHistorial", source = "entity.detalleTipoEleccionDocumentoElectoralHistorial.id")
	@Mapping(target = "idSeccion", source = "entity.seccion.id")
	@Mapping(target = "audUsuarioCreacion", source = "usuarioCreacion")
	@Mapping(target = "audUsuarioModificacion", source = "usuarioModificacion")
	@Mapping(target = "audFechaCreacion", source = "fechaCreacion", qualifiedByName = "convertirFecha")
	@Mapping(target = "audFechaModificacion", source = "fechaModificacion", qualifiedByName = "convertirFecha")
	AdmDetConfigDocElectoralHistExportDto toDto(DetalleConfiguracionDocumentoElectoralHistorial entity);
	
}
