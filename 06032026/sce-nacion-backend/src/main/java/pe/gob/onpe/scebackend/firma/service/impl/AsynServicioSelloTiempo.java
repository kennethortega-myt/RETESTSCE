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

        String mimeType = "application/pdf";
        String extension = "pdf";
        byte[] decodedBytes = Base64.getDecoder().decode(archivoDto.getBase64());
        String filename = UUID.randomUUID().toString();
        String filenameExt = String.format("%s.%s", filename, extension);
        String ruta = PathUtils.normalizePath(path, filenameExt);
        String documento = PathUtils.normalizePath(carpetaLocal, filenameExt);

        try (FileOutputStream fileOutputStream = new FileOutputStream(documento)) {
            fileOutputStream.write(decodedBytes);
        } catch (IOException e) {
            logger.error(ERROR, e);
            return null;
        }

        selloTiempoCriptoONPE.procesoSelloTiempo(documento);
        String filenameFirExt = String.format("%s.%s", filename + "[F]", extension);
        String pdfFirmado = PathUtils.normalizePath(carpetaLocal, filenameFirExt);
        File filePdfFirmado;
        for (int i = 0; i < 100; i++) {
            try {
                TimeUnit.SECONDS.sleep(6);
            } catch (InterruptedException ex) {
                logger.error(ex.getMessage());
                Thread.currentThread().interrupt();
            }
            filePdfFirmado = new File(pdfFirmado);
            if (filePdfFirmado.exists()) {
                break;
            }
        }
        filePdfFirmado = new File(pdfFirmado);
        Path pdfPath = Paths.get(filePdfFirmado.getAbsolutePath());
        byte[] pdfBytes = Files.readAllBytes(pdfPath);

        try (FileOutputStream fileOutputStream1 = new FileOutputStream(ruta)) {
            fileOutputStream1.write(pdfBytes);
        } catch (IOException e) {
            logger.error(ERROR, e);
            return null;
        }

        try {
            Archivo archivo = new Archivo();
            archivo.setPeso(String.valueOf(filePdfFirmado.length()));
            archivo.setGuid(filename);
            archivo.setNombre(filename);
            archivo.setNombreOriginal(filenameFirExt);
            archivo.setRuta(ruta);
            archivo.setFormato(mimeType);
            archivo.setActivo(SceConstantes.ACTIVO);//
            archivo.setFechaCreacion(new Date());//
            archivo.setUsuarioCreacion(ConstantesComunes.USUARIO_SYSTEM);//

            archivoRepository.save(archivo);
            acta.setArchivoInstalacionSufragioFirmado(archivo);

            return CompletableFuture.completedFuture(archivo);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return null;
        }
    }
    
}
