package pe.gob.onpe.scebackend.rest.controller.reporte;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.gob.onpe.scebackend.model.dto.reportes.FiltroPrecisionAsistAutomaControlDigitalizacionDto;
import pe.gob.onpe.scebackend.model.dto.response.GenericResponse;
import pe.gob.onpe.scebackend.model.service.IConfiguracionProcesoElectoralService;
import pe.gob.onpe.scebackend.model.service.reporte.IPrecisionAsistAutomaControlDigitalizacionService;
import pe.gob.onpe.scebackend.rest.controller.BaseController;
import pe.gob.onpe.scebackend.security.dto.LoginUserHeader;
import pe.gob.onpe.scebackend.security.jwt.TokenDecoder;
import pe.gob.onpe.scebackend.utils.RoleAutority;

import java.sql.SQLException;

@PreAuthorize(RoleAutority.ROLES_SCE_WEB)
@RestController
@RequestMapping("precision-asist-automa-control-digitalizacion")
public class PrecisionAsistAutomaControlDigitalizacionController extends BaseController {

    private final IPrecisionAsistAutomaControlDigitalizacionService precisionAsistAutomaControlDigitalizacionService;
    private final IConfiguracionProcesoElectoralService confProcesoService;

    public PrecisionAsistAutomaControlDigitalizacionController(TokenDecoder tokenDecoder, IPrecisionAsistAutomaControlDigitalizacionService precisionAsistAutomaControlDigitalizacionService, IConfiguracionProcesoElectoralService confProcesoService) {
        super(tokenDecoder);
        this.precisionAsistAutomaControlDigitalizacionService = precisionAsistAutomaControlDigitalizacionService;
        this.confProcesoService = confProcesoService;
    }

    @PostMapping("/base64")
    public ResponseEntity<GenericResponse> getPrecisionAsistAutomaControlDigitalizacion(
            @Valid
            @RequestBody FiltroPrecisionAsistAutomaControlDigitalizacionDto filtro,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @RequestHeader("X-Tenant-Id") String tenant) throws SQLException {

        LoginUserHeader user = getUserLogin(authorization);
        filtro.setUsuario(user.getUsuario());
        String esquema = this.confProcesoService.getEsquema(tenant);
        filtro.setEsquema(esquema);

        byte[] resultado = this.precisionAsistAutomaControlDigitalizacionService.getPrecisionAsistAutomaControlDigitalizacion(filtro);

        return getPdfResponse(resultado);
    }
}
