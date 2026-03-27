package pe.gob.onpe.scebackend.model.service.impl;

import java.io.File;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import pe.gob.onpe.scebackend.exeption.JneRecepcionException;
import pe.gob.onpe.scebackend.model.dto.request.RecepcionJne;
import pe.gob.onpe.scebackend.model.dto.request.RecepcionJneRequestDto;
import pe.gob.onpe.scebackend.model.dto.response.GenericResponse;
import pe.gob.onpe.scebackend.model.enums.EstadoOficioEnum;
import pe.gob.onpe.scebackend.model.enums.EstadoRecepcionJneEnum;
import pe.gob.onpe.scebackend.model.enums.TipoDocumentoJneEnum;
import pe.gob.onpe.scebackend.model.orc.entities.Archivo;
import pe.gob.onpe.scebackend.model.orc.entities.CentroComputo;
import pe.gob.onpe.scebackend.model.orc.entities.DetActaOficio;
import pe.gob.onpe.scebackend.model.orc.entities.JneTransmisionRecepcion;
import pe.gob.onpe.scebackend.model.orc.entities.Oficio;
import pe.gob.onpe.scebackend.model.orc.repository.CentroComputoRepository;
import pe.gob.onpe.scebackend.model.orc.repository.DetActaOficioRepository;
import pe.gob.onpe.scebackend.model.orc.repository.JneTransmisionRecepcionRepository;
import pe.gob.onpe.scebackend.model.orc.repository.OficioRepository;
import pe.gob.onpe.scebackend.model.service.IArchivoOrcService;
import pe.gob.onpe.scebackend.model.service.JneRecepcionService;
import pe.gob.onpe.scebackend.model.service.StorageService;
import pe.gob.onpe.scebackend.utils.SceConstantes;

@Service
@Slf4j
@RequiredArgsConstructor
public class JneRecepcionServiceImpl implements JneRecepcionService {

    private final OficioRepository oficioRepository;
    private final CentroComputoRepository centroComputoRepository;
    private final DetActaOficioRepository detActaOficioRepository;
    private final IArchivoOrcService archivoOrcService;
    private final JneTransmisionRecepcionRepository jneTransmisionRecepcionRepository;
    private final StorageService storageService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    private static final String HEADER_CC = "codigocc";

    @Value("${sce.cc.url-jne-recepcion}")
    private String urlEndpointJneRecepcion;

    @Override
    public void procesarRecepcion(MultipartFile pdf, String json, String codigoEnvio) {
        try {
            log.info("[procesarRecepcion] Recepción Nación recibida");
            log.info("[procesarRecepcion] Codigo de recepcion: {}", codigoEnvio);
            log.info("[procesarRecepcion] JSON recibido: {}", json);

            RecepcionJneRequestDto request = objectMapper.readValue(json, RecepcionJneRequestDto.class);
            String usuario = request.getDniUsuarioCarga();
            String numeroOficio = request.getCarga().getNumeroOficio();

            List<RecepcionJne> recepciones = request.getCarga().getRecepciones();

            if (recepciones == null || recepciones.isEmpty()) {
                throw new JneRecepcionException("Recepciones vacías en la trama");
            }

            RecepcionJne recepcion = recepciones.get(0);

            TipoDocumentoJneEnum tipoDocumento = TipoDocumentoJneEnum
                    .fromCodigo(recepcion.getDocumento().getTipoDocumento());

            Oficio oficio = oficioRepository.findByNombreOficio(numeroOficio)
                    .orElseThrow(() -> new IllegalArgumentException("Oficio no encontrado: " + numeroOficio));

            log.info("[procesarRecepcion] Oficio {} tipoDocumento {}", numeroOficio, tipoDocumento);

            Archivo archivo = null;

            switch (tipoDocumento) {
            case ERROR:
                procesarError(oficio, recepcion, usuario);
                break;
            case EXPEDIENTE:
                procesarExpediente(oficio, recepcion, usuario);
                break;
            case RESOLUCION:
                archivo = procesarResolucion(oficio, pdf, request);
                break;
            default:
                throw new IllegalArgumentException("Tipo documento no soportado: " + tipoDocumento);
            }

            registrarTramaRecepcion(json, usuario, archivo, tipoDocumento, codigoEnvio);
            log.info("[procesarRecepcion] Oficio actualizado correctamente: {}", numeroOficio);
        } catch (Exception e) {
            log.error("[procesarRecepcion] Error procesando recepción Nación", e);
            throw new JneRecepcionException("Error procesando recepción Nación", e);
        }
    }

    private Archivo procesarResolucion(Oficio oficio, MultipartFile pdf, RecepcionJneRequestDto request) {
        if (pdf == null || pdf.isEmpty()) {
            throw new JneRecepcionException("Archivo PDF requerido para resolución");
        }

        RecepcionJne recepcion = request.getCarga().getRecepciones().get(0);
        String numeroResolucion = recepcion.getDocumento().getNroDocumento();
        String usuario = request.getDniUsuarioCarga();

        oficio.setEstado(EstadoOficioEnum.ATENDIDO.getCodigo());
        oficio.setEstadoJne(SceConstantes.ACTIVO);
        oficio.setFechaRespuesta(convertirFecha(recepcion.getDocumento().getFechaDocumento()));
        oficio.setUsuarioModificacion(usuario);
        oficio.setFechaModificacion(new Date());

        oficioRepository.save(oficio);

        List<DetActaOficio> detalles = detActaOficioRepository.findByOficioId(oficio.getId());

        Archivo archivo = archivoOrcService.guardarArchivo(pdf, request.getDniUsuarioCarga(),
                request.getCarga().getIdOdpe(), Optional.empty());

        Date now = new Date();

        detalles.forEach(det -> {
            det.setArchivoJne(archivo);
            det.setNumeroResolucionJne(numeroResolucion);
            det.setFechaModificacion(now);
            det.setUsuarioModificacion(usuario);
        });

        detActaOficioRepository.saveAll(detalles);

        log.info("Resolución {} registrada para oficio {}", numeroResolucion, oficio.getNombreOficio());

        return archivo;
    }

    private void procesarExpediente(Oficio oficio, RecepcionJne recepcion, String usuario) {
        String expediente = recepcion.getDocumento().getNroDocumento();

        if (!EstadoOficioEnum.ATENDIDO.getCodigo().equals(oficio.getEstado())) {
            oficio.setEstado(EstadoOficioEnum.EXPEDIENTE_GENERADO.getCodigo());
        }
        oficio.setEstadoJne(SceConstantes.ACTIVO);
        oficio.setFechaRespuesta(convertirFecha(recepcion.getDocumento().getFechaDocumento()));
        oficio.setUsuarioModificacion(usuario);
        oficio.setFechaModificacion(new Date());

        oficioRepository.save(oficio);

        List<DetActaOficio> detalles = detActaOficioRepository.findByOficioId(oficio.getId());

        Date now = new Date();

        detalles.forEach(det -> {
            det.setNumeroExpediente(expediente);
            det.setFechaModificacion(now);
            det.setUsuarioModificacion(usuario);
        });

        detActaOficioRepository.saveAll(detalles);

        log.info("Expediente {} registrado para oficio {}", expediente, oficio.getNombreOficio());
    }

    private void procesarError(Oficio oficio, RecepcionJne recepcion, String usuario) {
        oficio.setEstado(EstadoOficioEnum.RECHAZADO_JEE.getCodigo());
        oficio.setFechaRespuesta(convertirFecha(recepcion.getDocumento().getFechaDocumento()));
        oficio.setEstadoJne(SceConstantes.ACTIVO);
        oficio.setUsuarioModificacion(usuario);
        oficio.setFechaModificacion(new Date());

        oficioRepository.save(oficio);
        log.info("Oficio {} marcado como ERROR", oficio.getNombreOficio());
    }

    private void registrarTramaRecepcion(String tramaJson, String usuario, Archivo archivo,
            TipoDocumentoJneEnum tipoDocumento, String codigoEnvio) {

        if (jneTransmisionRecepcionRepository.existsByCodigoJneEnvio(codigoEnvio)) {
            log.warn("Transmisión ya registrada codigoEnvio={}", codigoEnvio);
            throw new JneRecepcionException("Transmisión ya registrada codigoEnvio :" + codigoEnvio);
        }

        Archivo archivoGuardar = TipoDocumentoJneEnum.RESOLUCION == tipoDocumento ? archivo : null;

        JneTransmisionRecepcion registro = JneTransmisionRecepcion.builder().codigoJneEnvio(codigoEnvio)
                .trama(tramaJson).archivo(archivoGuardar).audUsuarioCreacion(usuario).audFechaCreacion(new Date())
                .build();

        JneTransmisionRecepcion reg = jneTransmisionRecepcionRepository.save(registro);
        enviarRecepcionOrc(reg);
    }

    public boolean enviarRecepcionOrc(JneTransmisionRecepcion registro) {
        log.info("[enviarRecepcionOrc] Iniciando envío id={}", registro.getId());
        try {
            short intentosActuales = registro.getIntentos() == null ? 0 : registro.getIntentos();

            if (intentosActuales >= SceConstantes.MAX_INTENTOS_JNE) {
                log.warn("[enviarRecepcionOrc] Máximo de intentos alcanzado id={}", registro.getId());
                return false;
            }

            if (registro.getEnviado() == EstadoRecepcionJneEnum.ENVIADO.getCodigo()) {
                log.info("[enviarRecepcionOrc] Registro {} ya fue enviado", registro.getId());
                return true;
            }

            log.info("[enviarRecepcionOrc] Bloqueo registro para envio : {}", registro.getId());
            registro.setIntentos((short) (registro.getIntentos() == null ? 1 : registro.getIntentos() + 1));
            registro.setEstado(EstadoRecepcionJneEnum.EN_PROCESO.getCodigo());
            jneTransmisionRecepcionRepository.save(registro);

            RecepcionJneRequestDto request = objectMapper.readValue(registro.getTrama(), RecepcionJneRequestDto.class);
            RecepcionJne recepcion = request.getCarga().getRecepciones().get(0);
            String numeroActa = recepcion.getActas().getNumeroMesa();

            CentroComputo cp = centroComputoRepository.findByCodigoMesa(numeroActa).orElseThrow(
                    () -> new IllegalStateException("CentroComputo no encontrado para acta " + numeroActa));

            log.info("[enviarRecepcionOrc] Centro de computo para envio trama : {}", cp.getCodigo());

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(cp.getApiTokenBackedCc());
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.add(HEADER_CC, cp.getCodigo());

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            body.add("json", new HttpEntity<>(registro.getTrama()));
//            body.add("codigoEnvio", new HttpEntity<>(registro.getCodigoJneEnvio()));
            if (registro.getArchivo() != null) {
                File ruta = storageService.obtenerArchivoRuta(registro.getArchivo());
                if (ruta == null) {
                    log.info("[enviarRecepcionOrc] - Error no se encuentro archivo");
                    throw new IllegalStateException(
                            "No se pudo acceder al archivo para transmisión ORC: " + registro.getArchivo().getId());
                }

                FileSystemResource pdfRes = new FileSystemResource(ruta);

                HttpHeaders pdfHeaders = new HttpHeaders();
                pdfHeaders.setContentType(MediaType.APPLICATION_PDF);

                body.add("filePdf", new HttpEntity<>(pdfRes, pdfHeaders));
            }

            String urlBase = String.format("%s://%s:%d", cp.getProtocolBackendCc(), cp.getIpBackendCc(),
                    cp.getPuertoBackedCc());

            String url = urlBase + urlEndpointJneRecepcion;

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<GenericResponse> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity,
                    GenericResponse.class);

            boolean ok = response.getStatusCode() == HttpStatus.OK;

            registro.setAudUsuarioModificacion(registro.getAudUsuarioCreacion());
            registro.setAudFechaModificacion(new Date());
            if (ok) {
                registro.setEnviado(EstadoRecepcionJneEnum.ENVIADO.getCodigo());
                registro.setEstado(EstadoRecepcionJneEnum.ENVIADO.getCodigo());
                registro.setMensaje("Enviado correctamente a CC");
            } else {
                registro.setEstado(EstadoRecepcionJneEnum.ERROR.getCodigo());
                registro.setMensaje("Ocurrio un error enviando a ORC");
            }

            jneTransmisionRecepcionRepository.save(registro);

            log.info("[enviarRecepcionOrc] Resultado envío id={} status={}", registro.getId(),
                    response.getStatusCode());
            return ok;
        } catch (Exception e) {
            log.error("[enviarRecepcionOrc] Error enviando a ORC id={}", registro.getId(), e);

            registro.setEstado(EstadoRecepcionJneEnum.ERROR.getCodigo());
            registro.setMensaje(e.getMessage());
            registro.setAudFechaModificacion(new Date());
            registro.setAudUsuarioModificacion(registro.getAudUsuarioCreacion());
            jneTransmisionRecepcionRepository.save(registro);
            return false;
        }
    }

    private Date convertirFecha(String fecha) {
        return Date.from(LocalDate.parse(fecha).atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

}
