package pe.gob.onpe.scescanner.domain;

/**
 * Clase base que contiene los campos comunes relacionados con archivos de actas.
 */
public abstract class ActaArchivosBase {
    
    protected String archivoEscrutinio;
    protected String archivoInstalacion;
    protected String archivoSufragio;
    protected String archivoInstalacionSufragio;

    public String getArchivoEscrutinio() {
        return archivoEscrutinio;
    }

    public void setArchivoEscrutinio(String archivoEscrutinio) {
        this.archivoEscrutinio = archivoEscrutinio;
    }

    public String getArchivoInstalacion() {
        return archivoInstalacion;
    }

    public void setArchivoInstalacion(String archivoInstalacion) {
        this.archivoInstalacion = archivoInstalacion;
    }

    public String getArchivoSufragio() {
        return archivoSufragio;
    }

    public void setArchivoSufragio(String archivoSufragio) {
        this.archivoSufragio = archivoSufragio;
    }

    public String getArchivoInstalacionSufragio() {
        return archivoInstalacionSufragio;
    }

    public void setArchivoInstalacionSufragio(String archivoInstalacionSufragio) {
        this.archivoInstalacionSufragio = archivoInstalacionSufragio;
    }
}
