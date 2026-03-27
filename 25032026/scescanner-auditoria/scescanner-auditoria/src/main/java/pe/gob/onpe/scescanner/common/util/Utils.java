/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pe.gob.onpe.scescanner.common.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.gob.onpe.scescanner.common.global.GlobalDigitalizacion;

import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;




public class Utils {
    
    private static final Logger logger = LoggerFactory.getLogger(Utils.class);
    
    private Utils(){
        
    }
    
    public static String formatoNumeroDocResol(String numResol){
        String numeroResolucion = numResol;
        
        numeroResolucion = numeroResolucion.trim();
        numeroResolucion = numeroResolucion.replaceAll("\\s+", " ");

        numeroResolucion = Pattern.compile("(\\s*-+\\s*)").matcher(numeroResolucion).replaceAll("-");
        numeroResolucion = Pattern.compile("(\\s*/+\\s*)").matcher(numeroResolucion).replaceAll("/");

        numeroResolucion = Pattern.compile("(\\s*-+\\s*)").matcher(numeroResolucion).replaceAll("-");
        numeroResolucion = Pattern.compile("(\\s*/+\\s*)").matcher(numeroResolucion).replaceAll("/");
        
        return numeroResolucion;
    }
    
    public static boolean isStrNumber(String str)
    {
        return str.matches("-?\\d+(\\.\\d+)?");                
    }
    
    public static char generarDigitoChequeoSimple(String numMesaPage) {
        int acumulado = 0;
        
        if (numMesaPage == null || numMesaPage.isEmpty()) {
            return 0;
        }

        for (int i = 0; i < numMesaPage.length(); i++) {
            char c = numMesaPage.charAt(i);
            if (c < '0' || c > '9') {
                return 0;
            }
            acumulado += ((c - '0') * (i + 1));
        }
            
        return (char) ('A' + (acumulado % 11));
    }
    
    public static boolean verificarDigitoChequeoSimple(String numMesaPage) {
        String nMesaPage = numMesaPage.substring(0, 8);
        char digM = numMesaPage.charAt(8);
        char digG = generarDigitoChequeoSimple(nMesaPage);
        return (digM==digG);
    }
            
    public static boolean validacionSimpleNombreImagen(String strNomFileImage)
    {
        //ejemplo de nombre "05402601A.TIF"
        
        if(strNomFileImage.trim().length()!=13)return false;
        
        if(!isStrNumber(strNomFileImage.substring(0, 8)))return false;
        
        if(isStrNumber(strNomFileImage.substring(8, 9)))return false;
        
        return strNomFileImage.substring(9, 13).equalsIgnoreCase(".TIF");
    }
    
    public static boolean validacionSimpleNombreImagenListaElect(String strNameImage){
        //"054026010150D.TIF"
        
        if(strNameImage.trim().length()!=17)return false;
        
        if(!isStrNumber(strNameImage.substring(0, 12)))return false;
        
        if(isStrNumber(strNameImage.substring(12, 13)))return false;
        
        return strNameImage.substring(13, 17).equalsIgnoreCase(".TIF");
    }
    
    public static int onActualizaNomFileImageActa(String strPathNomFile, String strTipoDoc, String numActa,
            StringBuilder sbNomFileActa, StringBuilder sbPathNomFile, StringBuilder sbNumActa, StringBuilder sbCodTipoElec)
    {
        String strTipoActa;
        
        strTipoActa = strTipoDoc;
        
        String strNomFileNew = strTipoActa+numActa+".TIF";
        
        String strNewPathNomFileR = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosImg(), strTipoDoc).toString();

        boolean bSuccess = FileControl.validateDir(strNewPathNomFileR, true);
        if(bSuccess){
            strNewPathNomFileR = Paths.get(strNewPathNomFileR, strNomFileNew).toString();

            bSuccess = FileControl.fileCopyNIO(strPathNomFile,strNewPathNomFileR);
            if(bSuccess){
                bSuccess = FileControl.validateFile(strNewPathNomFileR);
            }
        }
        if(!bSuccess)return -39;
        
        
        FileControl.deleteChildren(strPathNomFile);
        
        sbNomFileActa.append(strNomFileNew);
        sbPathNomFile.append(strNewPathNomFileR);
        sbNumActa.append(numActa);
        sbCodTipoElec.append("");
        
        return 1;
    }
    
    public static boolean tiempoPorVencer(Date fechaExp, long minAntesExp, long secAntesExp){
        
        Date ahora = new Date();
        
        long expiracion = fechaExp.getTime();
        
        expiracion -= TimeUnit.MINUTES.toMillis(minAntesExp);
        expiracion -= TimeUnit.SECONDS.toMillis(secAntesExp);
                                
        return ahora.getTime()>=expiracion;
    }

    public static Date obtenerHoraExpiracion(long minutosActivo){ //el numero de minutos en que la sesion va a estar activa
        
        Date now = new Date();
        
        long timeExp = TimeUnit.MINUTES.toMillis(minutosActivo);
        
        return new Date(now.getTime() + timeExp);
    }
    
    
    public static String hashSHA256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();

        } catch (NoSuchAlgorithmException e) {
            logger.error("Error generando hash SHA-256", e);
            return null;
        }
    }
}



