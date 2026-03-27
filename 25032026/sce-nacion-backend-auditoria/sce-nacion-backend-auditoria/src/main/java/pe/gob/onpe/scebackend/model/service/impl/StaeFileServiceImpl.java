package pe.gob.onpe.scebackend.model.service.impl;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import pe.gob.onpe.scebackend.model.orc.entities.Acta;
import pe.gob.onpe.scebackend.model.orc.entities.Archivo;
import pe.gob.onpe.scebackend.model.orc.repository.ActaRepository;
import pe.gob.onpe.scebackend.model.orc.repository.TabArchivoRepository;
import pe.gob.onpe.scebackend.model.service.StaeFileService;
import pe.gob.onpe.scebackend.model.stae.dto.ActaElectoralRequestDto;
import pe.gob.onpe.scebackend.model.stae.dto.files.ArchivoCopyDto;
import pe.gob.onpe.scebackend.model.stae.dto.files.DocumentoElectoralDto;
import pe.gob.onpe.scebackend.utils.PathUtils;
import pe.gob.onpe.scebackend.utils.SceUtils;
import pe.gob.onpe.scebackend.utils.StaeUtils;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesEstadoActa;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesTipoDocumentoElectoral;

@Service
public class StaeFileServiceImpl implements StaeFileService {
	
	Logger logger = LoggerFactory.getLogger(StaeFileServiceImpl.class);

    
    private static final String EXTENSION_PDF = "pdf";
	
	private static final String MIMETYPE_PDF = "application/pdf";
    
    @Value("${fileserver.files}")
	private String ubicacionFile;
    
    private final ActaRepository actaRepository;
    
    private final TabArchivoRepository archivoRepository;
    
    private final StaeUtils staeUtils;
    
    public StaeFileServiceImpl(
    		ActaRepository actaRepository,
    		StaeUtils staeUtils,
    		TabArchivoRepository archivoRepository){
    	this.actaRepository = actaRepository;
    	this.staeUtils = staeUtils;
    	this.archivoRepository = archivoRepository;
    }
    
    @Transactional(
	        value = "tenantTransactionManager",
	        propagation = Propagation.REQUIRES_NEW
	    )
    @Override
    public List<DocumentoElectoralDto> crearArchivos(ActaElectoralRequestDto actaDto, String usuario){
		List<DocumentoElectoralDto> archivos = null;
    	Map<Integer, ArchivoCopyDto> archivoCopy = new HashMap<>();
		try {
			String archivoEscrutinio = actaDto.getRutaArchivoEscrutinio();
			String archivoInstalacion = actaDto.getRutaArchivoInstalacion();
			String archivoSufragio = actaDto.getRutaArchivoSufragio();
			
			Optional<Acta> actaOp = this.actaRepository.findByNumeroMesaAndEleccion(actaDto.getNumeroActa(), actaDto.getEleccion());

			
			this.copiarSTAE(archivoEscrutinio, ConstantesTipoDocumentoElectoral.ACTA_DE_ESCRUTINIO, usuario, archivoCopy);
			this.copiarSTAE(archivoInstalacion, ConstantesTipoDocumentoElectoral.ACTA_INSTALACION, usuario, archivoCopy);
			this.copiarSTAE(archivoSufragio, ConstantesTipoDocumentoElectoral.ACTA_SUFRAGIO, usuario, archivoCopy);
			
			ArchivoCopyDto archivoEscrutinioCopiado = archivoCopy.get(ConstantesTipoDocumentoElectoral.ACTA_DE_ESCRUTINIO);
			ArchivoCopyDto archivoInstalacionCopiado = archivoCopy.get(ConstantesTipoDocumentoElectoral.ACTA_INSTALACION);
			ArchivoCopyDto archivoSufragioCopiado = archivoCopy.get(ConstantesTipoDocumentoElectoral.ACTA_SUFRAGIO);
			
			if(actaOp.isPresent()){
				
				Acta acta = actaOp.get();
				
				Archivo archivoEscrutinioFirmado = this.getArchivo(archivoEscrutinioCopiado);
				Archivo archivoInstalacionFirmado = this.getArchivo(archivoInstalacionCopiado);
				Archivo archivoSufragioFirmado = this.getArchivo(archivoSufragioCopiado);
				this.archivoRepository.save(archivoEscrutinioFirmado);
				this.archivoRepository.save(archivoInstalacionFirmado);
				this.archivoRepository.save(archivoSufragioFirmado);
				
				acta.setArchivoEscrutinioFirmado(archivoEscrutinioFirmado);
				acta.setArchivoInstalacionFirmado(archivoInstalacionFirmado);
				acta.setArchivoSufragioFirmado(archivoSufragioFirmado);
				
				acta.setEstadoDigitalizacion(ConstantesEstadoActa.ESTADO_DIGTAL_1ER_CONTROL_ACEPTADA);
				this.actaRepository.save(acta);

			}
			
			archivos = new ArrayList<>();
			if(archivoEscrutinioCopiado!=null){ archivos.add(getDocumentoElectoral(archivoEscrutinioCopiado)); }
			if(archivoInstalacionCopiado!=null){ archivos.add(getDocumentoElectoral(archivoInstalacionCopiado)); }
			if(archivoSufragioCopiado!=null){ archivos.add(getDocumentoElectoral(archivoSufragioCopiado)); }
			
			return archivos;
		} catch (Exception e) {
			logger.error("Error al crear los archivos", e);
		}
		return archivos;
		
	}
	
	private void copiarSTAE(String rutaOrigenArchivoStae, Integer tipoArchivo, String usuario, Map<Integer, ArchivoCopyDto> archivoCopy){
		
		try {
			String nombreNuevoArchivo = UUID.randomUUID().toString();
			String nombreNuevoArchivoExtension = String.format("%s.%s", nombreNuevoArchivo, EXTENSION_PDF);
			String ruta = PathUtils.normalizePath(ubicacionFile, nombreNuevoArchivoExtension);
			Path origen = Paths.get(rutaOrigenArchivoStae);
	        Path destino = Paths.get(ubicacionFile, nombreNuevoArchivoExtension);
			Path finalCopy = Files.copy(origen, destino, StandardCopyOption.REPLACE_EXISTING);
			
			ArchivoCopyDto archivo = new ArchivoCopyDto();
			archivo.setPeso(SceUtils.formatBytes(finalCopy.toFile().length()));
	        archivo.setGuid(nombreNuevoArchivo);
	        archivo.setNombre(nombreNuevoArchivoExtension);
	        archivo.setNombreOriginal(nombreNuevoArchivoExtension);
	        archivo.setRuta(ruta);
	        archivo.setFormato(MIMETYPE_PDF);
	        archivo.setFechaCreacion(new Date());
	        archivo.setUsuarioCreacion(usuario);
	        archivo.setPathAbsolute(finalCopy.toAbsolutePath().toString());
	        archivo.setTipoDocumentoElectoral(tipoArchivo);
	        
	        archivoCopy.put(tipoArchivo, archivo);
		
		} catch (Exception e) {
			logger.error("Error copia el archivo", e);
		}
	}
	
	private Archivo getArchivo(ArchivoCopyDto archivoCopiado){
		Archivo archivo = new Archivo();
		archivo.setPeso(archivoCopiado.getPeso());
        archivo.setGuid(archivoCopiado.getGuid());
        archivo.setNombre(archivoCopiado.getNombre());
        archivo.setNombreOriginal(archivoCopiado.getNombreOriginal());
        archivo.setRuta(archivoCopiado.getRuta());
        archivo.setFormato(archivoCopiado.getFormato());
        archivo.setFechaCreacion(archivoCopiado.getFechaCreacion());
        archivo.setUsuarioCreacion(archivoCopiado.getUsuarioCreacion());
        archivo.setDocumentoElectoral(archivoCopiado.getTipoDocumentoElectoral());
        return archivo;
	}
	
	private DocumentoElectoralDto getDocumentoElectoral(ArchivoCopyDto archivoCopiado){
		return staeUtils.getDocumentoElectoralDto(
				archivoCopiado.getPathAbsolute(),
				archivoCopiado.getGuid(), 
				archivoCopiado.getTipoDocumentoElectoral());
	}

	
	
}
