package pe.gob.onpe.sceorcbackend.rest.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.InstaladorService;
import pe.gob.onpe.sceorcbackend.utils.RoleAutority;

@RestController
@Validated
@CrossOrigin
@RequestMapping("/instalador")
public class InstaladorController {

    Logger logger = LoggerFactory.getLogger(InstaladorController.class);
    private final InstaladorService instaladorService;
    
    @Value("${file.installer.name}")
    private String filename;
    
    public InstaladorController(
    		InstaladorService instaladorService) {
    	this.instaladorService = instaladorService;
    }

    @PreAuthorize(RoleAutority.ADMINISTRADOR_CC)
    @GetMapping("/download/instalador")
    public ResponseEntity<Resource> descargarInstalador() {
        try {
            ByteArrayResource resource = instaladorService.descargar();

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename="+filename)
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .contentLength(resource.contentLength())
                        .body(resource);

            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            logger.error("Error /download/instalador: ", e);
            return ResponseEntity.status( HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
