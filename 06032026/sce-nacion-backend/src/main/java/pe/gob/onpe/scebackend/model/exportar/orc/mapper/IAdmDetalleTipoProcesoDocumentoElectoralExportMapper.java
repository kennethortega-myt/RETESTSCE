package pe.gob.onpe.scebackend.model.exportar.orc.mapper;

import org.mapstruct.*;

import pe.gob.onpe.scebackend.model.entities.DetalleTipoEleccionDocumentoElectoral;
import pe.gob.onpe.scebackend.model.exportar.orc.dto.AdmDetTipoEleccionDocElectoralExportDto;


@Mapper(componentModel = "spring", nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS, nullValueMappingStrategy = NullValueMappingStrategy.RETURN_NULL)
public interface IAdmDetalleTipoProcesoDocumentoElectoralExportMapper extends IMigracionMapper<AdmDetTipoEleccionDocElectoralExportDto, DetalleTipoEleccionDocumentoElectoral>, IFechaMapper {


    @Mapping(target = "idTipoEleccion", source = "entity.tipoEleccion.id")
	@Mapping(target = "idDocElectoral", source = "entity.documentoElectoral.id")
	@Mapping(target = "idConfigArchivo", source = "entity.archivo.id")
    @Mapping(target = "audUsuarioCreacion", source = "usuarioCreacion")
	@Mapping(target = "audUsuarioModificacion", source = "usuarioModificacion")
	@Mapping(target = "audFechaCreacion", source = "fechaCreacion", qualifiedByName = "convertirFecha")
	@Mapping(target = "audFechaModificacion", source = "fechaModificacion", qualifiedByName = "convertirFecha")
    AdmDetTipoEleccionDocElectoralExportDto toDto(DetalleTipoEleccionDocumentoElectoral entity);

}
