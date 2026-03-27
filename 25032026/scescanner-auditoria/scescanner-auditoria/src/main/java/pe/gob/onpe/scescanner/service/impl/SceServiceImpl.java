package pe.gob.onpe.scescanner.service.impl;

import pe.gob.onpe.scescanner.domain.ActaScanDto;
import pe.gob.onpe.scescanner.domain.DocumentoElectoral;
import pe.gob.onpe.scescanner.domain.Documentos;
import pe.gob.onpe.scescanner.domain.Eleccion;
import pe.gob.onpe.scescanner.domain.HttpResp;
import pe.gob.onpe.scescanner.domain.Login;
import pe.gob.onpe.scescanner.domain.ResolucionDigital;
import pe.gob.onpe.scescanner.domain.RespRegActas;
import pe.gob.onpe.scescanner.http.ISceHttp;
import pe.gob.onpe.scescanner.http.impl.SceHttpImpl;
import pe.gob.onpe.scescanner.service.ISceService;

import java.util.List;

public class SceServiceImpl implements ISceService{
    
    //@Autowired
    ISceHttp sceHttp = new SceHttpImpl();
    
    @Override
    public List<DocumentoElectoral> obtenerTiposDocumento(String bearerToken) {
        return sceHttp.obtenerTiposDocumento(bearerToken);
    }
    
    @Override
    public List<Documentos> obtenerDocumentos(String bearerToken){
        return sceHttp.obtenerDocumentos(bearerToken);
    }

    @Override
    public List<RespRegActas> registrarActas(String strListaActas, String strTipoDocumento) {
        return sceHttp.registrarActas(strListaActas, strTipoDocumento);
    }

    @Override
    public HttpResp uploadActasDigitalizadas(String fileNameImage, String strActaCopia, String abrevDocumento, String bearerToken) {
        return sceHttp.uploadActasDigitalizadas(fileNameImage, strActaCopia, abrevDocumento, bearerToken);
    }
    
    @Override
    public HttpResp uploadHojaAsistenciaMMyRelNoSort(String fileNameImage, String strActaCopia, String bearerToken){
        return sceHttp.uploadHojaAsistenciaMMyRelNoSort(fileNameImage, strActaCopia, bearerToken);
    }
    
    @Override
    public HttpResp uploadResolucion(long idDoc, String fileNameImage, String strNumeroResolucion, int numPaginas, String bearerToken) {
        return sceHttp.uploadResolucion(idDoc, fileNameImage, strNumeroResolucion, numPaginas, bearerToken);
    }
    
    @Override
    public HttpResp uploadOtrosDocumentos(long idDoc, String strTipoDoc, String fileNameImage, String strNumeroDocumento, int numPaginas, String bearerToken){
        return sceHttp.uploadOtrosDocumentos(idDoc, strTipoDoc, fileNameImage, strNumeroDocumento, numPaginas, bearerToken);
    }
    
    @Override
    public HttpResp uploadListaElect(String numMesa, String zipFileName, String bearerToken){
        return sceHttp.uploadListaElect(numMesa, zipFileName, bearerToken);
    }
    
    @Override
    public Login login(String username, String password){
        return sceHttp.login(username, password);
    }
    
    @Override
    public Login refreshToken(String refToken){
        return sceHttp.refreshToken(refToken);
    }
    
    @Override
    public HttpResp cerrarSesion(String username, String bearerToken){
        return sceHttp.cerrarSesion(username, bearerToken);
    }
    
    @Override
    public List<Eleccion> obtenerListaElecciones(String bearerToken){
        return sceHttp.obtenerListaElecciones(bearerToken);
    }
    
    @Override
    public List<ResolucionDigital> obtenerResolucionesDigitalizadas(String bearerToken){
        return sceHttp.obtenerResolucionesDigitalizadas(bearerToken);
    }
    
    @Override
    public List<ResolucionDigital> obtenerOtrosDocumentosDigitalizados(String bearerToken){
        return sceHttp.obtenerOtrosDocumentosDigitalizados(bearerToken);
    }
    
    @Override
    public HttpResp confirmarPuestaCero(String bearerToken){
        return sceHttp.confirmarPuestaCero(bearerToken);
    }

    @Override
    public String validarSesionActiva(String bearerToken) {
        return sceHttp.validarSesionActiva(bearerToken);
    }

    @Override
    public List<ActaScanDto> obtenerActasScaneadas(String bearerToken, String abrevDocumento ,String codigoEleccion, String estado) {
        return sceHttp.obtenerActasScaneadas(bearerToken, abrevDocumento ,codigoEleccion, estado);
    }   

    @Override
    public String obtenerClavePublica() {
        return sceHttp.obtenerClavePublica();
    }

    @Override
    public List<ResolucionDigital> obtenerLeDigitalizados(String bearerToken) {
        return sceHttp.obtenerLeDigitalizados(bearerToken);
    }

    @Override
    public List<ResolucionDigital> obtenerMmDigitalizados(String bearerToken) {
       return sceHttp.obtenerMmDigitalizados(bearerToken);
    }
}
