package pe.gob.onpe.scebackend.firma.service.impl;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import pe.gob.onpe.scebackend.firma.service.SelloTiempoCriptoONPE;
import pe.gob.onpe.scebackend.model.dto.transmision.ArchivoTransmisionDto;
import pe.gob.onpe.scebackend.model.orc.entities.Acta;
import pe.gob.onpe.scebackend.model.orc.entities.Archivo;
import pe.gob.onpe.scebackend.model.orc.repository.TabArchivoRepository;
import pe.gob.onpe.scebackend.utils.PathUtils;
import pe.gob.onpe.scebackend.utils.SceConstantes;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;

@Service
public class AsynServicioSelloTiempo {

    public static final String ERROR = "error";
    private static final String MIME_TYPE = "application/pdf";
    private static final String EXTENSION = "pdf";
    Logger logger = LoggerFactory.getLogger(AsynServicioSelloTiempo.class);

    @Value("${carpeta.local}")
    private String carpetaLocal;

    private final TabArchivoRepository archivoRepository;

    private final SelloTiempoCriptoONPE selloTiempoCriptoONPE;

    public AsynServicioSelloTiempo(TabArchivoRepository archivoRepository, SelloTiempoCriptoONPE selloTiempoCriptoONPE) {
        this.archivoRepository = archivoRepository;
        this.selloTiempoCriptoONPE = selloTiempoCriptoONPE;
    }

    @Async("taskExecutor")
    public Future<Archivo> procesarArchivoAsync(ArchivoTransmisionDto archivoDto, String path, Acta acta) throws IOException {
        String filename = UUID.randomUUID().toString();
        String filenameExt = String.format("%s.%s", filename, EXTENSION);
        String ruta = PathUtils.normalizePath(path, filenameExt);
        String documento = PathUtils.normalizePath(carpetaLocal, filenameExt);

        byte[] decodedBytes = Base64.getDecoder().decode(archivoDto.getBase64());
        if (this.falloAlEscribirArchivo(documento, decodedBytes)) return null;

        selloTiempoCriptoONPE.procesoSelloTiempo(documento);
        String filenameFirExt = String.format("%s.%s", filename + "[F]", EXTENSION);
        String pdfFirmado = PathUtils.normalizePath(carpetaLocal, filenameFirExt);
        File filePdfFirmado = this.esperaArchivoFirmado(pdfFirmado);

        Path pdfPath = Paths.get(filePdfFirmado.getAbsolutePath());
        byte[] pdfBytes = Files.readAllBytes(pdfPath);
        if (this.falloAlEscribirArchivo(ruta, pdfBytes)) return null;

        Archivo archivo = this.construirArchivo(filePdfFirmado, filename, filenameFirExt,ruta);
        try {
            archivoRepository.save(archivo);
            acta.setArchivoInstalacionSufragioFirmado(archivo);
            return CompletableFuture.completedFuture(archivo);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return null;
        }
    }

    private boolean falloAlEscribirArchivo(String path, byte[] content) {
        try (FileOutputStream fos = new FileOutputStream(path)) {
            fos.write(content);
            return false;
        } catch (IOException e) {
            logger.error(ERROR, e);
            return true;
        }
    }

    private File esperaArchivoFirmado(String pdfFirmado) {
        File filePdfFirmado = new File(pdfFirmado);
        for (int i = 0; i < 100; i++) {
            if (filePdfFirmado.exists()) {
                return filePdfFirmado;
            }
            try {
                TimeUnit.SECONDS.sleep(6);
            } catch (InterruptedException ex) {
                logger.error(ex.getMessage());
                Thread.currentThread().interrupt();
            }
        }
        return filePdfFirmado;
    }

    private Archivo construirArchivo(File filePdfFirmado, String filename, String filenameFirExt, String ruta) {
        Archivo archivo = new Archivo();
        archivo.setPeso(String.valueOf(filePdfFirmado.length()));
        archivo.setGuid(filename);
        archivo.setNombre(filename);
        archivo.setNombreOriginal(filenameFirExt);
        archivo.setRuta(ruta);
        archivo.setFormato(MIME_TYPE);
        archivo.setActivo(SceConstantes.ACTIVO);
        archivo.setFechaCreacion(new Date());
        archivo.setUsuarioCreacion(ConstantesComunes.USUARIO_SYSTEM);
        return archivo;
    }
    
}
