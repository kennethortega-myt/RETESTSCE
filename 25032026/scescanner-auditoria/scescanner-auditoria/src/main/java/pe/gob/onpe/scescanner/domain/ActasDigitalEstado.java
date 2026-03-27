package pe.gob.onpe.scescanner.domain;

import pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion;

/**
 *
 * @author LRestan
 */
public class ActasDigitalEstado extends ActaArchivosBase {

    private String strActa;
    private String strCopia;
    private String strCopiaDig;
    private String strUbigeo;
    private String strActaCopia;
    private String strNomFile;
    private String fullPathImagenes;
    private String nombreEleccion;
    private String strTipoActa;
    private String strEstadoDigtal;
    private String strFechaDigital;
    private String strHoraDigital;
    private String strMessageError;
    private int nCodMensajeError;
    private int nIdxActaPar;
    private int nIdxActaPar2;
    private int nEstadoActa;
    private String estadoDigitalizacion;
    private String estadoDocumento;
    private long id;
    private Integer nEstadoDigital;
    private int actaInstalacion; //1 SI, 0 NO
    private int actaSufragio; //1 SI, 0 NO
    private int actaEscrutinio; //1 SI, 0 NO
    private Long solucionTecnologica;
    private Integer tipoTransmision;
    
    // Constructor sin argumentos
    public ActasDigitalEstado() {
    }

    
    // Constructor personalizado para mantener compatibilidad con código existente
    public ActasDigitalEstado(String strActaCopia, String strNomFile, int nCodMensajeError, int nEstadoActa) {
        this.strActaCopia = strActaCopia;
        this.strNomFile = strNomFile;
        this.nCodMensajeError = nCodMensajeError;
        this.nEstadoActa = nEstadoActa;
        if(strActaCopia!=null){
            if(strActaCopia.length()>=6){
                this.strActa = strActaCopia.substring(0, 6);
            }
            if(strActaCopia.length()>=8){
                this.strCopia = strActaCopia.substring(6, 8);
            }
            if(strActaCopia.length()>=9){
                this.strCopiaDig = strActaCopia.substring(6, 9);
            }
        }
    }
    
    public ActasDigitalEstado(String strActaCopia, String strNomFile, int nCodMensajeError, int nEstadoActa, String strEstadoDigtal) {
        this.strActaCopia = strActaCopia;
        this.strNomFile = strNomFile;
        this.nCodMensajeError = nCodMensajeError;
        this.nEstadoActa = nEstadoActa;
        this.strEstadoDigtal = strEstadoDigtal;
        if(strActaCopia!=null){
            if(strActaCopia.length()>=6){
                this.strActa = strActaCopia.substring(0, 6);
            }
            if(strActaCopia.length()>=8){
                this.strCopia = strActaCopia.substring(6, 8);
            }
            if(strActaCopia.length()>=9){
                this.strCopiaDig = strActaCopia.substring(6, 9);
            }
        }
    }
    
    public ActasDigitalEstado(String strActaCopia, String strNomFile, int nCodMensajeError, String strMessageError) {
        this.strActaCopia = strActaCopia;
        this.strNomFile = strNomFile;
        this.nCodMensajeError = nCodMensajeError;
        this.strMessageError = strMessageError;
        if(strActaCopia!=null){
            if(strActaCopia.length()>=6){
                this.strActa = strActaCopia.substring(0, 6);
            }
            if(strActaCopia.length()>=8){
                this.strCopia = strActaCopia.substring(6, 8);
            }
            if(strActaCopia.length()>=9){
                this.strCopiaDig = strActaCopia.substring(6, 9);
            }
        }
    }

    // Getters y Setters
    public String getStrActa() {
        return strActa;
    }

    public void setStrActa(String strActa) {
        this.strActa = strActa;
    }

    public String getStrCopia() {
        return strCopia;
    }

    public void setStrCopia(String strCopia) {
        this.strCopia = strCopia;
    }

    public String getStrCopiaDig() {
        return strCopiaDig;
    }

    public void setStrCopiaDig(String strCopiaDig) {
        this.strCopiaDig = strCopiaDig;
    }

    public String getStrUbigeo() {
        return strUbigeo;
    }

    public void setStrUbigeo(String strUbigeo) {
        this.strUbigeo = strUbigeo;
    }

    public String getStrActaCopia() {
        return strActaCopia;
    }

    public void setStrActaCopia(String strActaCopia) {
        this.strActaCopia = strActaCopia;
    }

    public String getStrNomFile() {
        return strNomFile;
    }

    public void setStrNomFile(String strNomFile) {
        this.strNomFile = strNomFile;
    }

    public String getFullPathImagenes() {
        return fullPathImagenes;
    }

    public void setFullPathImagenes(String fullPathImagenes) {
        this.fullPathImagenes = fullPathImagenes;
    }

    public String getNombreEleccion() {
        return nombreEleccion;
    }

    public void setNombreEleccion(String nombreEleccion) {
        this.nombreEleccion = nombreEleccion;
    }

    public String getStrTipoActa() {
        return strTipoActa;
    }

    public void setStrTipoActa(String strTipoActa) {
        this.strTipoActa = strTipoActa;
    }

    public String getStrEstadoDigtal() {
        return strEstadoDigtal;
    }

    public void setStrEstadoDigtal(String strEstadoDigtal) {
        this.strEstadoDigtal = strEstadoDigtal;
    }

    public String getStrFechaDigital() {
        return strFechaDigital;
    }

    public void setStrFechaDigital(String strFechaDigital) {
        this.strFechaDigital = strFechaDigital;
    }

    public String getStrHoraDigital() {
        return strHoraDigital;
    }

    public void setStrHoraDigital(String strHoraDigital) {
        this.strHoraDigital = strHoraDigital;
    }

    public String getStrMessageError() {
        return strMessageError;
    }

    public void setStrMessageError(String strMessageError) {
        this.strMessageError = strMessageError;
    }

    public int getnCodMensajeError() {
        return nCodMensajeError;
    }

    public void setnCodMensajeError(int nCodMensajeError) {
        this.nCodMensajeError = nCodMensajeError;
    }

    public int getnIdxActaPar() {
        return nIdxActaPar;
    }

    public void setnIdxActaPar(int nIdxActaPar) {
        this.nIdxActaPar = nIdxActaPar;
    }

    public int getnIdxActaPar2() {
        return nIdxActaPar2;
    }

    public void setnIdxActaPar2(int nIdxActaPar2) {
        this.nIdxActaPar2 = nIdxActaPar2;
    }

    public int getnEstadoActa() {
        return nEstadoActa;
    }

    public void setnEstadoActa(int nEstadoActa) {
        this.nEstadoActa = nEstadoActa;
    }

    public String getEstadoDigitalizacion() {
        return estadoDigitalizacion;
    }

    public void setEstadoDigitalizacion(String estadoDigitalizacion) {
        this.estadoDigitalizacion = estadoDigitalizacion;
    }

    public String getEstadoDocumento() {
        return estadoDocumento;
    }

    public void setEstadoDocumento(String estadoDocumento) {
        this.estadoDocumento = estadoDocumento;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Integer getNEstadoDigital() {
        return nEstadoDigital;
    }

    public void setNEstadoDigital(Integer nEstadoDigital) {
        this.nEstadoDigital = nEstadoDigital;
    }

    public int getActaInstalacion() {
        return actaInstalacion;
    }

    public void setActaInstalacion(int actaInstalacion) {
        this.actaInstalacion = actaInstalacion;
    }

    public int getActaSufragio() {
        return actaSufragio;
    }

    public void setActaSufragio(int actaSufragio) {
        this.actaSufragio = actaSufragio;
    }

    public int getActaEscrutinio() {
        return actaEscrutinio;
    }

    public void setActaEscrutinio(int actaEscrutinio) {
        this.actaEscrutinio = actaEscrutinio;
    }

    public Long getSolucionTecnologica() {
        return solucionTecnologica;
    }

    public void setSolucionTecnologica(Long solucionTecnologica) {
        this.solucionTecnologica = solucionTecnologica;
    }

    public Integer getTipoTransmision() {
        return tipoTransmision;
    }

    public void setTipoTransmision(Integer tipoTransmision) {
        this.tipoTransmision = tipoTransmision;
    }
    
    /**
     * Retorna la prioridad del estado para ordenamiento en la tabla.
     * Prioridad: Negro(1) < Rojo(2) < Plomo(3) < Celeste(4) < Verde(5)
     * @return prioridad del estado
     */
    public int getPrioridadEstado() {
        // Para Lista de Electores y Hoja de Asistencia
        if (strTipoActa != null && 
            (strTipoActa.equals(ConstantDigitalizacion.ABREV_LISTA_ELECTORES) || 
             strTipoActa.equals(ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA))) {
            return getPrioridadEstadoLeHa();
        }
        
        // Para otros documentos (Actas, Resoluciones, etc.)
        return getPrioridadEstadoDigitalizacion();
    }
    
    private int getPrioridadEstadoLeHa() {
        // Negro - No instalada
        if (estadoDocumento != null && estadoDocumento.equals(ConstantDigitalizacion.ESTADO_DIGTAL_NO_INSTALADA)) {
            return 1;
        }
        
        // Rojo - Rechazada
        if (estadoDigitalizacion != null && estadoDigitalizacion.equals(ConstantDigitalizacion.C_ESTADO_DIGTAL_MESA_RECHAZADA)) {
            return 2;
        }
        
        // Plomo - Pendiente
        if (estadoDigitalizacion != null && 
            (estadoDigitalizacion.equals(ConstantDigitalizacion.C_ESTADO_DIGTAL_MESA_PENDIENTE) || 
             estadoDigitalizacion.equals(ConstantDigitalizacion.C_ESTADO_DIGTAL_MESA_DIGITALIZADA_PARCIALMENTE))) {
            return 3;
        }
        
        // Celeste - Digitalizada
        if (estadoDigitalizacion != null && estadoDigitalizacion.equals(ConstantDigitalizacion.C_ESTADO_DIGTAL_MESA_DIGITALIZADA)) {
            return 4;
        }
        
        // Verde - Aceptada (C, B, V, S, L)
        return 5;
    }
    
    private int getPrioridadEstadoDigitalizacion() {
        if (estadoDigitalizacion == null) {
            return 5; // Por defecto verde
        }
        
        // Negro - No instalada
        if (estadoDigitalizacion.equals(ConstantDigitalizacion.ESTADO_DIGTAL_NO_INSTALADA)) {
            return 1;
        }
        
        // Rojo - Rechazada
        if (estadoDigitalizacion.equals(ConstantDigitalizacion.ESTADO_DIGTAL_1ER_CONTROL_RECHAZADA) ||
            estadoDigitalizacion.equals(ConstantDigitalizacion.ESTADO_DIGTAL_1ERA_DIGITACION_RECHAZADA) ||
            estadoDigitalizacion.equals(ConstantDigitalizacion.ESTADO_DIGTAL_RESOL_RECHAZADO_2DO_CC) ||
            estadoDigitalizacion.equals(ConstantDigitalizacion.ESTADO_DIGTAL_DENUN_RECHAZADO)) {
            return 2;
        }
        
        // Plomo - Pendiente
        if (estadoDigitalizacion.equals(ConstantDigitalizacion.ESTADO_DIGTAL_PENDIENTE_DIGITALIZACION) ||
            estadoDigitalizacion.equals(ConstantDigitalizacion.ESTADO_DIGTAL_PARCIAL)) {
            return 3;
        }
        
        // Celeste - Digitalizada
        if (estadoDigitalizacion.equals(ConstantDigitalizacion.ESTADO_DIGTAL_DIGITALIZADA)) {
            return 4;
        }
        
        // Verde - Aceptada (K, C, B, A, etc.)
        return 5;
    }
}
