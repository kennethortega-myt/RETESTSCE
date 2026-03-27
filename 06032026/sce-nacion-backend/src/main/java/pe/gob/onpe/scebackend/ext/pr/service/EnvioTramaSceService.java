package pe.gob.onpe.scebackend.ext.pr.service;

import java.util.List;


import pe.gob.onpe.scebackend.ext.pr.dto.RegistroTramaParam;

public interface EnvioTramaSceService {

	void generarRegistrosTransmisionPr(List<RegistroTramaParam> params);
	void generarRegistrosTransmisionJne(List<RegistroTramaParam> params);
	
	
}
