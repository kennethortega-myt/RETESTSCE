package pe.gob.onpe.scebackend.model.exportar.orc.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.NullValueMappingStrategy;

import pe.gob.onpe.scebackend.model.entities.DetalleTipoEleccionDocumentoElectoralHistorial;
import pe.gob.onpe.scebackend.model.exportar.orc.dto.AdmDetTipoEleccionDocElectoralHistExportDto;

@Mapper(componentModel = "spring", nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS, nullValueMappingStrategy = NullValueMappingStrategy.RETURN_NULL)
public interface IAdmDetalleTipoEleccionDocumentoElectoralHistorialExportMapper 
					extends IMigracionMapper<AdmDetTipoEleccionDocElectoralHistExportDto, DetalleTipoEleccionDocumentoElectoralHistorial>, IFechaMapper {
	
	@Mapping(target = "idConfigProcesoElectoral", source = "entity.configuracionProcesoElectoral.id")
	@Mapping(target = "idTipoEleccion", source = "entity.tipoEleccion.id")
	@Mapping(target = "codigoTipoEleccion", source = "entity.tipoEleccion.codigo")
	@Mapping(target = "idDocumentoElectoral", source = "entity.documentoElectoral.id")
	@Mapping(target = "idConfigArchivo", source = "entity.archivo.id")
	@Mapping(target = "audUsuarioCreacion", source = "usuarioCreacion")
	@Mapping(target = "audUsuarioModificacion", source = "usuarioModificacion")
	@Mapping(target = "audFechaCreacion", source = "fechaCreacion", qualifiedByName = "convertirFecha")
	@Mapping(target = "audFechaModificacion", source = "fechaModificacion", qualifiedByName = "convertirFecha")
	AdmDetTipoEleccionDocElectoralHistExportDto toDto(DetalleTipoEleccionDocumentoElectoralHistorial entity);

}
