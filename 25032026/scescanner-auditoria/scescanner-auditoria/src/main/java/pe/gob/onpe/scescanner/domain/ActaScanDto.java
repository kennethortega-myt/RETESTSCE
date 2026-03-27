/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pe.gob.onpe.scescanner.domain;

/**
 *
 * @author NCoqchi
 */

public class ActaScanDto extends ActaArchivosBase {
    private Long idActa;
    private String nombreEleccion;
    private String codigoEleccion;
    private String mesa;
    private String copia;
    private String digitoChequeoEscrutinio;
    private String estadoActa;
    private String estadoComputo;
    private String estadoDigitalizacion;
    private Integer activo;
    private Long solucionTecnologica;
    private Integer tipoTransmision;
    private Long fechaModificacion;

    @Override
    public String toString() {
        return "ActaScanDto{" + "idActa=" + idActa + ", nombreEleccion=" + nombreEleccion + ", codigoEleccion=" + codigoEleccion + ", mesa=" + mesa + ", copia=" + copia + ", digitoChequeoEscrutinio=" + digitoChequeoEscrutinio + ", estadoActa=" + estadoActa + ", estadoComputo=" + estadoComputo + ", estadoDigitalizacion=" + estadoDigitalizacion + ", archivoEscrutinio=" + archivoEscrutinio + ", archivoInstalacion=" + archivoInstalacion + ", archivoSufragio=" + archivoSufragio + ", archivoInstalacionSufragio=" + archivoInstalacionSufragio + ", activo=" + activo + ", solucionTecnologica=" + solucionTecnologica + ", tipoTransmision=" + tipoTransmision + ", fechaModificacion=" + fechaModificacion + '}';
    }
    
    

    public Long getFechaModificacion() {
        return fechaModificacion;
    }

    public void setFechaModificacion(Long fechaModificacion) {
        this.fechaModificacion = fechaModificacion;
    }
   

    public ActaScanDto() {
        super();
    }

    public String getNombreEleccion() {
        return nombreEleccion;
    }

    public void setNombreEleccion(String nombreEleccion) {
        this.nombreEleccion = nombreEleccion;
    }

    public String getCodigoEleccion() {
        return codigoEleccion;
    }

    public void setCodigoEleccion(String codigoEleccion) {
        this.codigoEleccion = codigoEleccion;
    }
    
    

    public Long getIdActa() {
        return idActa;
    }

    public void setIdActa(Long idActa) {
        this.idActa = idActa;
    }

    public String getMesa() {
        return mesa;
    }

    public void setMesa(String mesa) {
        this.mesa = mesa;
    }

    public String getCopia() {
        return copia;
    }

    public void setCopia(String copia) {
        this.copia = copia;
    }

    public String getDigitoChequeoEscrutinio() {
        return digitoChequeoEscrutinio;
    }

    public void setDigitoChequeoEscrutinio(String digitoChequeoEscrutinio) {
        this.digitoChequeoEscrutinio = digitoChequeoEscrutinio;
    }

    public String getEstadoActa() {
        return estadoActa;
    }

    public void setEstadoActa(String estadoActa) {
        this.estadoActa = estadoActa;
    }

    public String getEstadoComputo() {
        return estadoComputo;
    }

    public void setEstadoComputo(String estadoComputo) {
        this.estadoComputo = estadoComputo;
    }

    public String getEstadoDigitalizacion() {
        return estadoDigitalizacion;
    }

    public void setEstadoDigitalizacion(String estadoDigitalizacion) {
        this.estadoDigitalizacion = estadoDigitalizacion;
    }

    public Integer getActivo() {
        return activo;
    }

    public void setActivo(Integer activo) {
        this.activo = activo;
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
}
