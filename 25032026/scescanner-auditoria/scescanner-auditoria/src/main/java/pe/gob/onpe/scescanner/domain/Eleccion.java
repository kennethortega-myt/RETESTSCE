package pe.gob.onpe.scescanner.domain;

/**
 *
 * @author lrestan
 */
public class Eleccion {
    
    String codigo;
    String nombre;
    int rangoInicial;
    int rangoFinal;
    String digCheqAE;
    String digCheqAIS;
    String digCheqError;

    public Eleccion() {
        //Constructor requerido por el framework para instanciación por reflexión
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public int getRangoInicial() {
        return rangoInicial;
    }

    public void setRangoInicial(int rangoInicial) {
        this.rangoInicial = rangoInicial;
    }

    public int getRangoFinal() {
        return rangoFinal;
    }

    public void setRangoFinal(int rangoFinal) {
        this.rangoFinal = rangoFinal;
    }

    public String getDigCheqAE() {
        return digCheqAE;
    }

    public void setDigCheqAE(String digCheqAE) {
        this.digCheqAE = digCheqAE;
    }

    public String getDigCheqAIS() {
        return digCheqAIS;
    }

    public void setDigCheqAIS(String digCheqAIS) {
        this.digCheqAIS = digCheqAIS;
    }

    public String getDigCheqError() {
        return digCheqError;
    }

    public void setDigCheqError(String digCheqError) {
        this.digCheqError = digCheqError;
    }
    
}
