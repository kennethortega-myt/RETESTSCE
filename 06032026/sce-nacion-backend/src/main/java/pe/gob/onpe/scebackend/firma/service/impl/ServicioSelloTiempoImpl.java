package pe.gob.onpe.scebackend.firma.service.impl;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pe.gob.onpe.scebackend.firma.service.SelloTiempoCriptoONPE;
import pe.gob.onpe.scebackend.firma.service.ServicioSelloTiempo;
import pe.gob.onpe.scebackend.model.dto.transmision.ArchivoTransmisionDto;
import pe.gob.onpe.scebackend.model.orc.entities.Archivo;
import pe.gob.onpe.scebackend.utils.PathUtils;
import pe.gob.onpe.scebackend.utils.SceConstantes;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;

@Slf4j
@Service
public class ServicioSelloTiempoImpl implements ServicioSelloTiempo {

	public static final String ERROR = "error";
	@Value("${carpeta.local}")
	private String carpetaLocal;

	private final SelloTiempoCriptoONPE selloTiempoCriptoONPE;

    public ServicioSelloTiempoImpl(SelloTiempoCriptoONPE selloTiempoCriptoONPE) {
        this.selloTiempoCriptoONPE = selloTiempoCriptoONPE;
    }

    @Override
	public Archivo procesarArchivo(ArchivoTransmisionDto archivoDto, String path) {

		String mimeType = "application/pdf";
		String extension = "pdf";
		byte[] decodedBytes = Base64.getDecoder().decode(archivoDto.getBase64());
		String filename = archivoDto.getGuid();
		String filenameExt = String.format("%s.%s", filename, extension);

		String documento = PathUtils.normalizePath(carpetaLocal, filenameExt);

		try (FileOutputStream fileOutputStream = new FileOutputStream(documento)) {
			fileOutputStream.write(decodedBytes);
		} catch (IOException e) {
			log.error(ERROR, e);
			return null;
		}

		log.info("Se creo el documento");

		selloTiempoCriptoONPE.procesoSelloTiempo(documento);
		String filenameFirExt = String.format("%s.%s", filename + "[F]", extension);
		String pdfFirmado = PathUtils.normalizePath(carpetaLocal, filenameFirExt);
		File filePdfFirmado = null;
		for (int i = 0; i < 100; i++) {
			log.info("Esperando el firmado");
			try {
				TimeUnit.SECONDS.sleep(6);
			} catch (InterruptedException ex) {
				log.error(ex.getMessage());
				Thread.currentThread().interrupt();
			}
			filePdfFirmado = new File(pdfFirmado);
			if (filePdfFirmado.exists()) {
				break;
			} else {
				log.info("aun no existe el documento {}", pdfFirmado);
			}
		}
		

		String ruta = PathUtils.normalizePath(path, filenameExt);
		try (FileOutputStream fileOutputStream = new FileOutputStream(ruta)) {
			Path pdfPath = Paths.get(filePdfFirmado.getAbsolutePath());
			byte[] pdfBytes = Files.readAllBytes(pdfPath);
			fileOutputStream.write(pdfBytes);
			log.info("se creo el documento firmado");
		} catch (IOException e) {
			log.error(ERROR, e);
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
			archivo.setActivo(SceConstantes.ACTIVO);
			archivo.setFechaCreacion(new Date());
			archivo.setUsuarioCreacion(ConstantesComunes.USUARIO_SYSTEM);
			return archivo;
		} catch (Exception e) {
			log.error(ERROR, e);
			return null;
		}
	}

}
