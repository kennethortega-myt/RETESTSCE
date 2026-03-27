package pe.gob.onpe.scebackend.model.service.impl;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
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
import pe.gob.onpe.scebackend.model.stae.dto.files.DocumentoElectoralDto;
import pe.gob.onpe.scebackend.utils.PathUtils;
import pe.gob.onpe.scebackend.utils.SceUtils;
import pe.gob.onpe.scebackend.utils.StaeUtils;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesEstadoActa;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesTipoDocumentoElectoral;

@Service
public class StaeFileServiceImpl implements StaeFileService {
	
	Logger logger = LoggerFactory.getLogger(StaeFileServiceImpl.class);

	public static final int ARCHIVO_ESCRUTINIO = 1;
    public static final int ARCHIVO_INSTALACION = 2;
    public static final int ARCHIVO_SUFRAGIO = 3;
    
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
	public List<DocumentoElectoralDto> crearArchivos(ActaElectoralRequestDto actaDto, String usuario){
		List<DocumentoElectoralDto> archivos = null;
		try {
			String archivoEscrutinio = actaDto.getRutaArchivoEscrutinio();
			String archivoInstalacion = actaDto.getRutaArchivoInstalacion();
			String archivoSufragio = actaDto.getRutaArchivoSufragio();
			DocumentoElectoralDto archivoEscrutinioDto = this.copiarSTAE(actaDto.getNumeroActa(), actaDto.getEleccion(), archivoEscrutinio, ARCHIVO_ESCRUTINIO, usuario);
			DocumentoElectoralDto archivoInstalacionDto =  this.copiarSTAE(actaDto.getNumeroActa(), actaDto.getEleccion(), archivoInstalacion, ARCHIVO_INSTALACION, usuario);
			DocumentoElectoralDto archivoSufragioDto =  this.copiarSTAE(actaDto.getNumeroActa(), actaDto.getEleccion(), archivoSufragio, ARCHIVO_SUFRAGIO, usuario);
			archivos = new ArrayList<>();
			if(archivoEscrutinioDto!=null){ archivos.add(archivoEscrutinioDto); }
			if(archivoInstalacionDto!=null){ archivos.add(archivoInstalacionDto); }
			if(archivoSufragioDto!=null){ archivos.add(archivoSufragioDto); }
			
			Optional<Acta> actaOp = this.actaRepository.findByNumeroMesaAndEleccion(actaDto.getNumeroActa(), actaDto.getEleccion());
			if(actaOp.isPresent()){
				Acta acta = actaOp.get();
				acta.setEstadoDigitalizacion(ConstantesEstadoActa.ESTADO_DIGTAL_1ER_CONTROL_ACEPTADA);
				this.actaRepository.save(acta);
			}
			
			return archivos;
		} catch (Exception e) {
			logger.error("Error al crear los archivos", e);
		}
		return archivos;
		
	}
	
	private DocumentoElectoralDto copiarSTAE(String numeroMesa, Integer idEleccion, String rutaOrigenArchivoStae, Integer tipoArchivo, String usuario){
		
		try {
			Integer tipoDocumentoElectoral = null;
			String nombreNuevoArchivo = UUID.randomUUID().toString();
			String nombreNuevoArchivoExtension = String.format("%s.%s", nombreNuevoArchivo, EXTENSION_PDF);
			String ruta = PathUtils.normalizePath(ubicacionFile, nombreNuevoArchivoExtension);
			Path origen = Paths.get(rutaOrigenArchivoStae);
	        Path destino = Paths.get(ubicacionFile, nombreNuevoArchivoExtension);
			Path finalCopy = Files.copy(origen, destino, StandardCopyOption.REPLACE_EXISTING);
			
			Optional<Acta> actaOp = this.actaRepository.findByNumeroMesaAndEleccion(numeroMesa, idEleccion);
	        
			if(actaOp.isPresent()){
				
				Archivo archivo = new Archivo();
				archivo.setPeso(SceUtils.formatBytes(finalCopy.toFile().length()));
		        archivo.setGuid(nombreNuevoArchivo);
		        archivo.setNombre(nombreNuevoArchivoExtension);
		        archivo.setNombreOriginal(nombreNuevoArchivoExtension);
		        archivo.setRuta(ruta);
		        archivo.setFormato(MIMETYPE_PDF);
		        archivo.setFechaCreacion(new Date());
		        archivo.setUsuarioCreacion(usuario);
		        Acta acta = actaOp.get();
				
				switch (tipoArchivo) {
				    case ARCHIVO_ESCRUTINIO:
				    	archivo.setDocumentoElectoral(ConstantesTipoDocumentoElectoral.ACTA_DE_ESCRUTINIO);
				    	tipoDocumentoElectoral = ConstantesTipoDocumentoElectoral.ACTA_DE_ESCRUTINIO;
				        acta.setArchivoEscrutinioFirmado(archivo);
				        break;
				    case ARCHIVO_INSTALACION:
				    	archivo.setDocumentoElectoral(ConstantesTipoDocumentoElectoral.ACTA_INSTALACION);
				    	tipoDocumentoElectoral = ConstantesTipoDocumentoElectoral.ACTA_INSTALACION;
				    	acta.setArchivoInstalacionFirmado(archivo);
				        break;
				    case ARCHIVO_SUFRAGIO:
				    	archivo.setDocumentoElectoral(ConstantesTipoDocumentoElectoral.ACTA_SUFRAGIO);
				    	tipoDocumentoElectoral = ConstantesTipoDocumentoElectoral.ACTA_SUFRAGIO;
				    	acta.setArchivoSufragioFirmado(archivo);
				        break;
				    default:
				    	break;
				}
				
				this.archivoRepository.save(archivo);
				logger.info("Se guardo el archivo con el id {}", archivo.getId());
				this.actaRepository.save(acta);
				logger.info("Se actualizo el acta con el id {}", acta.getId());
				
			}
			
	        return staeUtils.getDocumentoElectoralDto(finalCopy.toAbsolutePath().toString(), nombreNuevoArchivo, tipoDocumentoElectoral);
		} catch (Exception e) {
			logger.error("Error copia el archivo", e);
            return null;
		}
		
	}
	
}
