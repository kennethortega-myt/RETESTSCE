package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl;

import com.itextpdf.text.Document;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.io.RandomAccessSource;
import com.itextpdf.text.io.RandomAccessSourceFactory;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.RandomAccessFileOrArray;
import com.itextpdf.text.pdf.codec.TiffImage;
import jakarta.validation.constraints.NotNull;
import net.lingala.zip4j.ZipFile;
import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import pe.gob.onpe.sceorcbackend.exception.BadRequestException;
import pe.gob.onpe.sceorcbackend.exception.utils.ArchivoProcesamientoException;
import pe.gob.onpe.sceorcbackend.model.dto.response.DigitizationGetFilesResponse;
import pe.gob.onpe.sceorcbackend.model.enums.TipoActaPDF;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Archivo;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Mesa;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.ActaRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.CabActaService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.StorageService;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;
import pe.gob.onpe.sceorcbackend.utils.ConstantesFormatos;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class StorageServiceImpl implements StorageService {

  static Logger logger = LoggerFactory.getLogger(StorageServiceImpl.class);

  @Value("${file.upload-dir}")
  private String uploadDir;

  @Value("${file.respaldo-dir}")
  private String respaldoFolder;

  private final ActaRepository actaRepository;

  public StorageServiceImpl(ActaRepository actaRepository) {
    this.actaRepository = actaRepository;
  }

  @Override
  public String getPathUpload() {
    return uploadDir;
  }

  @Override
  public Resource loadFile(String fileName, boolean isRespaldo) throws MalformedURLException {
    String cleanFileName = StringUtils.cleanPath(Objects.requireNonNull(fileName));

    Path rootPath = Paths.get(isRespaldo ? respaldoFolder : uploadDir).toAbsolutePath().normalize();
    Path targetPath = rootPath.resolve(cleanFileName).normalize();
    if (!targetPath.startsWith(rootPath)) {
      throw new SecurityException("Acceso denegado fuera del directorio permitido: " + fileName);
    }

    Resource resource = new UrlResource(targetPath.toUri());

    if (!resource.exists() || !resource.isReadable()) {
      throw new SecurityException("No se pudo cargar el archivo: " + fileName);
    }

    return resource;
  }

  public File convertTIFFToPDF(File tiffFile, String fileName) {

    File pdfFile = new File(uploadDir + fileName);
    try (FileOutputStream fileOutputStream = new FileOutputStream(pdfFile)) {
      RandomAccessSource ras = new RandomAccessSourceFactory().createBestSource(tiffFile.getAbsolutePath());
      RandomAccessFileOrArray myTiffFile = new RandomAccessFileOrArray(ras);
      try {
        int numberOfPages = TiffImage.getNumberOfPages(myTiffFile);
        Document tifftoPDF = new Document();

        try {
          PdfWriter pdfWriter = PdfWriter.getInstance(tifftoPDF, fileOutputStream);
          pdfWriter.setStrictImageSequence(true);
          tifftoPDF.open();

          for (int i = 1; i <= numberOfPages; i++) {
            Image tempImage = TiffImage.getTiffImage(myTiffFile, i);
            Rectangle pageSize = new Rectangle(tempImage.getWidth(), tempImage.getHeight());
            tifftoPDF.setPageSize(pageSize);
            tifftoPDF.newPage();
            tifftoPDF.add(tempImage);
          }
        } finally {
          if (tifftoPDF.isOpen()) {
            tifftoPDF.close();
          }
        }
      }finally {
        if (myTiffFile != null) {
          myTiffFile.close();
        }
      }
    } catch (Exception ex) {
      logger.error(ConstantesComunes.MENSAJE_LOGGER_ERROR, ex.getMessage());
    }
    return pdfFile;
  }

    @Override
    public File convertTIFFToPDFConvExtSTAE(File tiffFile, String fileName, TipoActaPDF tipoActa) {
        Rectangle targetSize = switch (tipoActa) {
            case CONVENCIONAL   -> new Rectangle(792f, 1224f);
            case CONVENCIONAL_EXTRANJERO -> PageSize.A4;
            case STAE                    -> PageSize.A4;
        };

        File pdfFile = new File(uploadDir + fileName);

        try (FileOutputStream fileOutputStream = new FileOutputStream(pdfFile)) {
            RandomAccessSource ras = new RandomAccessSourceFactory()
                    .createBestSource(tiffFile.getAbsolutePath());
            RandomAccessFileOrArray myTiffFile = new RandomAccessFileOrArray(ras);

            try {
                int numberOfPages = TiffImage.getNumberOfPages(myTiffFile);

                Document tifftoPDF = new Document(targetSize, 0f, 0f, 0f, 0f);

                try {
                    PdfWriter pdfWriter = PdfWriter.getInstance(tifftoPDF, fileOutputStream);
                    pdfWriter.setStrictImageSequence(true);
                    tifftoPDF.open();

                    for (int i = 1; i <= numberOfPages; i++) {
                        Image tempImage = TiffImage.getTiffImage(myTiffFile, i);

                        tempImage.scaleAbsolute(targetSize.getWidth(), targetSize.getHeight());

                        if (i > 1) {
                            tifftoPDF.setPageSize(targetSize);
                            tifftoPDF.newPage();
                        }

                        tempImage.setAbsolutePosition(0f, 0f);
                        pdfWriter.getDirectContent().addImage(tempImage);
                    }

                } finally {
                    if (tifftoPDF.isOpen()) {
                        tifftoPDF.close();
                    }
                }

            } finally {
                myTiffFile.close();
            }

        } catch (Exception ex) {
            logger.error(ConstantesComunes.MENSAJE_LOGGER_ERROR, ex.getMessage());
        }

        return pdfFile;
    }

    @Override
  public File convertTIFFToPDF2(byte[] tiffBytes, String fileName) {
    if (tiffBytes == null || tiffBytes.length == 0) {
      throw new IllegalArgumentException("El arreglo de bytes TIFF no puede ser nulo o vacío");
    }

    File pdfFile = new File(uploadDir + fileName);

    try (FileOutputStream fileOutputStream = new FileOutputStream(pdfFile);
        ByteArrayInputStream inputStream = new ByteArrayInputStream(tiffBytes)) {

      RandomAccessFileOrArray myTiffFile = new RandomAccessFileOrArray(inputStream);
      int numberOfPages = TiffImage.getNumberOfPages(myTiffFile);

      Document tifftoPDF = new Document();
      PdfWriter pdfWriter = PdfWriter.getInstance(tifftoPDF, fileOutputStream);
      pdfWriter.setStrictImageSequence(true);
      tifftoPDF.open();

      for (int i = 1; i <= numberOfPages; i++) {
        Image tempImage = TiffImage.getTiffImage(myTiffFile, i);
        Rectangle pageSize = new Rectangle(tempImage.getWidth(), tempImage.getHeight());
        tifftoPDF.setPageSize(pageSize);
        tifftoPDF.newPage();
        tifftoPDF.add(tempImage);
      }

      tifftoPDF.close();

    } catch (Exception ex) {
      logger.error("Error al convertir TIFF a PDF: {}", ex.getMessage(), ex);
      return null;
    }

    return pdfFile;
  }

  @Override
  public File convertTIFFToPDF3(ByteArrayResource tiffResource, String fileName) {
    if (tiffResource == null || !tiffResource.exists()) {
      throw new IllegalArgumentException("El recurso TIFF no puede ser nulo o inexistente");
    }

    File pdfFile = new File(uploadDir + fileName);

    try (FileOutputStream fileOutputStream = new FileOutputStream(pdfFile);
        ByteArrayInputStream inputStream = new ByteArrayInputStream(tiffResource.getByteArray())) {

      RandomAccessFileOrArray myTiffFile = new RandomAccessFileOrArray(inputStream);
      int numberOfPages = TiffImage.getNumberOfPages(myTiffFile);

      Document tifftoPDF = new Document();
      PdfWriter pdfWriter = PdfWriter.getInstance(tifftoPDF, fileOutputStream);
      pdfWriter.setStrictImageSequence(true);
      tifftoPDF.open();

      for (int i = 1; i <= numberOfPages; i++) {
        Image tempImage = TiffImage.getTiffImage(myTiffFile, i);
        Rectangle pageSize = new Rectangle(tempImage.getWidth(), tempImage.getHeight());
        tifftoPDF.setPageSize(pageSize);
        tifftoPDF.newPage();
        tifftoPDF.add(tempImage);
      }

      tifftoPDF.close();

    } catch (Exception ex) {
      logger.error("Error al convertir TIFF a PDF: {}", ex.getMessage(), ex);
      return null;
    }

    return pdfFile;
  }

  public DigitizationGetFilesResponse loadFilesToBase64(Archivo fileId1, Archivo fileId2) throws ExecutionException, InterruptedException {
    CompletableFuture<byte[]> acta1Future = procesarArchivoAsync(fileId1);
    CompletableFuture<byte[]> acta2Future = procesarArchivoAsync(fileId2);
    DigitizationGetFilesResponse dataBase64 = new DigitizationGetFilesResponse();

    // Inicializar la lista de CompletableFuture
    List<CompletableFuture<byte[]>> futures = new ArrayList<>();

    // Añadir sólo las CompletableFuture no nulas
    futures.add(acta1Future);
    futures.add(acta2Future);

    // Convertir la lista a un array
    CompletableFuture<?>[] futuresArray = futures.toArray(new CompletableFuture<?>[0]);

    // Espera a que todas las tareas se completen
    CompletableFuture.allOf(futuresArray).join();

    if (acta1Future != null && acta2Future != null) {
      dataBase64.setActa1File(Base64.getEncoder().encodeToString(acta1Future.get()));
      dataBase64.setActa2File(Base64.getEncoder().encodeToString(acta2Future.get()));
    }
    if (acta1Future != null && acta2Future == null) {
      dataBase64.setActa1File(Base64.getEncoder().encodeToString(acta1Future.get()));

    }
    if (acta1Future == null && acta2Future != null) {
      dataBase64.setActa2File(Base64.getEncoder().encodeToString(acta2Future.get()));
    }

    return dataBase64;
  }

  @Override
  public CompletableFuture<String> loadOnlyFileToBase64(Archivo guid) {

    return procesarArchivoAsync(guid)
        .thenApply(bytesPng -> Base64.getEncoder().encodeToString(bytesPng))
        .exceptionally(ex -> {
          logger.error("Error durante la conversión: {}", ex.getMessage());
          return null;
        });
  }

  public File obtenerArchivoDirectorio(String fileId) {
    Path filePath = Paths.get(uploadDir).resolve(fileId);
    Resource resource = null;
    try {
      resource = new UrlResource(filePath.toUri());
    } catch (MalformedURLException e) {
      return null;
    }

    if (!resource.exists() || !resource.isReadable()) {
      return null;
    }

    return new File(filePath.toString());
  }


  private CompletableFuture<byte[]> procesarArchivoAsync(Archivo fileId) {

    File file = this.obtenerArchivoDirectorio(fileId.getGuid());
    if (file == null) {
      return CompletableFuture.failedFuture(new ArchivoProcesamientoException("Archivo no encontrado para el ID: " + fileId));
    }


    return CompletableFuture.supplyAsync(() -> {
      try {
        return this.convertTiffToBytesPng(file);
      } catch (Exception e) {
        throw new ArchivoProcesamientoException("Error al convertir TIFF a PNG", e);
      }
    });
  }

  public byte[] convertTiffToBytesPng(File file) throws IOException {

    try (FileInputStream fis = new FileInputStream(file.getAbsolutePath());
         ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
      BufferedImage tiff = ImageIO.read(fis);
      ImageIO.write(tiff, "png", baos);
      return baos.toByteArray();
    }
  }


  /**
   * 6   los tif no tiene la longitud de caracteres de una lista de asistencia -5  No tiene la imagen  TIF de miembros de mesa no sorteados
   * -4  No tiene la imagen TIF de hoja de control de asistencia -3  Los tif deben ser dos -2  No cuenta con pdf -1  Carpeta vacia 0  otro
   * Error 1  Correcto
   */
  @Override
  public void validarContenidoZipMm(Mesa mesa, String nombreArchivo) {
    Path rootPath = Paths.get(uploadDir).toAbsolutePath().normalize();
    Path sourcePath = rootPath.resolve(StringUtils.cleanPath(nombreArchivo)).normalize();
    Path destinationPath = rootPath
            .resolve(ConstantesComunes.ABREV_DOCUMENT_HOJA_DE_ASISTENCIA)
            .resolve(mesa.getCodigo())
            .normalize();

    try {
      extraerZipMm(sourcePath, destinationPath);
      String[] archivos = listarArchivos(destinationPath);
      validarArchivosMm(archivos, mesa);
    } catch (Exception e) {
      logger.error(ConstantesComunes.MSJ_ERROR, e);
      throw new BadRequestException("Ocurrió un error al extraer las imágenes del archivo ZIP mm.");
    }
  }

  /* ------------------ Submétodos auxiliares ------------------ */

  private void extraerZipMm(Path source, Path destination) throws IOException {
    try (ZipFile zipFile = new ZipFile(source.toFile())) {
      zipFile.extractAll(destination.toString());
    }
  }

  private String[] listarArchivos(Path carpetaPath) {
    File carpeta = carpetaPath.toFile();
    String[] listado = carpeta.list();
    if (listado == null || listado.length == 0) {
      throw new BadRequestException("No existen elementos dentro del archivo ZIP.");
    }
    return listado;
  }

  private void validarArchivosMm(String[] listado, Mesa mesa) {
    final int cantidadPaginas = 2; // Debe contener 2 TIF
    int contarPdf = 0;
    int contarHojaControlAsistencia = 0;
    int contarRelacionMiembrosNoSorteados = 0;
    int cantidadTifLongitudCorrecta = 0;

    for (String archivo : listado) {
      String upper = archivo.toUpperCase();

      if (upper.endsWith(ConstantesFormatos.EXTENSION_FILE_TIF)
              && archivo.length() == ConstantesComunes.LONGITUD_CADENA_MM) {
        cantidadTifLongitudCorrecta++;
      }
      if (upper.endsWith(ConstantesFormatos.EXTENSION_FILE_PDF)) {
        contarPdf++;
      }
      if (upper.startsWith(mesa.getCodigo() + ConstantesComunes.COD_DOCUMENT_MIEMBROS_DE_MESA)) {
        contarHojaControlAsistencia++;
      }
      if (upper.startsWith(mesa.getCodigo() + ConstantesComunes.COD_DOCUMENT_MIEMBROS_DE_MESA_NO_SORTEADOS)) {
        contarRelacionMiembrosNoSorteados++;
      }
    }

    if (contarPdf != 1) {
      throw new BadRequestException("El zipeado no cuenta con el PDF "
              + mesa.getCodigo() + ConstantesFormatos.EXTENSION_FILE_PDF + ".");
    }
    if (contarHojaControlAsistencia != 1) {
      throw new BadRequestException("No se encontró la imagen TIF de hoja de control de asistencia.");
    }
    if (contarRelacionMiembrosNoSorteados != 1) {
      throw new BadRequestException("No se encontró la imagen TIF de la relación de miembros de mesa no sorteados.");
    }
    if (cantidadTifLongitudCorrecta != cantidadPaginas) {
      throw new BadRequestException("El zipeado debe contar con 2 imágenes TIF: " +
              "Hoja de Control de Asistencia y Relación de Miembros no Sorteados.");
    }
  }









  @Override
  public boolean validarContenidoZipLe(Mesa mesa, String filename) {
    Integer cantidadElectoresHabiles = mesa.getCantidadElectoresHabiles();

    Path rootPath = Paths.get(uploadDir).toAbsolutePath().normalize();
    Path sourcePath = buildSafePath(rootPath, filename);
    Path destinationPath = buildSafePath(rootPath, ConstantesComunes.ABREV_DOCUMENT_LISTA_ELECTORES);

    try {
      extraerZip(sourcePath, destinationPath);
      File carpetaMesa = validarCarpetaMesa(destinationPath, mesa.getCodigo());
      String[] listado = validarContenidoCarpeta(carpetaMesa);

      return validarArchivosMesa(listado, cantidadElectoresHabiles);

    } catch (IOException e) {
      throw new BadRequestException("Error procesando el archivo ZIP: " + e.getMessage());
    }
  }

  /* ------------------ Submétodos auxiliares ------------------ */

  private Path buildSafePath(Path root, String filename) {
    Path resolved = root.resolve(StringUtils.cleanPath(filename)).normalize();
    if (!resolved.startsWith(root)) {
      throw new SecurityException("Acceso denegado: fuera del directorio permitido");
    }
    return resolved;
  }

  private void extraerZip(Path source, Path destination) throws IOException {
    try (ZipInputStream zis = new ZipInputStream(new FileInputStream(source.toFile()))) {
      ZipEntry entry;
      while ((entry = zis.getNextEntry()) != null) {
        Path resolvedPath = destination.resolve(entry.getName()).normalize();
        if (!resolvedPath.startsWith(destination)) {
          throw new SecurityException("Archivo ZIP contiene rutas inválidas: " + entry.getName());
        }
        if (entry.isDirectory()) {
          Files.createDirectories(resolvedPath);
        } else {
          Files.createDirectories(resolvedPath.getParent());
          try (OutputStream os = Files.newOutputStream(resolvedPath)) {
            zis.transferTo(os);
          }
        }
      }
    }
  }

  private File validarCarpetaMesa(Path destinationPath, String codigoMesa) {
    File carpeta = destinationPath.resolve(codigoMesa).toFile();
    if (!carpeta.exists() || !carpeta.isDirectory()) {
      throw new BadRequestException("No se encontró la carpeta de la mesa: " + codigoMesa);
    }
    return carpeta;
  }

  private String[] validarContenidoCarpeta(File carpeta) {
    String[] listado = carpeta.list();
    if (listado == null || listado.length == 0) {
      throw new BadRequestException("No hay elementos dentro de la carpeta de la mesa");
    }
    return listado;
  }

  private boolean validarArchivosMesa(String[] listado, int cantidadElectoresHabiles) {
    int resto = cantidadElectoresHabiles % 10;
    int cantidadPaginas = cantidadElectoresHabiles / 10 + (resto > 0 ? 1 : 0);

    int contarTif = 0;
    int contarTifLongitudIncorrecta = 0;
    int contarPdf = 0;

    for (String nombre : listado) {
      String upper = nombre.toUpperCase();

      if (upper.endsWith(ConstantesFormatos.EXTENSION_FILE_TIF)) {
        contarTif++;
        if (nombre.length() != ConstantesComunes.LONGITUD_CADENA_LE) {
          contarTifLongitudIncorrecta++;
        }
      }
      if (upper.endsWith(ConstantesFormatos.EXTENSION_FILE_PDF)) {
        contarPdf++;
      }
    }

    if (contarPdf != 1) {
      throw new BadRequestException("No se encontró exactamente un archivo PDF dentro del ZIP");
    }
    if (contarTifLongitudIncorrecta != 0) {
      throw new BadRequestException("Los archivos TIFF tienen nombres con longitud incorrecta");
    }
    return contarTif == cantidadPaginas;
  }




  public void deleteAllFilesRepository() throws IOException {
    deleteDirectory(uploadDir);
  }


  public void deleteDirectory(String directoryPath) throws IOException {
    Path directory = Paths.get(directoryPath);
    Files.walkFileTree(directory, new SimpleFileVisitor<>() {
      @Override
      public FileVisitResult visitFile(@NotNull Path file,
                                       @NotNull BasicFileAttributes attrs) throws IOException {
        Files.delete(file);
        return FileVisitResult.CONTINUE;
      }

      @Override
      public FileVisitResult postVisitDirectory(@NotNull Path dir,
                                                IOException exc) throws IOException {
        if (!dir.equals(directory)) { // Evitar eliminar la carpeta raíz
          Files.delete(dir);        // Eliminar subdirectorios
        }
        return FileVisitResult.CONTINUE;
      }
    });
  }

  @Override
  public void storeFile(MultipartFile file, String fileName) throws IOException {
    Path targetPath = construirPathSeguro(fileName);
    Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
  }

  @Override
  public void storeFile(File file, String fileName) throws IOException {
    Path targetPath = construirPathSeguro(fileName);
    try (FileInputStream fileInputStream = new FileInputStream(file)) {
      Files.copy(fileInputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
    }
  }

  @Override
  public void storeFile(byte[] file, String fileName) throws IOException {
    Path targetPath = construirPathSeguro(fileName);
    try (InputStream fileInputStream = new ByteArrayInputStream(file)) {
      Files.copy(fileInputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
    }
  }

  @Override
  public void deleteFile(String fileName) throws IOException {
    Path targetPath = construirPathSeguro(fileName);
    Files.delete(targetPath);
  }

  /**
   * Construir ruta segura evitando Path Traversal.
   */
  private Path construirPathSeguro(String fileName) {
    String cleanFileName = StringUtils.cleanPath(Objects.requireNonNull(fileName));

    Path targetPath = Paths.get(uploadDir).resolve(cleanFileName).normalize();

    Path rootPath = Paths.get(uploadDir).toAbsolutePath().normalize();

    if (!targetPath.startsWith(rootPath)) {
      throw new SecurityException("Intento de acceso fuera del directorio permitido: " + fileName);
    }

    return targetPath;
  }

  @Override
  public String detectFileType(MultipartFile file) throws IOException {
    Tika tika = new Tika();
    return tika.detect(file.getInputStream());
  }

}
