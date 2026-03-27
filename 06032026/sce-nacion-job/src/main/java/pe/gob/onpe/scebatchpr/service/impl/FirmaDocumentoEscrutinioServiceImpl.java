package pe.gob.onpe.scebatchpr.service.impl;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.gob.onpe.scebatchpr.entities.orc.Acta;
import pe.gob.onpe.scebatchpr.entities.orc.Archivo;
import pe.gob.onpe.scebatchpr.exceptions.FirmaDigitalException;
import pe.gob.onpe.scebatchpr.repository.orc.ActaRepository;
import pe.gob.onpe.scebatchpr.repository.orc.ArchivoRepository;
import pe.gob.onpe.scebatchpr.service.FirmaDigitalDocumentoService;
import pe.gob.onpe.scebatchpr.service.FirmaDocumentoEscrutinioService;
import pe.gob.onpe.scebatchpr.utils.Constantes;
import pe.gob.onpe.scebatchpr.utils.SceConstantes;

@Service
public class FirmaDocumentoEscrutinioServiceImpl implements FirmaDocumentoEscrutinioService {

	Logger logger = LogManager.getLogger(FirmaDocumentoEscrutinioServiceImpl.class);
	
    private final FirmaDigitalDocumentoService firmaDigitalDocService;
    
    private final ActaRepository actaRepository;
    
    private final ArchivoRepository archivoRepository;
    
    @Value("${file.imagenes.sce-job}")
    private String ubicacionFile;
    
	public FirmaDocumentoEscrutinioServiceImpl(
			FirmaDigitalDocumentoService firmaDigitalDocService,
			ActaRepository actaRepository,
			ArchivoRepository archivoRepository) {
		this.firmaDigitalDocService = firmaDigitalDocService;
		this.actaRepository = actaRepository;
		this.archivoRepository = archivoRepository;
	}
	
	private void firmarDocumentoEscrutinio(Long idActa, String pathBase) {
        Optional<Acta> actaOp = this.actaRepository.findById(idActa);
        if(actaOp.isPresent() && actaOp.get().getArchivoEscrutinioFirmado()==null){
        	Acta acta = actaOp.get();
        	String guid = UUID.randomUUID().toString();
    		String extension = "pdf";
            String nombreArchivo = guid + "." + extension;
        	String rutaArchivo = acta.getArchivoEscrutinioPdf().getRuta();
            logger.info("guid: {}", guid);
            logger.info("nombre del nuevo archivo: {}", nombreArchivo);
            logger.info("ruta del documento a firmar: {}", rutaArchivo);
            try(InputStream firmadoStream = firmaDigitalDocService.firmarArchivo(rutaArchivo)) {
                
                String nuevaRutaArchivo = Paths.get(pathBase, nombreArchivo).toString();
                Files.copy(firmadoStream, Paths.get(nuevaRutaArchivo), StandardCopyOption.REPLACE_EXISTING);


                Archivo archivoFirmado =  Archivo.builder()
                        .guid(guid)
                        .nombre(nombreArchivo)
                        .nombreOriginal(nombreArchivo)
                        .formato(extension)
                        .peso(String.valueOf(Files.size(Paths.get(nuevaRutaArchivo))))
                        .ruta(nuevaRutaArchivo)
                        .activo(SceConstantes.ACTIVO)
    					.fechaCreacion(new Date())
    					.usuarioCreacion(Constantes.USUARIO_JOB)
                        .build();
                
                this.archivoRepository.save(archivoFirmado);
                acta.setArchivoEscrutinioFirmado(archivoFirmado);
                this.actaRepository.save(acta);
                
                logger.info("Se finaliza el firmado del documento de escrutinio con los siguientes parametros");
            } catch (Exception e) {
            	logger.error("Se genera el error para firmar documento", e);
                throw new FirmaDigitalException("Error al firmar documento", e);
            }
        }
        
    }

	@Override
	@Transactional
	public void firmarDocumentos() {
		List<Long> ids = this.actaRepository.findActasConArchivoEscrutinioSinFirma();
		if (ids != null && !ids.isEmpty()) {
			for(Long id:ids){
				this.firmarDocumentoEscrutinio(id, this.ubicacionFile);
			}
		}
	}
	
}
