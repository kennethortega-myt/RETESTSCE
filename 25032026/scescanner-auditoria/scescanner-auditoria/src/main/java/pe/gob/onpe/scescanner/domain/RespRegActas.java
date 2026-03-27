/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pe.gob.onpe.scescanner.domain;

/**
 *
 * @author LRestan
 */
public class RespRegActas {
    private String strActaCopia;
    private String strActa;
    private boolean estado;
    private String strMensaje;

    public String getStrActaCopia() {
        return strActaCopia;
    }

    public void setStrActaCopia(String strActaCopia) {
        this.strActaCopia = strActaCopia;
    }

    public String getStrActa() {
        return strActa;
    }
    
    public void setStrActa(String strActa) {
        this.strActa = strActa;
    }
    
    public boolean isEstado() {
        return estado;
    }
    
    public void setEstado(boolean estado) {
        this.estado = estado;
    }
    
    public String getStrMensaje() {
        return strMensaje;
    }
    
    public void setStrMensaje(String strMensaje) {
        this.strMensaje = strMensaje;
    }
    
}
