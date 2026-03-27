/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pe.gob.onpe.scescanner.domain;

import pe.gob.onpe.scescanner.common.util.FileControl;

import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author lrestan
 */
public class ScanDoc {
    
    private String mesa;
    private int totPaginas;
    private int estado; //0: incompleto, 1: completo, 2: enviado, 3: error http
    private String mensaje;
    private List<Pagina> paginas;

    public ScanDoc(String mesa, int totPaginas, int estado) {
        this.mesa = mesa;
        this.totPaginas = totPaginas;
        this.estado = estado;
        
        this.paginas = new ArrayList<>();
        for(int i=0; i<this.totPaginas; i++){
            this.paginas.add(new Pagina(i+1, null, null));
        }
    }

    public String getMesa() {
        return mesa;
    }

    public void setMesa(String mesa) {
        this.mesa = mesa;
    }

    public int getTotPaginas() {
        return totPaginas;
    }

    public void setTotPaginas(int totPaginas) {
        this.totPaginas = totPaginas;
    }

    public int getEstado() {
        return estado;
    }

    public void setEstado(int estado) {
        this.estado = estado;
    }
    
    public List<Pagina> getPaginas() {
        return paginas;
    }
    
    public void setPaginas(List<Pagina> paginas) {
        this.paginas = paginas;
    }
    
    public String getMensaje() {
        return mensaje;
    }
    
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }





    // Método refactorizado
    public void actualizarEstadoCompleto(String basePath, int estadoEnviado, int estadoIncompleto, int estadoCompleto) {
        boolean isPaginasCompletas = validarPaginasCompletas(basePath, estadoEnviado);

        if (isPaginasCompletas) {
            if (this.estado == estadoIncompleto) {
                this.estado = estadoCompleto;
            }
        } else {
            this.estado = estadoIncompleto;
        }
    }

    private boolean validarPaginasCompletas(String basePath, int estadoEnviado) {
        for (Pagina pagina : this.paginas) {
            if (pagina.getArchivo() == null) {
                return false;
            }

            if (this.estado != estadoEnviado) {
                String strPathNomFile = Paths.get(basePath, pagina.getArchivo()).toString();
                if (!FileControl.validateFile(strPathNomFile)) {
                    pagina.setArchivo(null);
                    return false;
                }
            }
        }
        return true;
    }


    @Override
    public String toString() {
        return "\nScanDoc{" +
                "mesa='" + mesa + '\'' +
                ", totPaginas=" + totPaginas +
                ", estado=" + estado +
                ", mensaje='" + mensaje + '\'' +
                ", paginas=" + paginas +
                '}';
    }

    public class Pagina{
        private int nPagina;
        private String archivo;
        private String descDocCorto;

        public Pagina(int nPagina, String archivo, String descDocCorto) {
            this.nPagina = nPagina;
            this.archivo = archivo;
            this.descDocCorto = descDocCorto;
        }

        public int getnPagina() {
            return nPagina;
        }

        public void setnPagina(int nPagina) {
            this.nPagina = nPagina;
        }
        
        public String getArchivo() {
            return archivo;
        }

        public void setArchivo(String archivo) {
            this.archivo = archivo;
        }
        
        public String getDescDocCorto() {
            return descDocCorto;
        }
        
        public void setDescDocCorto(String descDocCorto) {
            this.descDocCorto = descDocCorto;
        }

        @Override
        public String toString() {
            return "\nPagina{" +
                    "nPagina=" + nPagina +
                    ", archivo='" + archivo + '\'' +
                    ", descDocCorto='" + descDocCorto + '\'' +
                    '}';
        }
    }
    
}
