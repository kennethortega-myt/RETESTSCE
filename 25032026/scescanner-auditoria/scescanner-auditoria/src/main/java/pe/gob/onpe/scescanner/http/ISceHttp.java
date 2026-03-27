package pe.gob.onpe.scescanner.http;

import pe.gob.onpe.scescanner.domain.ActaScanDto;
import pe.gob.onpe.scescanner.domain.DocumentoElectoral;
import pe.gob.onpe.scescanner.domain.Documentos;
import pe.gob.onpe.scescanner.domain.Eleccion;
import pe.gob.onpe.scescanner.domain.HttpResp;
import pe.gob.onpe.scescanner.domain.Login;
import pe.gob.onpe.scescanner.domain.ResolucionDigital;
import pe.gob.onpe.scescanner.domain.RespRegActas;

import java.util.List;

public interface ISceHttp {
    
    List<DocumentoElectoral> obtenerTiposDocumento(String bearerToken);
    
    List<Documentos> obtenerDocumentos(String bearerToken);
    
    List<RespRegActas> registrarActas(String strListaActas, String strTipoDocumento);
    
    HttpResp uploadActasDigitalizadas(String fileNameImage, String strActaCopia, String abrevDocumento, String bearerToken);
    
    HttpResp uploadHojaAsistenciaMMyRelNoSort(String fileNameImage, String strActaCopia, String bearerToken);
    
    HttpResp uploadResolucion(long idDoc, String fileNameImage, String strNumeroResolucion, int numPaginas, String bearerToken);
    
    HttpResp uploadOtrosDocumentos(long idDoc, String strTipoDoc, String fileNameImage, String strNumeroDocumento, int numPaginas, String bearerToken);
    
    HttpResp uploadListaElect(String numMesa, String zipFileName, String bearerToken);
    
    Login login(String username, String password);

    String obtenerClavePublica();

    Login refreshToken(String refToken);
    
    HttpResp cerrarSesion(String username, String bearerToken);
    
    String validarSesionActiva(String bearerToken);
    
    List<Eleccion> obtenerListaElecciones(String bearerToken);
    
    List<ResolucionDigital> obtenerResolucionesDigitalizadas(String bearerToken);
    
    List<ResolucionDigital> obtenerOtrosDocumentosDigitalizados(String bearerToken);
    
    List<ResolucionDigital> obtenerLeDigitalizados(String bearerToken);
    
    List<ResolucionDigital> obtenerMmDigitalizados(String bearerToken);
    
    List<ActaScanDto> obtenerActasScaneadas(String bearerToken, String abrevDocumento ,String codigoEleccion, String estado);
    
    HttpResp confirmarPuestaCero(String bearerToken);
    
}