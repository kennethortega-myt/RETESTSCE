package pe.gob.onpe.scebackend.rest.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.gob.onpe.scebackend.exeption.ResponseHelperException;
import pe.gob.onpe.scebackend.model.dto.AutorizacionDto;
import pe.gob.onpe.scebackend.model.dto.request.AutorizacionRequestDto;
import pe.gob.onpe.scebackend.model.dto.request.AutorizacionNacionRequestDto;
import pe.gob.onpe.scebackend.model.dto.response.AutorizacionNacionResponseDto;
import pe.gob.onpe.scebackend.model.dto.response.GenericResponse;
import pe.gob.onpe.scebackend.model.dto.response.GenericResponseAlternative;
import pe.gob.onpe.scebackend.model.service.IAutorizacionService;
import pe.gob.onpe.scebackend.security.dto.LoginUserHeader;
import pe.gob.onpe.scebackend.security.jwt.TokenDecoder;

import java.util.List;

@RestController
@RequestMapping("/autorizacion")
public class AutorizacionController extends BaseController{

    private final IAutorizacionService autorizacionService;

    public AutorizacionController(TokenDecoder tokenDecoder,
                                  IAutorizacionService autorizacionService){
        super(tokenDecoder);
        this.autorizacionService = autorizacionService;
    }

    @PostMapping("/list-autorizacion")
    public ResponseEntity<GenericResponseAlternative<List<AutorizacionDto>>> listAutorizaciones() {
        try{
            List<AutorizacionDto> listAutorizacionDto = this.autorizacionService.listAutorizaciones();
            return ResponseHelperException.createSuccessResponse("Operación realizada con éxito", listAutorizacionDto);
        }
        catch (Exception e){
            return ResponseHelperException.handleCommonExceptions(e, "AutorizacionController.listarAutorizaciones");
        }
    }

    @PostMapping("/aprobar-autorizacion")
    public ResponseEntity<GenericResponse> aprobarAutorizacion(
            @RequestBody AutorizacionRequestDto filtro,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        LoginUserHeader user = getUserLogin(authorization);
        return this.autorizacionService.aprobarAutorizacion(filtro,user.getUsuario());
    }

    @PostMapping("/rechazar-autorizacion")
    public ResponseEntity<GenericResponse> rechazarAutorizacion(
            @RequestBody AutorizacionRequestDto filtro,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        LoginUserHeader user = getUserLogin(authorization);
        return this.autorizacionService.rechazarAutorizacion(filtro,user.getUsuario());
    }

    @PatchMapping("/recibir-autorizacion")
    public ResponseEntity<AutorizacionNacionResponseDto> recibirAutorizacion(@RequestBody AutorizacionNacionRequestDto request) {
        return this.autorizacionService.recibirAutorizacion(request);
    }

    @PatchMapping("/crear-solicitud-autorizacion")
    public ResponseEntity<GenericResponse> crearSolicitudAutorizacion(@RequestBody AutorizacionNacionRequestDto request) {
        return this.autorizacionService.crearSolicitudAutorizacion(request);
    }
}
