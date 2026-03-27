package pe.gob.onpe.scebackend.rest.controller;

import java.util.Date;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pe.gob.onpe.scebackend.firma.service.ServicioSelloTiempo;
import pe.gob.onpe.scebackend.model.dto.transmision.ArchivoFirmaDto;
import pe.gob.onpe.scebackend.model.orc.entities.Acta;
import pe.gob.onpe.scebackend.model.orc.entities.Archivo;
import pe.gob.onpe.scebackend.model.orc.repository.ActaRepository;
import pe.gob.onpe.scebackend.model.orc.repository.TabArchivoRepository;
import pe.gob.onpe.scebackend.utils.SceConstantes;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;

@RestController
@RequestMapping("/transmision-archivo-nacion-firma")
public class TransmisionArchivoFirmaController {

	@Value("${fileserver.files}")
	private String ubicacionFile;

	private final ServicioSelloTiempo servicioSelloTiempo;

	private final ActaRepository actaRepository;

	private final TabArchivoRepository archivoRepository;

    public TransmisionArchivoFirmaController(ServicioSelloTiempo servicioSelloTiempo, ActaRepository actaRepository, TabArchivoRepository archivoRepository) {
        this.servicioSelloTiempo = servicioSelloTiempo;
        this.actaRepository = actaRepository;
        this.archivoRepository = archivoRepository;
    }

    @PostMapping("/escrutinio/sello-tiempo/")
	public ResponseEntity<Void> saveFileBase64(@RequestBody ArchivoFirmaDto archivoDto){
		Archivo archivo = servicioSelloTiempo.procesarArchivo(archivoDto.getArchivo(),
				this.ubicacionFile);
		Optional<Acta> actaOp = actaRepository.findById(archivoDto.getIdActa());
		final Acta acta = actaOp.orElse(new Acta());
		if (archivo != null) {
			archivo.setActivo(SceConstantes.ACTIVO);
			archivo.setFechaCreacion(new Date());
			archivo.setUsuarioCreacion(ConstantesComunes.USUARIO_SYSTEM);
			archivoRepository.save(archivo);
			if(archivoDto.getTipoArchivo()==1) {
				acta.setArchivoInstalacionSufragioFirmado(archivo);
			} else {
				acta.setArchivoEscrutinioFirmado(archivo);
			}
		}
		return new ResponseEntity<>(HttpStatus.OK);
	}

}
