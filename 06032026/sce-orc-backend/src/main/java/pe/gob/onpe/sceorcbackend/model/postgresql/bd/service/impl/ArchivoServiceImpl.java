package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl;


import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.gob.onpe.sceorcbackend.exception.BadRequestException;
import pe.gob.onpe.sceorcbackend.exception.InternalServerErrorException;
import pe.gob.onpe.sceorcbackend.model.dto.TokenInfo;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Archivo;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Mesa;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.ArchivoRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.ArchivoService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.StorageService;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;
import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ArchivoServiceImpl implements ArchivoService {

    private final ArchivoRepository archivoRepository;
    private final StorageService storageService;

    public ArchivoServiceImpl(ArchivoRepository archivoRepository,StorageService storageService) {
        this.archivoRepository = archivoRepository;
        this.storageService = storageService;
    }

    @Override
    public List<Archivo> findByNombre(String nombre) {
        return this.archivoRepository.findByNombre(nombre);
    }

    @Override
    public List<Archivo> findByNombreAndActivo(String nombre, Integer activo){
        return this.archivoRepository.findByNombreAndActivo(nombre, activo);
    }

    @Override
    public List<Archivo> findByGuidAndActivo(String gui, Integer activo) {
        return this.archivoRepository.findByGuidAndActivo(gui, activo);
    }

    @Override
    public Optional<Archivo> findById(Long id) {
        return this.archivoRepository.findById(id);
    }

    @Override
    public Archivo getArchivoById(Long id) {
        Optional<Archivo> optArchivo = this.archivoRepository.findById(id);
        return optArchivo.orElse(null);
    }

    @Override
    @Transactional
    public void deleteAllInBatch() {
        this.archivoRepository.deleteAllInBatch();
    }

    @Override
    @Transactional
    public void deleteAllOptimized() {
        int batchSize = 5000; // Procesa 5000 registros por lote
        int deletedRows;
        do {
            deletedRows = this.archivoRepository.deleteInBatch(batchSize);
        } while (deletedRows > 0);
    }

    @Override
    public Archivo guardarArchivo(MultipartFile file, String usuario, String codigoCentroComputo, Optional<Integer> codigoDocumentoElectoralPr) {
        try {
            String detectedType = this.storageService.detectFileType(file);
            Archivo archivo = new Archivo();
            archivo.setNombre(file.getOriginalFilename());
            archivo.setFormato(detectedType);
            archivo.setPeso(String.valueOf(file.getSize()));
            archivo.setActivo(ConstantesComunes.ACTIVO);
            archivo.setGuid(codigoCentroComputo.concat(ConstantesComunes.GUION_MEDIO).concat(DigestUtils.sha256Hex(file.getInputStream())));
            archivo.setUsuarioCreacion(usuario);
            archivo.setRuta(this.storageService.getPathUpload());
            archivo.setCodigoDocumentoElectoral(codigoDocumentoElectoralPr.orElse(null));
            archivo.setFechaCreacion(new Date());
            this.archivoRepository.save(archivo);
            this.storageService.storeFile(file, archivo.getGuid());
            return archivo;
        }catch (IOException e) {
            throw new InternalServerErrorException(e.getMessage());
        }
    }

    @Override
    public void save(Archivo archivo) {
        this.archivoRepository.save(archivo);
    }

    @Override
    public void saveAll(List<Archivo> k) {
        this.archivoRepository.saveAll(k);
    }

    @Override
    public void deleteAll() {
        this.archivoRepository.deleteAll();
    }

    @Override
    public List<Archivo> findAll() {
        return this.archivoRepository.findAll();
    }


    @Override
    public String getPathUpload() {
        return this.storageService.getPathUpload();
    }


    public void storeFile(MultipartFile multipartFile, String fileName){
        try {
            this.storageService.storeFile(multipartFile, fileName);
        } catch (IOException e) {
            throw new BadRequestException(
                    "No se puede guardar el archivo en el repositorio de imagenes."
            );
        }
    }

    @Override
    public void storeFile(File file, String fileName) {
        try {
            this.storageService.storeFile(file, fileName);
        } catch (IOException e) {
            throw new BadRequestException(
                    "No se puede guardar el archivo en el repositorio de imagenes."
            );
        }
    }


    public Archivo saveArchivo(String fileName, Long sizeFile, String guid, String usuario, String detectedType) {
        Archivo archivo = new Archivo();
        archivo.setNombre(fileName);
        archivo.setFormato(detectedType);
        archivo.setPeso(String.valueOf(sizeFile));
        archivo.setActivo(ConstantesComunes.ACTIVO);
        archivo.setGuid(guid);
        archivo.setRuta(this.storageService.getPathUpload());
        archivo.setUsuarioCreacion(usuario);
        archivo.setFechaCreacion(new Date());
        this.archivoRepository.save(archivo);
        return archivo;
    }

    @Override
    public boolean validarExtraerContenidoZipLe(Mesa mesa, String nombreArchivo) {
        return this.storageService.validarContenidoZipLe(mesa , nombreArchivo);
    }

    @Override
    public void validarExtraerContenidoZipMm(Mesa mesa, String nombreArchivo) {
        this.storageService.validarContenidoZipMm(mesa , nombreArchivo);
    }

    @Override
    public String obtegerUui(MultipartFile file, TokenInfo tokenInfo) {
        String guid;
        try {
            guid = tokenInfo.getCodigoCentroComputo().concat(ConstantesComunes.GUION_MEDIO).concat(DigestUtils.sha256Hex(file.getInputStream()));
        } catch (IOException e) {
            throw new BadRequestException("No se puedo generar el guid del archivo.");
        }
        return guid;
    }


}
