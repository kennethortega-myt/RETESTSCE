package pe.gob.onpe.scescanner.common.dll;

public class SceOpt {
    
    private SceOpt(){
        
    }
    
    static {
        System.loadLibrary("jnitools");
    }

    
    @SuppressWarnings("java:S107") // Método nativo JNI - los parámetros deben coincidir con la firma C
    public static native String iniciarTwain (int hwndParent, String pathFileScan, String pathFileScanTmp, String nomScanner,   
                                    int typeImg, int sizePag, int multiPage, int scanBothPages, int resol,   
                                    int orienCbPg1, int leftCbPg1, int topCbPg1, int widthCbPg1, int heightCbPg1,   
                                    int orienCbPg2, int leftCbPg2, int topCbPg2, int widthCbPg2, int heightCbPg2,   
                                    int sizeCtrlImgW, int sizeCtrlImgH,   
                                    int generaFilePDF, int qfactorPdf);   
    
    @SuppressWarnings("java:S107") // Método nativo JNI - los parámetros deben coincidir con la firma C
    public static native String escanearActasConvencionales(int hwndParent, String pathFileScan, String pathFileScanTmp, String nomScanner,   
                                    int typeImg, int sizePag, int multiPage, int scanBothPages, int resol,   
                                    int orienCbPg1v, int leftCbPg1v, int topCbPg1v, int widthCbPg1v, int heightCbPg1v,   
                                    int orienCbPg1h, int leftCbPg1h, int topCbPg1h, int widthCbPg1h, int heightCbPg1h,   
                                    int orienCbPg2h, int leftCbPg2h, int topCbPg2h, int widthCbPg2h, int heightCbPg2h,   
                                    int rotatePg1, int rotatePg2, int correctPosOrder,   
                                    String nomProcCorto, String codCComputo,   
                                    int sizeCtrlImgW, int sizeCtrlImgH,   
                                    int generaFilePDF, int qfactorPdf);   
    
    @SuppressWarnings("java:S107") // Método nativo JNI - los parámetros deben coincidir con la firma C
    public static native String escanearResoluciones (int hwndParent, String pathFileScan, String pathFileScanTmp, String nomScanner,    
                                    int typeImg, int sizePag, int multiPage, int scanBothPages, int resol, int typeAddPageDoc, int pagDocAct,   
                                    int orienCbPg1, int leftCbPg1, int topCbPg1, int widthCbPg1, int heightCbPg1,   
                                    String nomFileResolucion, String codResolucion, String nomProcCorto, String codCComputo,   
                                    int sizeCtrlImgW, int sizeCtrlImgH);   
    
    @SuppressWarnings("java:S107") // Método nativo JNI - los parámetros deben coincidir con la firma C
    public static native String escanearListaElectores (int hwndParent, String pathFileScan, String pathFileScanTmp, String nomScanner,    
                                    int typeImg, int sizePag, int multiPage, int scanBothPages, int resol,   
                                    int orienCb1, int leftCb1, int topCb1, int widthCb1, int heightCb1,   
                                    int orienCb2, int leftCb2, int topCb2, int widthCb2, int heightCb2,   
                                    String nomProcCorto, String codCComputo,   
                                    int sizeCtrlImgW, int sizeCtrlImgH);   
    
    public static native int generaPdfDesdeImg (String pathImages, String pathPDFs, String images, String nomFilePdf,    
                                    int qFactorComp, int sizePages);   
    
    public static native int eliminarPaginaImagen (int hwndParent, String pathFileScan, String nomFileImage, int pagDoc);   
    
    public static native int rotarPaginaImagen (int hwndParent, String pathFileScan, String nomFileImage, int pagDoc, int angle);
    
}
