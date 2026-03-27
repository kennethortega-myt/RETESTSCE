package pe.gob.onpe.scebatchpr.service;

import java.util.List;

import pe.gob.onpe.scebatchpr.entities.orc.TabPrTransmision;

public interface TabPrTransmisionService {

	public List<TabPrTransmision> listarPendientes();
	int actualizarEstado(Long idTransferencia, Integer newState, String mensaje);
	int actualizarCorrelativo(Long idTransferencia, String correlativo);
	int actualizarEnviadoPorCorrelativo(String correlativo, Integer newState);
	
}
