package pe.gob.onpe.scescanner.domain;

import java.util.List;

/**
 *
 * @author LRestan
 */
public class Documentos {
    private String nombreDocumento;
    private List<DocumentoElectoral> tipoDocumento;
    private int visible;

    public String getNombreDocumento() {
        return nombreDocumento;
    }

    public void setNombreDocumento(String nombreDocumento) {
        this.nombreDocumento = nombreDocumento;
    }

    public List<DocumentoElectoral> getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(List<DocumentoElectoral> tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public int getVisible() {
        return visible;
    }

    public void setVisible(int visible) {
        this.visible = visible;
    }
    
}

