package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import pe.gob.onpe.sceorcbackend.model.dto.response.DigitizationGetFilesResponse;
import pe.gob.onpe.sceorcbackend.model.enums.TipoActaPDF;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Archivo;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Mesa;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

public interface StorageService {

  Resource loadFile(String fileName, boolean isRespaldo) throws MalformedURLException;

  File convertTIFFToPDF(File tiffFile, String fileName);

  File convertTIFFToPDFConvExtSTAE(File tiffFile, String fileName, TipoActaPDF tipoActa);

  File convertTIFFToPDF2(byte[] tiffBytes, String fileName);

  File convertTIFFToPDF3(ByteArrayResource tiffResource, String fileName);

  DigitizationGetFilesResponse loadFilesToBase64(Archivo fileId1, Archivo fileId2)
      throws IOException, ExecutionException, InterruptedException;

  CompletableFuture<String> loadOnlyFileToBase64(Archivo fileId) throws IOException, ExecutionException, InterruptedException;

  String getPathUpload();

  void validarContenidoZipMm(Mesa mesa, String nombreArchivo);

  boolean validarContenidoZipLe(Mesa mesa, String filename );

  void storeFile(MultipartFile file, String fileName) throws IOException;

  void storeFile(File file, String fileName) throws IOException;

  void storeFile(byte[] file, String fileName) throws IOException;

  void deleteFile(String fileName) throws IOException;

  String detectFileType(MultipartFile file) throws IOException;


  void deleteAllFilesRepository() throws IOException;

}
