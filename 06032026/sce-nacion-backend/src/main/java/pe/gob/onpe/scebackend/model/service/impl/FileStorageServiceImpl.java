package pe.gob.onpe.scebackend.model.service.impl;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pe.gob.onpe.scebackend.exeption.NotFoundException;
import pe.gob.onpe.scebackend.model.dto.ArchivoDTO;
import pe.gob.onpe.scebackend.model.dto.response.DescargaResponseDTO;
import pe.gob.onpe.scebackend.model.dto.response.FileStorageResponseDTO;
import pe.gob.onpe.scebackend.model.entities.Archivo;
import pe.gob.onpe.scebackend.model.service.IArchivoService;
import pe.gob.onpe.scebackend.model.service.IFileStorageService;
import pe.gob.onpe.scebackend.utils.SceUtils;
import pe.gob.onpe.scebackend.utils.TokenUtil;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.stream.Stream;

@Service
public class FileStorageServiceImpl implements IFileStorageService {

    @Value("${fileserver.path}")
    private String rootFolder;

    @Value("${security.jwt.tokenSigningKey}")
    private String tokenSigningKey;

    @Autowired
    private IArchivoService archivoService;


    @Override
    public FileStorageResponseDTO save(String guid, MultipartFile file, String acronimo) throws IOException {
        Path root = Paths.get(rootFolder).resolve(acronimo);
        Files.createDirectories(root);

        Archivo archivo = archivoService.getArchivoByGuuid(guid);
        archivo.setNombreOriginal(file.getOriginalFilename());
        archivo.setNombre(file.getName());
        archivo.setFormato(FilenameUtils.getExtension(file.getOriginalFilename()));
        archivo.setPeso(String.valueOf(file.getSize()));
        archivo.setGuid(SceUtils.generarGUID());
        archivo.setRuta(rootFolder+ "//"+acronimo+"//"+archivo.getNombreOriginal());
        archivo.setUsuarioCreacion(ConstantesComunes.USUARIO_SYSTEM);
        archivo = archivoService.guardarArchivo(archivo);
        FileUtils.copyInputStreamToFile(file.getInputStream(),
                new File(root.resolve(archivo.getGuid() + "." + archivo.getFormato()).toUri()));
        FileStorageResponseDTO response = new FileStorageResponseDTO();
        response.setIdentificador(archivo.getId());
        return response;
    }

    @Override
    public FileStorageResponseDTO save(String guid, MultipartFile file) throws IOException {

        Path root = Paths.get(rootFolder);
        Archivo archivo = archivoService.getArchivoByGuuid(guid);
        archivo.setNombreOriginal(file.getOriginalFilename());
        archivo.setNombre(file.getName());
        archivo.setFormato(FilenameUtils.getExtension(file.getOriginalFilename()));
        archivo.setPeso(String.valueOf(file.getSize()));
        archivo.setGuid(SceUtils.generarGUID());
        archivo.setRuta(rootFolder+"//"+archivo.getNombreOriginal());
        archivo.setUsuarioCreacion(ConstantesComunes.USUARIO_SYSTEM);
        archivo = archivoService.guardarArchivo(archivo);
        FileUtils.copyInputStreamToFile(file.getInputStream(),
                new File(root.resolve(archivo.getGuid() + "." + archivo.getFormato()).toUri()));
        FileStorageResponseDTO response = new FileStorageResponseDTO();
        response.setIdentificador(archivo.getId());
        return response;
    }

    @Override
    public FileStorageResponseDTO update(String identificador) {
        return null;
    }

    @Override
    public void deleteAllByFolder(String folder) throws IOException {
        Path targetFolder = Paths.get(rootFolder).resolve(folder);

        if (!Files.exists(targetFolder) || !Files.isDirectory(targetFolder)) {
            throw new IllegalArgumentException("La subcarpeta no existe o no es válida: " + folder);
        }

        try (Stream<Path> files = Files.walk(targetFolder)) {
            files
                    .sorted(Comparator.reverseOrder()) // Borrar archivos antes que carpetas
                    .filter(path -> !path.equals(targetFolder)) // No borrar la subcarpeta en sí
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException e) {
                            throw new RuntimeException("Error al eliminar: " + path, e);
                        }
                    });
        }
    }

    @Override
    public DescargaResponseDTO get(Integer idArchivo) throws IOException {

        ArchivoDTO archivo = archivoService.getArchivoById(idArchivo);
        Path root = Paths.get(rootFolder);
        Path file = root.resolve(archivo.getGuid() + "." + archivo.getFormato());
        Resource resource = new UrlResource(file.toUri());

        if (resource.exists() || resource.isReadable()) {
            return new DescargaResponseDTO(archivo.getNombreOriginal(), resource);
        } else {
            throw new NotFoundException("archivo no existe");
        }
    }

    @Override
    public ArchivoDTO get(String identificador, Integer tipoSustento) {
        return null;
    }

    @Override
    public FileStorageResponseDTO token(String identificador, String hash) {
        return new FileStorageResponseDTO(TokenUtil.generateSustento(identificador, hash, tokenSigningKey));
    }

    @Override
    public ByteArrayResource getArchivo(Integer identificador, Integer tipoSustento) throws IOException {
        return null;
    }

    @Override
    public ByteArrayResource getAdjunto(String folder, String archivo) throws IOException {
        Path root = Paths.get(rootFolder, folder);
        return new ByteArrayResource(Files.readAllBytes(root.resolve(archivo)));
    }
}
