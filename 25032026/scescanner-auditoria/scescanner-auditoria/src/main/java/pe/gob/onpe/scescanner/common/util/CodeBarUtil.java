package pe.gob.onpe.scescanner.common.util;

import pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CodeBarUtil {
    private Integer orientacion;
    private Integer x;
    private Integer y;
    private Integer ancho;
    private Integer alto;

    // Constructor vacío
    public CodeBarUtil() {}

    // Constructor con parámetros
    public CodeBarUtil(Integer orientacion, Integer x, Integer y, Integer ancho, Integer alto) {
        this.orientacion = orientacion;
        this.x = x;
        this.y = y;
        this.ancho = ancho;
        this.alto = alto;
    }

    // Getters y Setters
    public Integer getOrientacion() {
        return orientacion;
    }

    public void setOrientacion(Integer orientacion) {
        this.orientacion = orientacion;
    }

    public Integer getX() {
        return x;
    }

    public void setX(Integer x) {
        this.x = x;
    }

    public Integer getY() {
        return y;
    }

    public void setY(Integer y) {
        this.y = y;
    }

    public Integer getAncho() {
        return ancho;
    }

    public void setAncho(Integer ancho) {
        this.ancho = ancho;
    }

    public Integer getAlto() {
        return alto;
    }

    public void setAlto(Integer alto) {
        this.alto = alto;
    }

    public static List<CodeBarUtil> obtenerCodigosBarras() {
        List<CodeBarUtil> codigos = new ArrayList<>();

        // AE A4 - Vertical
        codigos.add(new CodeBarUtil(1, 1515, 30, 800, 260));

        // AE A3 - Vertical
        codigos.add(new CodeBarUtil(1, 1900, 30, 950, 260));

        // AIS A3/A4 - Horizontal
        codigos.add(new CodeBarUtil(2, 40, 340, 300, 1050));

        return codigos;
    }
    
    
    public static List<CodeBarUtil> obtenerCodigosBarras(String abrevDocumento) {
        
        if(abrevDocumento.equals(ConstantDigitalizacion.ABREV_ACTA_CELESTE)|| 
                abrevDocumento.equals(ConstantDigitalizacion.ABREV_ACTA_CONVENCIONAL)){
            List<CodeBarUtil> codigos = new ArrayList<>();
            
            // AE A3 - Vertical
            codigos.add(new CodeBarUtil(1, 1900, 30, 950, 280)); 
            
             // AIS A3/A4 - Horizontal
            codigos.add(new CodeBarUtil(2, 40, 340, 300, 1120));
            
            // AE A4 - Vertical
            codigos.add(new CodeBarUtil(1, 1515, 30, 800, 260));
           
            return codigos;
        } else if(abrevDocumento.equals(ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA)){
            List<CodeBarUtil> codigos = new ArrayList<>();

            // Hoja en A3
            codigos.add(new CodeBarUtil(1, 1900, 30, 950, 260));
            
            //Hoja en A4
            codigos.add(new CodeBarUtil(1, 1420, 30, 958, 220));
            return codigos;
            
            
        } else if(abrevDocumento.equals(ConstantDigitalizacion.ABREV_LISTA_ELECTORES)){
            List<CodeBarUtil> codigos = new ArrayList<>();

            codigos.add(new CodeBarUtil(
                    ConstantDigitalizacion.DIGTAL_CB_TB, 
                    ConstantDigitalizacion.DIGITAL_CB_LE_CUT_LEFT_A, 
                    ConstantDigitalizacion.DIGITAL_CB_LE_CUT_TOP_A, 
                    ConstantDigitalizacion.DIGITAL_CB_LE_CUT_WIDTH_A, 
                    ConstantDigitalizacion.DIGITAL_CB_LE_CUT_HEIGTH_A));
            codigos.add(new CodeBarUtil(ConstantDigitalizacion.DIGTAL_CB_BT, 
                    ConstantDigitalizacion.DIGITAL_CB_LE_CUT_LEFT_B, 
                    ConstantDigitalizacion.DIGITAL_CB_LE_CUT_TOP_B, 
                    ConstantDigitalizacion.DIGITAL_CB_LE_CUT_WIDTH_B, 
                    ConstantDigitalizacion.DIGITAL_CB_LE_CUT_HEIGTH_B));

            return codigos;
        } else {
            return Collections.emptyList();
        }
        
        
    }
}
