package pe.gob.onpe.scebackend.model.service.impl;

import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import pe.gob.onpe.scebackend.exeption.BusinessValidationException;
import pe.gob.onpe.scebackend.model.dto.*;
import pe.gob.onpe.scebackend.model.dto.request.AutorizacionRequestDto;
import pe.gob.onpe.scebackend.model.dto.request.AutorizacionNacionRequestDto;
import pe.gob.onpe.scebackend.model.dto.response.AutorizacionNacionResponseDto;
import pe.gob.onpe.scebackend.model.dto.response.GenericResponse;
import pe.gob.onpe.scebackend.model.orc.entities.CentroComputo;
import pe.gob.onpe.scebackend.model.orc.entities.TabAutorizacion;
import pe.gob.onpe.scebackend.model.orc.entities.TabResolucion;
import pe.gob.onpe.scebackend.model.orc.repository.ActaRepository;
import pe.gob.onpe.scebackend.model.orc.repository.CentroComputoRepository;
import pe.gob.onpe.scebackend.model.orc.repository.TabResolucionRepository;
import pe.gob.onpe.scebackend.model.service.*;
import pe.gob.onpe.scebackend.model.service.comun.IAmbitoElectoralService;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesAutorizacionOrc;
import pe.gob.onpe.scebackend.utils.constantes.ConstantesComunes;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AutorizacionServiceImpl implements IAutorizacionService {

    private final ITabAutorizacionService tabAutorizacionService;
    private final ActaRepository actaRepository;
    private final TabResolucionRepository tabResolucionRepository;
    private final CentroComputoRepository centroComputoRepository;
    private final IDetalleCatalogoEstructuraService detalleCatalogoEstructuraService;
    private final Logger logger = LoggerFactory.getLogger(AutorizacionServiceImpl.class);
    private final ITabLogTransaccionalService logService;
    private final ICentroComputoService centroComputoService;
    private final IAmbitoElectoralService ambitoElectoralService;
    private static final Set<String> TIPOS_CON_VALIDACION_COMPLETA = Set.of(
            ConstantesAutorizacionOrc.TIPO_AUTORIZACION_CONTROL_CALIDAD,
            ConstantesAutorizacionOrc.TIPO_AUTORIZACION_LISTADO_PC,
            ConstantesAutorizacionOrc.TIPO_AUTORIZACION_RECHAZAR_RESOLUCION
    );

    @Override
    @Transactional(transactionManager = "locationTransactionManager", readOnly = true)
    public List<AutorizacionDto> listAutorizaciones(){
        Map<String, String> estadosMap = this.getEstadosAprobacionMap();
        Map<String, String> tiposAutorizacionMap = this.getTiposAutorizacionMap();
        Map<String, String> tiposdocumentoMap = this.getTiposDocumentoMap();

        if (estadosMap.isEmpty() || tiposAutorizacionMap.isEmpty() || tiposdocumentoMap.isEmpty()) {
            throw new BusinessValidationException("No se encontraron catálogos necesarios para procesar las autorizaciones.");
        }

        List<TabAutorizacion> autorizaciones = this.tabAutorizacionService.listAutorizaciones();
        if (CollectionUtils.isEmpty(autorizaciones)) {
            throw new BusinessValidationException("No se encontraron autorizaciones para el proceso seleccionado.");
        }

        Map<String, String> centrosComputoMap = this.getCentrosComputoMap(autorizaciones);

        return autorizaciones.stream()
                .map(tabAutorizacion -> this.convertToDto(
                        tabAutorizacion,
                        estadosMap,
                        tiposAutorizacionMap,
                        tiposdocumentoMap,
                        centrosComputoMap))
                .toList();
    }

    @Override
    public ResponseEntity<GenericResponse> aprobarAutorizacion(AutorizacionRequestDto filtro, String usuario) {
        GenericResponse genericResponse = new GenericResponse();
        genericResponse.setSuccess(Boolean.TRUE);
        boolean resultado = this.tabAutorizacionService.aprobacionAutorizacion(filtro.getIdAutorizacion(), usuario);
        if (resultado) {
            CentroComputo centroComputoNacion = centroComputoService.getPadreNacion();
            String mensaje = String.format("El usuario %s aprobó la autorización de %s del centro de cómputo %s - %s.",
                    usuario, filtro.getDescTipoAutorizacion(),filtro.getCodigoCentroComputo(),filtro.getNombreCentroComputo());
            this.logService.registrarLog(usuario, Thread.currentThread().getStackTrace()[1].getMethodName(),
                    this.getClass().getSimpleName(), mensaje, "",
                    centroComputoNacion.getCodigo(), ConstantesComunes.LOG_TRANSACCIONES_AUTORIZACION_NO, ConstantesComunes.LOG_TRANSACCIONES_ACCION);
        }
        genericResponse.setData(resultado);
        return new ResponseEntity<>(genericResponse, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GenericResponse> rechazarAutorizacion(AutorizacionRequestDto filtro, String usuario) {
        GenericResponse genericResponse = new GenericResponse();
        Boolean resultado = this.tabAutorizacionService.rechazarAutorizacion(filtro.getIdAutorizacion(), usuario);
        
        if (Boolean.TRUE.equals(resultado)) {
            genericResponse.setSuccess(Boolean.TRUE);
            genericResponse.setMessage("Autorización rechazada exitosamente");
            genericResponse.setData(Boolean.TRUE);
            CentroComputo centroComputoNacion = centroComputoService.getPadreNacion();
            String mensaje = String.format("El usuario %s rechazó la autorización de %s del centro de cómputo %s - %s.",
                    usuario, filtro.getDescTipoAutorizacion(),filtro.getCodigoCentroComputo(),filtro.getNombreCentroComputo());
            this.logService.registrarLog(usuario, Thread.currentThread().getStackTrace()[1].getMethodName(),
                    this.getClass().getSimpleName(), mensaje, "",
                    centroComputoNacion.getCodigo(), ConstantesComunes.LOG_TRANSACCIONES_AUTORIZACION_NO, ConstantesComunes.LOG_TRANSACCIONES_ACCION);
            return new ResponseEntity<>(genericResponse, HttpStatus.OK);
        } else {
            genericResponse.setSuccess(Boolean.FALSE);
            genericResponse.setMessage("No se pudo rechazar la autorización. Solo se pueden rechazar autorizaciones en estado pendiente.");
            genericResponse.setData(Boolean.FALSE);
            return new ResponseEntity<>(genericResponse, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<AutorizacionNacionResponseDto> recibirAutorizacion(AutorizacionNacionRequestDto request) {
        AutorizacionNacionResponseDto response = new AutorizacionNacionResponseDto();
        response.setFromCentroComputo(Boolean.FALSE);//ES NACION
        try {

            Optional<TabAutorizacion> autorizacionOpt = validarAutorizacionExistente(request);

            if (autorizacionOpt.isPresent()) {
                TabAutorizacion tabAutorizacionObj = autorizacionOpt.get();
                response.setSolicitudGenerada(Boolean.TRUE);

                if (tabAutorizacionObj.getEstadoAprobacion().equals(ConstantesComunes.ESTADO_APROBADO)) {
                    response.setAutorizado(Boolean.TRUE);
                    response.setMensaje("Acceso autorizado");
                    response.setIdAutorizacion(tabAutorizacionObj.getId().toString());
                    tabAutorizacionObj.setEstadoAprobacion(ConstantesComunes.ESTADO_EJECUTADA);
                    this.tabAutorizacionService.save(tabAutorizacionObj);
                } else {
                    response.setAutorizado(Boolean.FALSE);
                    response.setMensaje(generarMensajeAutorizacion(request));
                    response.setIdAutorizacion("0");
                }
            } else {
                // Entra cuando no tiene una solicitud pendiente ni aprobada
                response.setSolicitudGenerada(Boolean.FALSE);
                response.setMensaje("No cuenta con ninguna solicitud pendiente de aprobación");
                response.setIdAutorizacion("0");
            }
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al recibir autorización: ", e);
            return new ResponseEntity<>(response, HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    @Override
    public ResponseEntity<GenericResponse> crearSolicitudAutorizacion(
            AutorizacionNacionRequestDto request) {
        GenericResponse response = new GenericResponse();

        try {
            // Validar que no existe autorización previa
            Optional<TabAutorizacion> validaAutorizacion = validarAutorizacionExistente(request);

            if (validaAutorizacion.isPresent()) {
                response.setMessage("Ya existe una autorización para esta solicitud");
                return new ResponseEntity<>(response, HttpStatus.UNPROCESSABLE_ENTITY);
            }

            Optional<CentroComputo> centroComputoOpt = centroComputoRepository.findOneByCc(request.getCc());
            String nombreCentroComputo = "";
            if (centroComputoOpt.isPresent()) {
                nombreCentroComputo = centroComputoOpt.get().getNombre();
            }


            // Crear nueva autorización
            TabAutorizacion nuevaAutorizacion = crearNuevaAutorizacion(request, nombreCentroComputo);
            tabAutorizacionService.save(nuevaAutorizacion);

            // Respuesta exitosa
            response.setData(Boolean.TRUE);
            response.setSuccess(Boolean.TRUE);
            response.setMessage(ConstantesComunes.MENSAJE_SOLICITUD_USUARIO + request.getUsuario() + " realizada");

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (DocumentoNoEncontradoException e) {
            logger.error("Documento no encontrado: ", e);
            response.setMessage(e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            logger.error("Error al crear solicitud de autorización: ", e);
            response.setMessage("Error interno del servidor");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Optional<TabAutorizacion> validarAutorizacionExistente(AutorizacionNacionRequestDto request) {
        if (TIPOS_CON_VALIDACION_COMPLETA.contains(request.getTipoAutorizacion())) {
            return tabAutorizacionService.validaAutorizacion(
                    request.getUsuario(),
                    request.getTipoAutorizacion(),
                    request.getTipoDocumento(),
                    request.getIdDocumento(),
                    request.getCc()
            );
        }

        return tabAutorizacionService.validaAutorizacion(
                request.getUsuario(),
                request.getTipoAutorizacion()
        );
    }

    private TabAutorizacion crearNuevaAutorizacion(
            AutorizacionNacionRequestDto request, String nombreCentroComputo) {

        TabAutorizacion tabAutorizacion = new TabAutorizacion();
        tabAutorizacion.setEstadoAprobacion(ConstantesComunes.ESTADO_PENDIENTE);
        tabAutorizacion.setTipoAutorizacion(request.getTipoAutorizacion());
        tabAutorizacion.setNumeroAutorizacion(1L);
        tabAutorizacion.setAutorizacion(1);
        tabAutorizacion.setActivo(1);
        tabAutorizacion.setCodigoCentroComputo(request.getCc());
        tabAutorizacion.setTipoDocumento(request.getTipoDocumento());
        tabAutorizacion.setIdDocumento(request.getIdDocumento());

        // Configurar detalle
        String detalle = generarDescripcionGenerica(request, nombreCentroComputo);

        tabAutorizacion.setDetalle(detalle);

        // Configurar auditoría
        Date now = new Date();
        tabAutorizacion.setFechaCreacion(now);
        tabAutorizacion.setFechaModificacion(now);
        tabAutorizacion.setUsuarioCreacion(request.getUsuario());

        return tabAutorizacion;
    }

    private String generarDescripcionGenerica(AutorizacionNacionRequestDto request, String nombreCentroComputo) {

        String descripcion = switch (request.getTipoAutorizacion()) {
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_REPROCESAR_ACTA ->
                    "para realizar un reprocesamiento.";
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_IMPORTACION_PADRONES ->
                    "para realizar una importación de padrones.";
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_IMPORTACION_DATOS ->
                    "para realizar una importación de datos.";
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_PUESTO_CERO ->
                    String.format("para realizar una Puesta a Cero por centro de cómputo %s.", nombreCentroComputo);
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_REPROCESAR_MESA ->
                    "para realizar un reprocesamiento de mesa.";
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_REAPERTURA_CC ->
                    String.format("para realizar una reapertura del centro de cómputo %s.", nombreCentroComputo);
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_CONTROL_CALIDAD ->
                    generarDescripcionControlCalidad(request);
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_LISTADO_PC ->
                    String.format("para eliminar una PC del listado del centro de cómputo %s.", nombreCentroComputo);
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_ELIMINAR_OMISO ->
                    "para eliminar omisos";
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_RECHAZAR_RESOLUCION ->
                    String.format("para rechazar una resolución del centro de cómputo %s.", nombreCentroComputo);
            default -> "";
        };

        return ConstantesComunes.MENSAJE_SOLICITUD_USUARIO + request.getUsuario() + " " + descripcion;
    }

    private String generarMensajeAutorizacion(AutorizacionNacionRequestDto request) {
        String descripcion = switch (request.getTipoAutorizacion()) {
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_REPROCESAR_ACTA ->
                    "Existe una solicitud pendiente que fue enviada a nación para aprobar el reprocesamiento del acta, espere por favor.";
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_IMPORTACION_PADRONES ->
                    "Existe una solicitud pendiente que fue enviada a nación para aprobar la importación de padrones, espere por favor.";
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_IMPORTACION_DATOS ->
                    "Existe una solicitud pendiente que fue enviada a nación para aprobar la importación de datos, espere por favor.";
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_PUESTO_CERO ->
                    "Existe una solicitud pendiente que fue enviada a nación para aprobar la puesta a cero, espere por favor.";
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_REPROCESAR_MESA ->
                    "Existe una solicitud pendiente que fue enviada a nación para el reprocesamiento de la mesa, espere por favor.";
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_REAPERTURA_CC ->
                    "Existe una solicitud pendiente que fue enviada a nación para la reapertura del centro de cómputo, espere por favor.";
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_CONTROL_CALIDAD ->
                    generarMensajeControlCalidad(request);
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_LISTADO_PC ->
                    "Existe una solicitud pendiente que fue enviada a nación para eliminar la PC de la lista, espere por favor.";
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_ELIMINAR_OMISO ->
                    "Existe una solicitud pendiente que fue enviada a nación para aprobar la eliminación de omisos, espere por favor.";
            case ConstantesAutorizacionOrc.TIPO_AUTORIZACION_RECHAZAR_RESOLUCION ->
                    "Existe una solicitud pendiente que fue enviada a nación para rechazar la resolución, espere por favor.";
            default -> "Existe una solicitud pendiente, espere por favor.";
        };

        return ConstantesComunes.MENSAJE_SOLICITUD_USUARIO + request.getUsuario() + ": " + descripcion;
    }

    private String generarMensajeControlCalidad(AutorizacionNacionRequestDto request) {
        if (ConstantesComunes.CONTROL_CALIDAD_TIPO_DOCUMENTO_ACTA.equals(request.getTipoDocumento())) {
            return "Existe una solicitud pendiente que fue enviada a nación para el control de calidad del acta, espere por favor.";

        } else if (ConstantesComunes.CONTROL_CALIDAD_TIPO_DOCUMENTO_RESOLUCION.equals(request.getTipoDocumento())) {
            return "Existe una solicitud pendiente que fue enviada a nación para el control de calidad de la resolución, espere por favor.";

        } else {
            return "Existe una solicitud pendiente que fue enviada a nación para el control de calidad, espere por favor.";
        }
    }
    
    private String generarDescripcionControlCalidad(AutorizacionNacionRequestDto request) {
        if (ConstantesComunes.CONTROL_CALIDAD_TIPO_DOCUMENTO_ACTA.equals(request.getTipoDocumento())) {
            ActaInfoDTO actaInfo = obtenerInfoActa(request.getIdDocumento());
            
            if( actaInfo.getNumeroCopia() == null || actaInfo.getDigitoChequeoEscrutinio() == null ) {
            	return String.format("para observar el acta %s en el control de calidad.",
                        actaInfo.getCodigoMesa());
            } else {
            	return String.format("para observar el acta %s-%s%s en el control de calidad.",
                        actaInfo.getCodigoMesa(),
                        actaInfo.getNumeroCopia(),
                        actaInfo.getDigitoChequeoEscrutinio());
            }

        } else if (ConstantesComunes.CONTROL_CALIDAD_TIPO_DOCUMENTO_RESOLUCION.equals(request.getTipoDocumento())) {
            String numeroResolucion = obtenerNumeroResolucion(request.getIdDocumento());
            return "para observar la resolución " + numeroResolucion + " en el control de calidad.";

        } else {
            return "para observar en control de calidad.";
        }
    }

    private String construirCodigoActa(ActaInfoDTO actaInfo) {
        String codigoBase = actaInfo.getCodigoMesa();

        if (actaInfo.getNumeroCopia() != null && actaInfo.getDigitoChequeoEscrutinio() != null) {
            return String.format("%s-%s%s",
                    codigoBase,
                    actaInfo.getNumeroCopia(),
                    actaInfo.getDigitoChequeoEscrutinio());
        }

        return codigoBase;
    }

    private ActaInfoDTO obtenerInfoActa(Long idDocumento) {
        return actaRepository.findActaInfoDTOById(idDocumento)
                .orElseThrow(() -> new DocumentoNoEncontradoException(
                        "No se encontró el acta con ID: " + idDocumento));
    }

    private String obtenerNumeroResolucion(Long idDocumento) {
        return tabResolucionRepository.findResolucionByActaId(idDocumento)
                .map(TabResolucion::getNumeroResolucion)
                .orElseThrow(() -> new DocumentoNoEncontradoException(
                        "No se encontró resolución asociada al acta con ID: " + idDocumento));
    }

    private Map<String, String> getEstadosAprobacionMap(){
        List<DetCatalogoEstructuraDto> listEstadosAprobacion = this.detalleCatalogoEstructuraService
                .findByMaestroAndColumna(
                        ConstantesComunes.CATALOGO_MAE_ESTADO_APROBACION_AUTORIZACION,
                        ConstantesComunes.CATALOGO_DET_ESTADO_APROBACION);

        if (listEstadosAprobacion == null || listEstadosAprobacion.isEmpty()) {
            return Collections.emptyMap();
        }
        return listEstadosAprobacion.stream()
                .filter(e -> e.getCodigoS() != null && e.getNombre() != null)
                .collect(Collectors.toMap(
                        DetCatalogoEstructuraDto::getCodigoS,
                        DetCatalogoEstructuraDto::getNombre,
                        (existing, replacement) -> existing
                ));
    }

    private Map<String, String> getTiposAutorizacionMap(){
        List<DetCatalogoEstructuraDto> listTiposAutorizacion = this.detalleCatalogoEstructuraService
                .findByMaestroAndColumna(
                        ConstantesComunes.CATALOGO_MAE_TIPO_AUTORIZACION,
                        ConstantesComunes.CATALOGO_DET_TIPO_AUTORIZACION);

        if (listTiposAutorizacion == null || listTiposAutorizacion.isEmpty()) {
            return Collections.emptyMap();
        }

        return listTiposAutorizacion.stream()
                .filter(t -> t.getCodigoS() != null && t.getNombre() != null)
                .collect(Collectors.toMap(
                        DetCatalogoEstructuraDto::getCodigoS,
                        DetCatalogoEstructuraDto::getNombre,
                        (existing, replacement) -> existing
                ));
    }

    private Map<String, String> getTiposDocumentoMap(){
        List<DetCatalogoEstructuraDto> listTiposDocumento = this.detalleCatalogoEstructuraService
                .findByMaestroAndColumna(
                        ConstantesComunes.CATALOGO_MAE_TIPO_DOCUMENTO,
                        ConstantesComunes.CATALOGO_DET_TIPO_DOCUMENTO);

        if (listTiposDocumento == null || listTiposDocumento.isEmpty()) {
            return Collections.emptyMap();
        }

        return listTiposDocumento.stream()
                .filter(t -> t.getCodigoS() != null && t.getNombre() != null)
                .collect(Collectors.toMap(
                        DetCatalogoEstructuraDto::getCodigoS,
                        DetCatalogoEstructuraDto::getNombre,
                        (existing, replacement) -> existing
                ));
    }

    private String formatDate(Date date){
        if(date == null){
            return null;
        }
        SimpleDateFormat sdf= new SimpleDateFormat("dd/MM/yyyy HH:mm");
        return sdf.format(date);
    }

    private AutorizacionDto convertToDto(TabAutorizacion tabAutorizacion,
                                         Map<String, String> estadosMap,
                                         Map<String, String> tiposMap,
                                         Map<String, String> tiposdocumentoMap,
                                         Map<String, String> centrosComputoMap) {
        return AutorizacionDto.builder()
                .id(tabAutorizacion.getId())
                .numeroAutorizacion(tabAutorizacion.getNumeroAutorizacion())
                .estadoAprobacion(tabAutorizacion.getEstadoAprobacion())
                .autorizacion(tabAutorizacion.getAutorizacion())
                .tipoAutorizacion(tabAutorizacion.getTipoAutorizacion())
                .detalle(tabAutorizacion.getDetalle())
                .codigoCentroComputo(tabAutorizacion.getCodigoCentroComputo())
                .nombreCentroComputo(centrosComputoMap.getOrDefault(tabAutorizacion.getCodigoCentroComputo(), "Centro no encontrado"))
                .tipoDocumento(tabAutorizacion.getTipoDocumento())
                .idDocumento(tabAutorizacion.getIdDocumento())
                .usuarioCreacion(tabAutorizacion.getUsuarioCreacion())
                .fechaCreacion(formatDate(tabAutorizacion.getFechaCreacion()))
                .usuarioModificacion(tabAutorizacion.getUsuarioModificacion())
                .fechaModificacion(formatDate(tabAutorizacion.getFechaModificacion()))
                .descEstadoAprobacion(estadosMap.getOrDefault(tabAutorizacion.getEstadoAprobacion(), "Sin descripción"))
                .descTipoAutorizacion(tiposMap.getOrDefault(tabAutorizacion.getTipoAutorizacion(), "Sin descripción"))
                .descTipoDocumento(tiposdocumentoMap.getOrDefault(tabAutorizacion.getTipoDocumento(), "Sin descripción"))
                .build();
    }

    private Map<String, String> getCentrosComputoMap(List<TabAutorizacion> autorizaciones) {
        Set<String> codigosCentroComputo = autorizaciones.stream()
                .map(TabAutorizacion::getCodigoCentroComputo)
                .filter(codigo -> codigo != null && !codigo.isBlank())
                .collect(Collectors.toSet());

        if (codigosCentroComputo.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, String> centrosMap = new HashMap<>();
        if (codigosCentroComputo.contains(ConstantesComunes.NOMBRE_NACION_DISTRITO_ELECTORAL)) {
            centrosMap.put(ConstantesComunes.NOMBRE_NACION_DISTRITO_ELECTORAL, "");
        }

        Map<String, String> centrosFromDb = codigosCentroComputo.stream()
                .filter(codigo -> !ConstantesComunes.NOMBRE_NACION_DISTRITO_ELECTORAL.equals(codigo))
                .map(centroComputoRepository::findOneByCc)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toMap(
                        CentroComputo::getCodigo,
                        CentroComputo::getNombre,
                        (existing, replacement) -> existing
                ));

        centrosMap.putAll(centrosFromDb);

        return centrosMap;
    }



    // Excepción personalizada
    public class DocumentoNoEncontradoException extends RuntimeException {
        public DocumentoNoEncontradoException(String message) {
            super(message);
        }
    }

}
