package pe.gob.onpe.scescanner.common.constant;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ConstantDigitalizacion {
    
    private ConstantDigitalizacion(){
    }
    
    private static String uuidSesion = "";

    public static String getUuidSesion() {
        return uuidSesion;
    }

    public static void setUuidSesion(String uuidSesion) {
        ConstantDigitalizacion.uuidSesion = uuidSesion;
    }
    
    public static final Integer N_ESTADO_LE_INCOMPLETO = 0;
    public static final Integer N_ESTADO_LE_COMPLETO = 1;
    public static final Integer N_ESTADO_LE_ENVIADO = 2;
    public static final Integer N_ESTADO_LE_ERROR_HTTP = 3;

    public static final Long SOLUCION_TECNOLOGICA_CONVENCIONAL = 3L;
    public static final Long SOLUCION_TECNOLOGICA_STAE = 2L;
    public static final Long SOLUCION_TECNOLOGICA_VOTO_DIGITAL = 4L;

    
    
    public static final String EXTENSION_TIF = ".TIF";
    public static final String PREF_IM_TIF_NO_RECONOCIDOS = "IM";


    public static final String ESTADO_ACTA_MESA_NO_INSTALADA = "N";
    public static final String ESTADO_ACTA_EXTRAVIADA = "O";
    public static final String ESTADO_ACTA_SINIESTRADA = "S";
    public static final String ESTADO_COMPUTO_ACTA_CONTABILIZADA = "S";
    
    
    public static final String ESTADO_DIGTAL_PENDIENTE_DIGITALIZACION = "P";
    public static final String ESTADO_DIGTAL_PARCIAL= "Q";
    public static final String ESTADO_DIGTAL_DIGITALIZADA = "D";
    public static final String ESTADO_DIGTAL_REVISADA_1ER_CC_VISOR_ABIERTO = "K";
    public static final String ESTADO_DIGTAL_1ER_CONTROL_ACEPTADA = "C";
    public static final String ESTADO_DIGTAL_1ER_CONTROL_RECHAZADA = "O";
    public static final String ESTADO_DIGTAL_1ERA_DIGITACION_RECHAZADA = "X";
    public static final String ESTADO_DIGTAL_2DO_CONTROL_ACEPTADA = "B";
    public static final String ESTADO_DIGTAL_NO_INSTALADA = "Z";

    public static final String ESTADO_DIGTAL_RESOL_RECHAZADO_2DO_CC = "H";
    public static final String ESTADO_DIGTAL_RESOL_APROBADA = "A";
    
    public static final String ESTADO_DIGTAL_DENUN_RECHAZADO = "R";

    public static final String MESA_POR_INFORMAR = "A";
    public static final String MESA_INSTALADA = "B";
    public static final String MESA_NO_INSTALADA = "C";
    public static final String MESA_REPROCESAR = "R";
    public static final String MESA_IS_EDIT = "E";


    public static final String C_ESTADO_DIGTAL_MESA_PENDIENTE = "P";
    public static final String C_ESTADO_DIGTAL_MESA_DIGITALIZADA = "D";
    public static final String C_ESTADO_DIGTAL_MESA_DIGITALIZADA_PARCIALMENTE = "Q";
    public static final String C_ESTADO_DIGTAL_MESA_APROBADA_COMPLETA = "C";
    public static final String C_ESTADO_DIGTAL_MESA_DIGITALIZADA_CON_PERDIDA_PARCIAL = "V";
    public static final String C_ESTADO_DIGTAL_MESA_APROBADA_CON_PERDIDA_PARCIAL = "S";
    public static final String C_ESTADO_DIGTAL_MESA_PERDIDA_TOTAL = "L";
    public static final String C_ESTADO_DIGTAL_MESA_RECHAZADA = "O";
    public static final String C_ESTADO_DIGTAL_MESA_PROCESADO = "B";

    
    
    public static final String PREF_ACTA_INST_SUFRAGIO = "AIS";
    public static final String PREF_ACTA_ESCRUTINIO = "AE";
    public static final String PREF_ACTA_INST_SUFRAGIO_CELESTE = "AISC";
    public static final String PREF_ACTA_ESCRUTINIO_CELESTE = "AEC";
    public static final String PREF_ACTA_STAE = "AES";
    
    public static final String ABREV_ACTA_CONVENCIONAL = "AC";
    public static final String ABREV_ACTA_CELESTE = "ASC";
    public static final String ABREV_ACTA_EXTRANJERO = "AEXT";
    public static final String ABREV_ACTA_VOTO_DIGITAL = "VD";
    public static final String ABREV_RESOLUCIONES = "RES";
    public static final String ABREV_DENUNCIAS = "DE";
    public static final String ABREV_LISTA_ELECTORES = "LE";
    public static final String ABREV_HOJA_ASISTENCIA = "HA";
    
  
    
    public static final String VARENV_PATH_PROGRAMDATA = "PROGRAMDATA";
    
    //**********************************************
    
    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String TOKEN_PREFIX_BEARER = "Bearer ";
    
    public static final String HEADER_CONTENT_TYPE = "Content-Type";
    public static final String HEADER_ID_SESION = "IdSession";
    public static final String APPLICATION_JSON = "application/json";

    public static final String DENY_OPCONFIG = "SI";
    
    public static final String ACCEP_SIN_CONEXION = "SI";
    public static final String DENY_SIN_CONEXION = "NO";
    
    public static final String ITEM_TEXT_SELECCIONAR = "Seleccionar";
    
    public static final String ITEM_TEXT_TODOS = "TODOS";
    
    
    public static final String MSG_FILE_NOTFOUND = "No se encuentra el archivo ";
    
    //**********************************************
    
    public static final String NOMBRE_SISTEMA="SCE";
    
    public static final String VERSION_SCE_SCANNER="3.7.0"; //"1.0.0+build.301"
    
    //**********************************************

    //Tamaño y tipos de Hoja
    public static final int DIGTAL_SZA4 = 1;
    public static final int DIGTAL_SZA3 = 4;
    
    public static final int DIGTAL_SZA4TABLOID = 5; //solo usado para la conversion de TIFF A PDF
    public static final int DIGTAL_SZAUTO = 0;
    
    //Tipos de Imagen
    public static final int DIGTAL_IMCOLOR = 1;
    
    //Orientacion de Lectura del codigo de barras
    public static final int DIGTAL_CB_LR = 1;
    public static final int DIGTAL_CB_BT = 2;
    public static final int DIGTAL_CB_TB = 3;
    public static final int DIGTAL_CB_RL = 4;
    
    
    public static final int DIGTAL_DOC_PGADD_LAST = 1;	//Agrega paginas al final del documento existente
    public static final int DIGTAL_DOC_PGINS_HERE = 2;	//Inserta paginas a partir de la posicion actual del documento existente
  public static final int DIGTAL_DOC_PGNEW_FILE = 5; //crea un nuevo documento y agrega paginas en el orden en que se encuentran
    
    public static final int DIGITAL_CB_LE_CUT_LEFT_A = 10; 
    public static final int DIGITAL_CB_LE_CUT_TOP_A = 1305;
    public static final int DIGITAL_CB_LE_CUT_WIDTH_A = 230;
    public static final int DIGITAL_CB_LE_CUT_HEIGTH_A = 860;
    
    public static final int DIGITAL_CB_LE_CUT_LEFT_B = 2192; 
    public static final int DIGITAL_CB_LE_CUT_TOP_B = 1305; 
    public static final int DIGITAL_CB_LE_CUT_WIDTH_B = 230;
    public static final int DIGITAL_CB_LE_CUT_HEIGTH_B = 860;
    
    public static final int MINUTOS_ANTES_VENCER = 30; //minutos antes de vencer la sesion para revalidar token
    
    
    
    
    public static final int MINUTOS_ACTIVO = 60; //minutos en que la sesion admin va a estar activa
    public static final int MINUTOS_ADICIONALES = 30; //minutos en que la sesion admin va a estar activa
    
    public static final int MINUTOS_VERIFICACION = 1; //intervalo de tiempo en minutos en que se verifica si la sesion esta activa
    
    
    public static final int SEGUNDOS_INACTIVIDAD = 1800;

    public static final List<String> USER_PROFILES_PERMITIDOS = Collections.unmodifiableList(Arrays.asList("PER_DIGI", "ADM_CC"));
    
    public static final String ADM_REF = "835d6dc88b708bc646d6db82c853ef4182fabbd4a8de59c213f2b5ab3ae7d9be";
    
    public static final String KADM_REF = "1e2c1346cd9ec62e52b6fb947de64227ed35ea882fdbfa910e1837c30cc90fd6";
    
}
