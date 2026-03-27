package pe.gob.onpe.scebackend.model.service;

import org.springframework.http.ResponseEntity;
import pe.gob.onpe.scebackend.model.dto.AutorizacionDto;
import pe.gob.onpe.scebackend.model.dto.request.AutorizacionRequestDto;
import pe.gob.onpe.scebackend.model.dto.request.AutorizacionNacionRequestDto;
import pe.gob.onpe.scebackend.model.dto.response.AutorizacionNacionResponseDto;
import pe.gob.onpe.scebackend.model.dto.response.GenericResponse;

import java.util.List;

public interface IAutorizacionService {
    List<AutorizacionDto> listAutorizaciones();
    ResponseEntity<GenericResponse> aprobarAutorizacion(AutorizacionRequestDto filtro, String usuario);
    ResponseEntity<GenericResponse> rechazarAutorizacion(AutorizacionRequestDto filtro, String usuario);
    ResponseEntity<GenericResponse> crearSolicitudAutorizacion(AutorizacionNacionRequestDto request);
    ResponseEntity<AutorizacionNacionResponseDto> recibirAutorizacion(AutorizacionNacionRequestDto request);
}
