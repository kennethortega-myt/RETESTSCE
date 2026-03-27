package pe.gob.onpe.scebackend.model.service;

import org.springframework.web.multipart.MultipartFile;

import pe.gob.onpe.scebackend.model.orc.entities.JneTransmisionRecepcion;

public interface JneRecepcionService {
    public void procesarRecepcion(MultipartFile pdf, String json, String codigoEnvio);

    public boolean enviarRecepcionOrc(JneTransmisionRecepcion registro);
}
