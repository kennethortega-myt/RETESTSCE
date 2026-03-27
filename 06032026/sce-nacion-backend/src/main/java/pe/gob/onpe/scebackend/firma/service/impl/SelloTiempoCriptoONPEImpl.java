package pe.gob.onpe.scebackend.firma.service.impl;
import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pe.gob.onpe.scebackend.firma.service.SelloTiempoCriptoONPE;

@Slf4j
@Service
public class SelloTiempoCriptoONPEImpl implements SelloTiempoCriptoONPE{

    @Value("${carpeta.local}")
    private String carpetaLocal;
    
    @Value("${ruta.jre}")
    private String rutaJre;
    
    @Value("${ruta.sce.firma}")
    private String rutaSceFirma;    
    
    @Value("${operacion}")
    private String operacion;
    
    @Value("${tsl}")
    private String tsl;
    
    @Value("${tsa}")
    private String tsa;
    
    @Value("${userTsa}")
    private String userTsa;
    
    @Value("${pwTsa}")
    private String pwTsa;
    
    @Override
    public void procesoSelloTiempo(String rutaPdf) {
   
        String carpeta = carpetaLocal;
        List<String> comando = Arrays.asList(rutaJre,"-jar",rutaSceFirma,"-operacion",operacion,"-document",rutaPdf,"-tsl",tsl,"-tsa",tsa,"-userTsa",userTsa,"-pwTsa",pwTsa);
        
        ProcessBuilder pb = new ProcessBuilder().command(comando).directory(new File(carpeta));
        try {    
            log.info("Inicia proceso de sello de tiempo de {}", rutaPdf);
            Process p = pb.start();
            log.info("Finaliza proceso de sello de tiempo de {} {}", rutaPdf, p.exitValue());

        } catch (IOException ex) 
        {
            log.error("La sello de tiempo de {} ha fallado. {}",rutaPdf, ex.getMessage());
        }
    }
}
