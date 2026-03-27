/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pe.gob.onpe.scescanner.domain;

/**
 *
 * @author LRestan
 */
public class ResolucionDigital {
    private long id;
    private long idArchivo;
    private String nombreArchivo;
    private String numeroResolucion;
    private long fechaRegistro;
    private int numeroPaginas;
    private String estadoDigitalizacion;
    private String estadoDocumento;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getIdArchivo() {
        return idArchivo;
    }

    public void setIdArchivo(long idArchivo) {
        this.idArchivo = idArchivo;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public String getNumeroResolucion() {
        return numeroResolucion;
    }

    public void setNumeroResolucion(String numeroResolucion) {
        this.numeroResolucion = numeroResolucion;
    }

    public long getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(long fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public int getNumeroPaginas() {
        return numeroPaginas;
    }

    public void setNumeroPaginas(int numeroPaginas) {
        this.numeroPaginas = numeroPaginas;
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

    @Override
    public String toString() {
        return "ResolucionDigital{" + "id=" + id + ", idArchivo=" + idArchivo + ", nombreArchivo=" + nombreArchivo + ", numeroResolucion=" + numeroResolucion + ", fechaRegistro=" + fechaRegistro + ", numeroPaginas=" + numeroPaginas + ", estadoDigitalizacion=" + estadoDigitalizacion + '}';
    }
    
}
