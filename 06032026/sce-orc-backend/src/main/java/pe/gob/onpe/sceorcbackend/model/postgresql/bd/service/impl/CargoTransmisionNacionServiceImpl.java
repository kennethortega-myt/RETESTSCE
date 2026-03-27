package pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Acta;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Archivo;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.CabActaFormato;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.CargoTransmisionNacion;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.CentroComputo;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.DetActaFormato;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.Formato;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.transmisioncargo.json.CabActaFormatoDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.transmisioncargo.json.CargoPorTransmitirDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.transmisioncargo.json.DetActaFormatoDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.transmisioncargo.json.FormatoDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.entity.transmisioncargo.json.TransmisionCargoDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.ActaRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.ArchivoRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.CargoTransmisionNacionRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.repository.DetActaFormatoRepository;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.CargoTransmisionNacionService;
import pe.gob.onpe.sceorcbackend.model.postgresql.bd.service.CentroComputoService;
import pe.gob.onpe.sceorcbackend.model.postgresql.dto.transmisioncargo.ArchivoCargoTransmisionReqDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.dto.transmisioncargo.CargoTransmitidoDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.dto.transmisioncargo.TransmisionCargoReqDto;
import pe.gob.onpe.sceorcbackend.model.postgresql.mapper.transmision.ICargoTransmisionMapper;
import pe.gob.onpe.sceorcbackend.utils.ArchivoUtils;
import pe.gob.onpe.sceorcbackend.utils.ConstantesTransmision;
import pe.gob.onpe.sceorcbackend.utils.ConstantesComunes;
import pe.gob.onpe.sceorcbackend.utils.DateUtil;
import pe.gob.onpe.sceorcbackend.utils.PathUtils;
import pe.gob.onpe.sceorcbackend.utils.SceConstantes;

@Service
public class CargoTransmisionNacionServiceImpl implements CargoTransmisionNacionService {
	
	Logger logger = LoggerFactory.getLogger(CargoTransmisionNacionService.class);
	
	@Value("${file.upload-dir}")
    private String imagePath;

	private final CargoTransmisionNacionRepository cargoTransmisionNacionRepository;
	
	private final ActaRepository actaRepository;
	
	private final ArchivoRepository archivoRepository;
	
	private final DetActaFormatoRepository detActaFormatoRepository;
	
	private final CentroComputoService centroComputoService;
	
	private final ICargoTransmisionMapper mapper;
	
	public CargoTransmisionNacionServiceImpl(
			CargoTransmisionNacionRepository cargoTransmisionNacionRepository,
			ActaRepository actaRepository,
			DetActaFormatoRepository detActaFormatoRepository,
			ArchivoRepository archivoRepository,
			CentroComputoService centroComputoService,
			ICargoTransmisionMapper mapper
			){
		this.cargoTransmisionNacionRepository = cargoTransmisionNacionRepository;
		this.detActaFormatoRepository = detActaFormatoRepository;
		this.actaRepository = actaRepository;
		this.archivoRepository = archivoRepository;
		this.centroComputoService = centroComputoService;
		this.mapper = mapper;
	}
	
	@Override
	@Transactional
	public Long guardarTransmision(Long idActa, String usuario, String proceso) {
		CargoTransmisionNacion transmision = new CargoTransmisionNacion();
		transmision.setIdActa(idActa);
		transmision.setTransmite(ConstantesComunes.ACTIVO);
		transmision.setTipoTransmision(ConstantesTransmision.ACCION_CARGO);
		transmision.setEstadoTransmitidoNacion(ConstantesComunes.INACTIVO);
		transmision.setFechaRegistro(new Date());
		transmision.setAccion(ConstantesTransmision.ACCION_CARGO);
		transmision.setIntento(0);
		transmision.setFechaTransmision(new Date());
		transmision.setUsuarioTransmision(usuario);
        this.cargoTransmisionNacionRepository.save(transmision);
        TransmisionCargoDto request = buildRequestTransmision(transmision, idActa, proceso);
        transmision.setRequestCargoTransmision(request);
    	this.cargoTransmisionNacionRepository.save(transmision);
		return transmision.getId();
	}

	private TransmisionCargoDto buildRequestTransmision(CargoTransmisionNacion transmision, Long idActa,
			String proceso) {
		TransmisionCargoDto x = new TransmisionCargoDto();
		String codigoCc = this.getCodigoCentroComputoActual();
    	x.setAccion(transmision.getAccion());
    	x.setCargo(this.mapActa(idActa, codigoCc));
		return x;
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<Acta> findByIdActa(Long idActa) {
		return this.actaRepository.findById(idActa);
	}
	
	@Override
	@Transactional(readOnly = true)
	public Optional<CargoTransmisionNacion> findByIdTransmision(Long idTransmision){
		return this.cargoTransmisionNacionRepository.findById(idTransmision);
	}

	@Override
	@Transactional
	public void actualizarPreTransmision(List<CargoTransmisionNacion> lista, String usuario) {
		if (lista != null) {
			lista.forEach(
					transmision -> {
						Optional<CargoTransmisionNacion> cargoOp = this.cargoTransmisionNacionRepository.findById(transmision.getId());
						if(cargoOp.isPresent()){
							CargoTransmisionNacion cargo = cargoOp.get();
							cargo.setUsuarioTransmision(usuario);
							cargo.setFechaTransmision(DateUtil.getFechaActualPeruana());
							this.cargoTransmisionNacionRepository.save(cargo);
						}
					});
		}
	}

	@Override
	@Transactional(readOnly = true)
	public List<TransmisionCargoReqDto> adjuntar(List<TransmisionCargoReqDto> cargosTransmistidas) {
		return cargosTransmistidas.stream()
				.map(cargo -> {
					if(cargo.getCargo()!=null && cargo.getCargo().getDetallesActaFormato()!=null){
						cargo.getCargo().getDetallesActaFormato().forEach(det -> {
	                        if (det.getCabActaFormato() != null 
	                        		&& det.getCabActaFormato().getIdArchivo() != null) {
	                        	det.getCabActaFormato()
	                        		.setArchivo(getArchivoTransmisionReqDto(det.getCabActaFormato().getIdArchivo()));
	                        }
	                        if(det.getCabActaFormato() != null 
	                        		&& det.getCabActaFormato().getFormato() != null
	                        		&& det.getCabActaFormato().getFormato().getIdArchivo() != null){
	                        	det.getCabActaFormato()
	                        		.getFormato()
	                        		.setArchivo(getArchivoTransmisionReqDto(det.getCabActaFormato().getFormato().getIdArchivo()));
	                        }
	                    });
					}
					return cargo;
				 })
		        .collect(Collectors.toList());
	}

	@Override
	public List<TransmisionCargoReqDto> mapperRequest(List<CargoTransmisionNacion> cargosTransmistidas) {
		return cargosTransmistidas
				.stream()
				.map(t -> {
					return this.mapper.toDto(t.getRequestCargoTransmision());
				})
				.collect(Collectors.toList());
	}
	
	
	@Transactional(readOnly = true)
    protected CargoPorTransmitirDto mapActa(Long idActa, String codigoCc) {
		CargoPorTransmitirDto cargoPorTransmitirDto = null;
		Optional<Acta> acta = this.actaRepository.findById(idActa);
		if(acta.isPresent()){
			cargoPorTransmitirDto = new CargoPorTransmitirDto();
			cargoPorTransmitirDto.setDetallesActaFormato(mapDetallesActaFormato(idActa, codigoCc));
		}
		return cargoPorTransmitirDto;
	}
	
	@Transactional(readOnly = true)
    protected List<DetActaFormatoDto> mapDetallesActaFormato(Long idActa, String codigoCc){
		List<DetActaFormatoDto> detallesDto = null;
		List<DetActaFormato> detalles = detActaFormatoRepository.findByActa_Id(idActa);
		if(detalles!=null && !detalles.isEmpty()){
			detallesDto = new ArrayList<>();
			for(DetActaFormato detActa:detalles){
				detallesDto.add(
						DetActaFormatoDto
						.builder()
						.id(detActa.getId())
						.idCc(String.format("%s-%s", codigoCc,detActa.getId()))
						.idActa(idActa)
						.cabActaFormato(mapCabActaFormatoDto(detActa.getCabActaFormato(), codigoCc))
						.activo(detActa.getActivo())
                        .fechaCreacion(DateUtil.getDateString(detActa.getFechaCreacion(), SceConstantes.PATTERN_DD_MM_YYYY_HH_MM_SS_DASH))
                        .fechaModificacion(DateUtil.getDateString(detActa.getFechaModificacion(), SceConstantes.PATTERN_DD_MM_YYYY_HH_MM_SS_DASH))
                        .usuarioCreacion(detActa.getUsuarioCreacion())
                        .usuarioModificacion(detActa.getUsuarioModificacion())
						.build()
					);
			}
		}
		return detallesDto;
	}
	
	@Transactional(readOnly = true)
	protected CabActaFormatoDto mapCabActaFormatoDto(CabActaFormato cabActaFormato, String codigoCc){
		if(cabActaFormato==null){
			return null;
		}
		
		return CabActaFormatoDto
				.builder()
				.id(cabActaFormato.getId())
				.idCc(String.format("%s-%s", codigoCc,cabActaFormato.getId()))
				.correlativo(cabActaFormato.getCorrelativo())
				.idArchivo(cabActaFormato.getArchivoFormatoPdf()!=null ? cabActaFormato.getArchivoFormatoPdf().getId() : null)
				.formato(mapFormatoDto(cabActaFormato.getFormato(), codigoCc))
				.activo(cabActaFormato.getActivo())
                .fechaCreacion(DateUtil.getDateString(cabActaFormato.getFechaCreacion(), SceConstantes.PATTERN_DD_MM_YYYY_HH_MM_SS_DASH))
                .fechaModificacion(DateUtil.getDateString(cabActaFormato.getFechaModificacion(), SceConstantes.PATTERN_DD_MM_YYYY_HH_MM_SS_DASH))
                .usuarioCreacion(cabActaFormato.getUsuarioCreacion())
                .usuarioModificacion(cabActaFormato.getUsuarioModificacion())
				.build();
		
	}
	
	@Transactional(readOnly = true)
	protected FormatoDto mapFormatoDto(Formato formato, String codigoCc){
		if(formato==null){
			return null;
		}
		
		return FormatoDto
				.builder()
				.id(formato.getId())
				.idCc(String.format("%s-%s", codigoCc,formato.getId()))
				.idArchivo(formato.getArchivo()!=null ? formato.getArchivo().getId() : null)
				.activo(formato.getActivo())
				.correlativo(formato.getCorrelativo())
				.tipoFormato(formato.getTipoFormato())
                .fechaCreacion(DateUtil.getDateString(formato.getFechaCreacion(), SceConstantes.PATTERN_DD_MM_YYYY_HH_MM_SS_DASH))
                .fechaModificacion(DateUtil.getDateString(formato.getFechaModificacion(), SceConstantes.PATTERN_DD_MM_YYYY_HH_MM_SS_DASH))
                .usuarioCreacion(formato.getUsuarioCreacion())
                .usuarioModificacion(formato.getUsuarioModificacion())
				.build();
	}
	
	@Transactional(readOnly = true)
    protected ArchivoCargoTransmisionReqDto getArchivoTransmisionReqDto(Long id) {
		ArchivoCargoTransmisionReqDto dto = null;
		if(id!=null) {
			Optional<Archivo> archivo = this.archivoRepository.findById(id);
			if (archivo.isPresent()) {
				try {
					String base64 = convertToBase64(PathUtils.normalizePath(this.imagePath, archivo.get().getGuid()));
					dto = ArchivoCargoTransmisionReqDto
							.builder()
							.base64(base64)
							.mimeType(archivo.get().getFormato())
							.guid(archivo.get().getGuid())
							.extension(ArchivoUtils.getExtension(archivo.get().getFormato()))
							.build();
				} catch (Exception e) {
					logger.error("error", e);
					return null;
				}
			}
		}
		return dto;
	}

	@Transactional(readOnly = true)
	private String getCodigoCentroComputoActual(){
		Optional<CentroComputo> centroComputo = this.centroComputoService.getCentroComputoActual();
		return centroComputo.get().getCodigo();
	}
	
	private String convertToBase64(String filePath) throws IOException {
		File file = new File(filePath);
		if(file.exists()){
			try (FileInputStream fis = new FileInputStream(file); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
				byte[] buf = new byte[1024];
				int bytesRead;
				while ((bytesRead = fis.read(buf)) != -1) {
					bos.write(buf, 0, bytesRead);
				}
				byte[] fileBytes = bos.toByteArray();
				return Base64.getEncoder().encodeToString(fileBytes);
			}
		} else {
			throw new IOException("El archivo no existe");
		}
		
	}

	@Override
	public void actualizarPostTransmision(List<CargoTransmitidoDto> lista) {
		if (lista != null) {
			lista.forEach(
                    transmision -> {
                        Optional<CargoTransmisionNacion> cargoTransmisionOp = this.cargoTransmisionNacionRepository.findById(transmision.getIdTransmision());
                        if (cargoTransmisionOp.isPresent()) {
                        	CargoTransmisionNacion cargoTransmision = cargoTransmisionOp.get();
                            cargoTransmision.setEstadoTransmitidoNacion(transmision.getEstadoTransmitidoNacion());
                            cargoTransmision.setIntento((cargoTransmision.getIntento()==null ? 0:cargoTransmision.getIntento())+1);
                            this.cargoTransmisionNacionRepository.save(cargoTransmision);
                        }
                    });
		}
	}

	@Override
	public List<CargoTransmisionNacion> listarFaltantesTransmitir(Long idActa) {
		return this.cargoTransmisionNacionRepository.listarFaltantesTransmitir(
				ConstantesComunes.INACTIVO, 
        		ConstantesTransmision.ACCION_CARGO,
        		idActa);
	}
}
