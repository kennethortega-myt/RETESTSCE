package pe.gob.onpe.scebackend.firma.service;

import pe.gob.onpe.scebackend.model.dto.transmision.ArchivoTransmisionDto;
import pe.gob.onpe.scebackend.model.orc.entities.Archivo;

public interface ServicioSelloTiempo {
    
    public Archivo procesarArchivo(ArchivoTransmisionDto archivoDto, String path);
}
