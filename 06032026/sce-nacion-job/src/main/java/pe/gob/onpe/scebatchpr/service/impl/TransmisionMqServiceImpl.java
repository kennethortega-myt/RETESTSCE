package pe.gob.onpe.scebatchpr.service.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeoutException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import pe.gob.onpe.scebatchpr.dto.ArchivoTransmisionDto;
import pe.gob.onpe.scebatchpr.dto.ArchivoTransmisionRequest;
import pe.gob.onpe.scebatchpr.dto.TramaSceDto;
import pe.gob.onpe.scebatchpr.dto.VwPrEleccionExportDto;
import pe.gob.onpe.scebatchpr.entities.orc.Acta;
import pe.gob.onpe.scebatchpr.entities.orc.TabPrTransmision;
import pe.gob.onpe.scebatchpr.entities.orc.VwPrActa;
import pe.gob.onpe.scebatchpr.entities.orc.VwPrEleccion;
import pe.gob.onpe.scebatchpr.entities.orc.VwPrMesa;
import pe.gob.onpe.scebatchpr.entities.orc.VwPrParticipacionCiudadana;
import pe.gob.onpe.scebatchpr.entities.orc.VwPrResumen;
import pe.gob.onpe.scebatchpr.mapper.IVwPrActaExportPrMapper;
import pe.gob.onpe.scebatchpr.mapper.IVwPrEleccionExportPrMapper;
import pe.gob.onpe.scebatchpr.mapper.IVwPrMesaExportPrMapper;
import pe.gob.onpe.scebatchpr.mapper.IVwPrParticipacionCiudadanaExportPrMapper;
import pe.gob.onpe.scebatchpr.mapper.IVwPrResumenExportPrMapper;
import pe.gob.onpe.scebatchpr.repository.orc.ActaRepository;
import pe.gob.onpe.scebatchpr.repository.orc.TabPrTransmisionRepository;
import pe.gob.onpe.scebatchpr.service.MqTransmisionService;
import pe.gob.onpe.scebatchpr.service.TransmisionMqService;
import pe.gob.onpe.scebatchpr.utils.ArchivoUtils;

@Service
public class TransmisionMqServiceImpl implements TransmisionMqService {

	Logger logger = LoggerFactory.getLogger(TransmisionMqServiceImpl.class);
	
	private final TabPrTransmisionRepository tabPrTransmisionRepository;

	private final IVwPrParticipacionCiudadanaExportPrMapper mapperCiudadano;
	
	private final IVwPrMesaExportPrMapper mapperMesa;
	
	private final IVwPrEleccionExportPrMapper mapperEleccion;

	private final IVwPrResumenExportPrMapper mapperResumen;
	
	private final IVwPrActaExportPrMapper mapperActa;
	
	private final ActaRepository actaRepository;

	private final MqTransmisionService produce;
	
	public TransmisionMqServiceImpl(
			TabPrTransmisionRepository tabPrTransmisionRepository,
			IVwPrParticipacionCiudadanaExportPrMapper mapperCiudadano,
			IVwPrMesaExportPrMapper mapperMesa,
			IVwPrEleccionExportPrMapper mapperEleccion,
			IVwPrResumenExportPrMapper mapperResumen,
			IVwPrActaExportPrMapper mapperActa,
			ActaRepository actaRepository,
			MqTransmisionService produce
			){
		this.tabPrTransmisionRepository = tabPrTransmisionRepository;
		this.mapperCiudadano = mapperCiudadano;
		this.mapperMesa = mapperMesa;
		this.mapperEleccion = mapperEleccion;
		this.mapperResumen = mapperResumen;
		this.mapperActa = mapperActa;
		this.actaRepository = actaRepository;
		this.produce = produce;
	}
	
	@Value("${file.imagenes.sce-job}")
    private String pathImagenesJob;
	
	@Value("${app.sce-batch-pr.enviar-firmados}")
	private boolean sendFirmados;
	
	@Override
	@Transactional
	public void enviarTramaSce(String proceso) throws IOException, TimeoutException {
	    logger.info("**************INICIO DE LA TRANSMISION********************************");

	    try {
	        List<TabPrTransmision> transmisiones = tabPrTransmisionRepository.listarPendientes();
	        logger.info("Total transmisiones: {}", transmisiones.size());

	        for (TabPrTransmision transmision : transmisiones) {
	            TramaSceDto trama = construirTrama(transmision);
	            procesarTransmisionPorVista(transmision, trama);
	            produce.productorData(List.of(trama));
	        }

	    } catch (InterruptedException e) {
	        logger.error("Exception: ", e);
	        Thread.currentThread().interrupt();
	    } finally {
	        logger.info("clear current tenantid");
	    }

	    logger.info("**************FIN DE LA TRANSMISION********************************");
	}

	private TramaSceDto construirTrama(TabPrTransmision transmision) {
	    TramaSceDto trama = new TramaSceDto();
	    trama.setIdTransferencia(transmision.getId());
	    trama.setIdActa(transmision.getIdActa());
	    trama.setVista(transmision.getNombreVista());
	    trama.setUsuario("system");
	    return trama;
	}

	@Override
	@Transactional
	public void enviarArchivos(String proceso) throws JsonProcessingException, InterruptedException {
		logger.info("********************INICIO DE LA TRANSMISION DE IMAGENES********************");
		
		try {
			
			List<Acta> actas = obtenerActasParaTransmitir();

	        if (actas == null || actas.isEmpty()) {
	            logger.info("No hay imagenes para transmitir");
	            return;
	        }
			 
			
	        for (Acta acta : actas) {
	            ArchivoTransmisionRequest request = construirRequestConArchivos(acta);

	            if (tieneArchivosParaEnviar(request)) {
	                produce.productorArchivos(request);
	            } else {
	                logger.info("No se generaron archivos para enviar para el acta={}", acta.getId());
	            }
	        }
			
		} catch(InterruptedException e) {
			logger.error("Exception: ",e);
			Thread.currentThread().interrupt(); // <- muy importante
		} finally {
			logger.info("********************FIN DE LA TRANSMISION DE IMAGENES**********************");
		}
	}
	
	private ArchivoTransmisionDto generArchivoEscrutinioFirmado(Acta acta){
		ArchivoTransmisionDto x = null;
		if(acta.getArchivoEscrutinioFirmado()!=null && acta.getArchivoEscrutinioFirmado().getEstadoTransmision().equals(0)) {
			try {
				x = ArchivoUtils.convertFileToBase64WithException(acta.getArchivoEscrutinioFirmado());
			} catch (Exception e) {
				logger.info("No se pudo generar el archivo de escrutinio firmado",e);
			}
		} else {
			logger.info("No hay archivo de escrutinio firmado para transmitir");
		}
		return x;
	}
	
	private ArchivoTransmisionDto generArchivoInstalacionFirmado(Acta acta){
		ArchivoTransmisionDto x = null;
		if(acta.getArchivoInstalacionFirmado()!=null && acta.getArchivoInstalacionFirmado().getEstadoTransmision().equals(0)) {
			try {
				x = ArchivoUtils.convertFileToBase64WithException(acta.getArchivoInstalacionFirmado());
			} catch (Exception e) {
				logger.info("No se pudo generar el archivo de instalacion firmado",e);
			}
		} else {
			logger.info("No hay archivo de instalacion firmado para transmitir");
		}
		return x;
	}
	
	private ArchivoTransmisionDto generArchivoSufragioFirmado(Acta acta){
		ArchivoTransmisionDto x = null;
		if(acta.getArchivoSufragioFirmado()!=null && acta.getArchivoSufragioFirmado().getEstadoTransmision().equals(0)) {
			try {
				x = ArchivoUtils.convertFileToBase64WithException(acta.getArchivoSufragioFirmado());
			} catch (Exception e) {
				logger.info("No se pudo generar el archivo de sufragio firmado",e);
			}
		} else {
			logger.info("No hay archivo de sufragio firmado para transmitir");
		}
		return x;
	}
	
	
	private ArchivoTransmisionDto generArchivoEscrutinio(Acta acta){
		ArchivoTransmisionDto x = null;
		if(acta.getArchivoEscrutinioPdf()!=null && acta.getArchivoEscrutinioPdf().getEstadoTransmision().equals(0)) {
			try {
				x = ArchivoUtils.convertFileToBase64WithException(acta.getArchivoEscrutinioPdf());
			} catch (Exception e) {
				logger.info("No se pudo generar el archivo de escrutinio",e);
			}
		} else {
			logger.info("No hay archivo de escrutinio para transmitir");
		}
		return x;
	}
	
	private ArchivoTransmisionDto generArchivoInstalacionSufragio(Acta acta){
		ArchivoTransmisionDto x = null;
		if(acta.getArchivoInstalacionSufragioPdf()!=null && acta.getArchivoInstalacionSufragioPdf().getEstadoTransmision().equals(0)) {
			try {
				x = ArchivoUtils.convertFileToBase64WithException(acta.getArchivoInstalacionSufragioPdf());
			} catch (Exception e) {
				logger.info("No se pudo generar el archivo de instalacion sufragio",e);
			}
		} else {
			logger.info("No hay archivo de instalacion sufragio para transmitir");
		}
		return x;
	}
	
	private List<ArchivoTransmisionDto> generarArchivosResolucion(Acta acta) {
	    if (acta.getDetResoluciones() == null) return Collections.emptyList();

	    return acta.getDetResoluciones().stream()
	        .filter(res -> res.getResolucion().getArchivoResolucion() != null)
	        .filter(res -> res.getResolucion().getArchivoResolucion().getEstadoTransmision().equals(0))
	        .map(res -> {
	            try {
	                return ArchivoUtils.convertFileToBase64WithException(
	                    res.getResolucion().getArchivoResolucion()
	                );
	            } catch (Exception e) {
	                logger.info("No se pudo generar el archivo de resolucion", e);
	                return null;
	            }
	        })
	        .filter(Objects::nonNull)
	        .toList();
	}
	
	private ArchivoTransmisionRequest construirRequestConArchivos(Acta acta) {
	    ArchivoTransmisionRequest.ArchivoTransmisionRequestBuilder builder = ArchivoTransmisionRequest.builder()
	        .idActa(acta.getId());
	    List<ArchivoTransmisionDto> archivos = new ArrayList<>();
	    if (sendFirmados) {
	    	addIfNotNull(archivos, generArchivoEscrutinioFirmado(acta));
	        addIfNotNull(archivos, generArchivoEscrutinio(acta));
	        addIfNotNull(archivos, generArchivoInstalacionSufragio(acta));
	        addIfNotNull(archivos, generArchivoInstalacionFirmado(acta));
	        addIfNotNull(archivos, generArchivoSufragioFirmado(acta));
	    } else {
	    	addIfNotNull(archivos, generArchivoEscrutinio(acta));
	        addIfNotNull(archivos, generArchivoInstalacionSufragio(acta));
	    }

	    List<ArchivoTransmisionDto> archivosResolucion = generarArchivosResolucion(acta);
	    archivos.addAll(archivosResolucion);
	    builder.archivos(archivos);
	    return builder.build();
	}
	
	// metodo auxiliar para evitar repetir el if
	private void addIfNotNull(List<ArchivoTransmisionDto> lista, ArchivoTransmisionDto archivo) {
	    if (archivo != null) {
	        lista.add(archivo);
	    }
	}
	
	private boolean tieneArchivosParaEnviar(ArchivoTransmisionRequest request) {
	    return request.getArchivos() != null
	        && !request.getArchivos().isEmpty();
	}
	
	private void procesarTransmisionPorVista(TabPrTransmision transmision, TramaSceDto trama) throws JsonProcessingException {
	    String vista = transmision.getNombreVista();
	    String tramaJson = transmision.getTrama();

	    switch (vista) {
	        case "vw_pr_eleccion_distrital", "vw_pr_parlamento_andino",
	             "vw_pr_diputados", "vw_pr_senadores_distrito_multiple", "vw_pr_senadores_distrito_unico",
	             "vw_pr_presidente_y_vicepresidentes", "vw_pr_revocatoria_distrital" -> {
	            List<VwPrEleccion> elecciones = new ObjectMapper().readValue(tramaJson, new TypeReference<>() {});
	            if (elecciones != null) {
	                List<VwPrEleccionExportDto> dto = elecciones.stream().map(mapperEleccion::toDto).toList();
	                asignarTramaEleccion(trama, vista, dto);
	            }
	        }
	        case "vw_pr_resumen" -> {
	            List<VwPrResumen> resumenes = new ObjectMapper().readValue(tramaJson, new TypeReference<>() {});
	            if (resumenes != null) {
	                trama.setTramaResumen(resumenes.stream().map(mapperResumen::toDto).toList());
	            }
	        }
	        case "vw_pr_participacion_ciudadana" -> {
	            List<VwPrParticipacionCiudadana> ciudadanos = new ObjectMapper().readValue(tramaJson, new TypeReference<>() {});
	            if (ciudadanos != null) {
	                trama.setTramaParticipacion(ciudadanos.stream().map(mapperCiudadano::toDto).toList());
	            }
	        }
	        case "vw_pr_acta" -> {
	            List<VwPrActa> actas = new ObjectMapper().readValue(tramaJson, new TypeReference<>() {});
	            if (actas != null) {
	                trama.setTramaActa(actas.stream().map(mapperActa::toDto).toList());
	            }
	        }
	        case "vw_pr_mesa" -> {
	            List<VwPrMesa> mesas = new ObjectMapper().readValue(tramaJson, new TypeReference<>() {});
	            if (mesas != null) {
	                trama.setTramaMesa(mesas.stream().map(mapperMesa::toDto).toList());
	            }
	        }
	        default -> logger.warn("Vista no reconocida: {}", vista);
	    }
	}

	private void asignarTramaEleccion(TramaSceDto trama, String vista, List<VwPrEleccionExportDto> dto) {
	    switch (vista) {
	        case "vw_pr_eleccion_distrital" -> trama.setTramaEleccion(dto);
	        case "vw_pr_parlamento_andino" -> trama.setTramaParlamento(dto);
	        case "vw_pr_diputados" -> trama.setTramaDiputados(dto);
	        case "vw_pr_senadores_distrito_multiple" -> trama.setTramaSenadoresDistritoElectoralMultiple(dto);
	        case "vw_pr_senadores_distrito_unico" -> trama.setTramaSenadoresDistritoNacionalUnico(dto);
	        case "vw_pr_presidente_y_vicepresidentes" -> trama.setTramaPresidenciales(dto);
	        case "vw_pr_revocatoria_distrital" -> trama.setTramaRevocatoriaDistrital(dto);
	        default -> throw new IllegalArgumentException("Vista no soportada");
	    }
	}
	
	private List<Acta> obtenerActasParaTransmitir() {
	    return sendFirmados
	        ? actaRepository.listarArchivosActasTransmitirFirmados()
	        : actaRepository.listarArchivosActasTransmitir();
	}

}
