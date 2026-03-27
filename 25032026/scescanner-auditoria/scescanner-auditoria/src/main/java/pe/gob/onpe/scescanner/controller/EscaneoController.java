package pe.gob.onpe.scescanner.controller;

import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.concurrent.Task;
import javafx.concurrent.Worker;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.fxml.JavaFXBuilderFactory;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.AnchorPane;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion;
import pe.gob.onpe.scescanner.common.constant.ConstantMensajes;
import pe.gob.onpe.scescanner.common.global.GlobalDigitalizacion;
import pe.gob.onpe.scescanner.common.util.CodeBarUtil;
import pe.gob.onpe.scescanner.common.util.FileControl;
import pe.gob.onpe.scescanner.common.util.ListHttpStatusCode;
import pe.gob.onpe.scescanner.common.util.ListaMensajes;
import pe.gob.onpe.scescanner.common.util.Messages;
import pe.gob.onpe.scescanner.common.util.TaskExecutor;
import pe.gob.onpe.scescanner.common.util.Utils;
import pe.gob.onpe.scescanner.common.view.AppController;
import pe.gob.onpe.scescanner.domain.ActasDigitalEstado;
import pe.gob.onpe.scescanner.domain.DocumentoElectoral;
import pe.gob.onpe.scescanner.domain.Eleccion;
import pe.gob.onpe.scescanner.domain.HttpResp;
import pe.gob.onpe.scescanner.domain.ListaElectores;
import pe.gob.onpe.scescanner.domain.Login;
import pe.gob.onpe.scescanner.domain.ScanDoc;
import pe.gob.onpe.scescanner.service.ISceService;
import pe.gob.onpe.scescanner.service.impl.SceServiceImpl;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URL;
import java.nio.file.CopyOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.ResourceBundle;
import java.util.Set;
import java.util.StringTokenizer;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static pe.gob.onpe.scescanner.common.dll.SceOpt.escanearActasConvencionales;
import static pe.gob.onpe.scescanner.common.dll.SceOpt.escanearListaElectores;
import static pe.gob.onpe.scescanner.common.dll.SceOpt.escanearResoluciones;
import static pe.gob.onpe.scescanner.common.dll.SceOpt.generaPdfDesdeImg;
import static pe.gob.onpe.scescanner.common.dll.SceOpt.iniciarTwain;
import static pe.gob.onpe.scescanner.common.util.Utils.obtenerHoraExpiracion;
import static pe.gob.onpe.scescanner.common.util.Utils.validacionSimpleNombreImagen;
import static pe.gob.onpe.scescanner.common.util.Utils.validacionSimpleNombreImagenListaElect;
import static pe.gob.onpe.scescanner.common.util.Utils.verificarDigitoChequeoSimple;
import static pe.gob.onpe.scescanner.common.view.AppController.loadFXML;

public class EscaneoController implements Initializable {

    ISceService sceService;

    private IMainController mainClassStage;

    @FXML
    private AnchorPane anchorPaneEscaneo;

    @FXML
    private Label lblSaludo1;

    private Scene scene;

    private Stage mainStage;

    @FXML
    private Button btnEscanearDocs;

    @FXML
    Button btnVerDocsEscaneados;

    private static final Logger logger = LoggerFactory.getLogger(EscaneoController.class);

    private static final String TEXT_ERROR_LIB = "Error:";
    private static final String TEXT_ERROR1 = "Error ";
    private static final String TEXT_ERROR2 = "Error: |Error en conexión|";
    private static final String MSG_ERROR_SCAN1 = "Error al ejecutar escaneo";
    private static final String TEXT_MESA1 = "Mesa: ";
    private static final String MSG_ERROR_FILEPDF = "No se pudo generar archivo PDF";

    boolean bEscaneando;

    private String strNameScanner;
    private String strValRetFromLib;

    private List<ActasDigitalEstado> listActasDigitalBarNoRec;
    private List<ActasDigitalEstado> listActasDigitalNoSave;
    private List<ActasDigitalEstado> listActasDigtalRec;

    private List<Eleccion> listElecciones;

    private List<ListaElectores> listaElectores;
    private List<ScanDoc> scanDocElect;

    private Stage stageMsgBox;

    Login dataLogin;

    private void actualizaRutasArchivos() {

        FileControl.validateDir(GlobalDigitalizacion.getRutaScanPrincipal() + File.separator + GlobalDigitalizacion.getRutaArchivosImg(), true);
        FileControl.validateDir(GlobalDigitalizacion.getRutaScanPrincipal() + File.separator + GlobalDigitalizacion.getRutaArchivosPdf(), true);
        FileControl.validateDir(GlobalDigitalizacion.getRutaScanPrincipal() + File.separator + GlobalDigitalizacion.getRutaArchivosNorec(), true);
        FileControl.validateDir(GlobalDigitalizacion.getFullRutaArchivosAppData(), true);
        FileControl.validateDir(GlobalDigitalizacion.getRutaArchivosTemp(), true);
    }

    @Override
    public void initialize(URL url, ResourceBundle rb) {

        //Nombre del escaner
        strNameScanner = GlobalDigitalizacion.getNombreTwainEscaner();

        listActasDigitalBarNoRec = new ArrayList<>();
        listActasDigitalNoSave = new ArrayList<>();
        listActasDigtalRec = new ArrayList<>();
        listaElectores = new ArrayList<>();
        scanDocElect = new ArrayList<>();

        listElecciones = new ArrayList<>();
    }

    public void init() {
        this.scene = this.mainStage.getScene();
        this.sceService = new SceServiceImpl();
    }

    public void setEventVerEscaneados(EventHandler<ActionEvent> verEscaneados) {
        this.btnVerDocsEscaneados.setOnAction(verEscaneados);
    }

    public Parent getView() {
        return anchorPaneEscaneo;
    }

    public void setDataLogin(Login dataLogin) {
        this.dataLogin = dataLogin;

        this.lblSaludo1.setText("Bienvenido " + dataLogin.getUserName() + " al SCE");
    }

    private void desabilitarBotones(boolean bDisable) {
        btnEscanearDocs.setDisable(bDisable);
        btnVerDocsEscaneados.setDisable(bDisable);
    }

    private void onEliminarImagenEscaneadaEnAppData(String strNomFile) {

        Path path = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), strNomFile);

        try {
            boolean deleted = java.nio.file.Files.deleteIfExists(path);
            if (!deleted) {
                path.toFile().deleteOnExit();
            }
        } catch (IOException e) {
            logger.warn("No se pudo eliminar el archivo", e);
            path.toFile().deleteOnExit(); // fallback
        }

    }

    private int copyFromAppDataToScanPrincipal(String strNomFile, String abrevDocumento) {
        //"054026 01 B .TIF"
        String strPathNomFile = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), strNomFile).toString();

        boolean bSuccess;

        String strNewPathNomFileR = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosImg(), abrevDocumento).toString();

        bSuccess = FileControl.validateDir(strNewPathNomFileR, true);
        if (bSuccess) {
            strNewPathNomFileR = Paths.get(strNewPathNomFileR, strNomFile).toString();

            bSuccess = FileControl.fileCopyNIO(strPathNomFile, strNewPathNomFileR);
            if (bSuccess) {
                bSuccess = FileControl.validateFile(strNewPathNomFileR);
            }
        }
        if (!bSuccess) {
            return -139;
        }

        FileControl.deleteChildren(strPathNomFile);

        return 1;
    }

    private int onActualizaNomFileResolucion(String strNomFile, String strNomFilePdf, String strTipoDoc)
    {
        String strPathNomFile = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), strNomFile).toString();
        String strPathNomFilePdf = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), strNomFilePdf).toString();

        String strNewPathNomFileR = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosImg(), strTipoDoc).toString();
        String strNewPathNomFileP = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosPdf(), strTipoDoc).toString();

        if (!validarYCopiarResolucionArchivos(strPathNomFile, strPathNomFilePdf, strNomFile, strNomFilePdf, strNewPathNomFileR, strNewPathNomFileP)) {
            return -137;
        }

        FileControl.deleteChildren(strPathNomFile);
        FileControl.deleteChildren(strPathNomFilePdf);

        return 1;
    }
    
    private boolean validarYCopiarResolucionArchivos(String strPathNomFile, String strPathNomFilePdf, 
                                                      String strNomFile, String strNomFilePdf,
                                                      String strNewPathNomFileR, String strNewPathNomFileP) {
        if (!FileControl.validateDir(strNewPathNomFileR, true)) {
            return false;
        }
        if (!FileControl.validateDir(strNewPathNomFileP, true)) {
            return false;
        }
        
        String strNewPathNomFileImg = Paths.get(strNewPathNomFileR, strNomFile).toString();
        String strNewPathNomFilePdf = Paths.get(strNewPathNomFileP, strNomFilePdf).toString();

        if (!FileControl.fileCopyNIO(strPathNomFile, strNewPathNomFileImg)) {
            return false;
        }
        if (!FileControl.validateFile(strNewPathNomFileImg)) {
            return false;
        }
        
        if (!FileControl.fileCopyNIO(strPathNomFilePdf, strNewPathNomFilePdf)) {
            return false;
        }
        return FileControl.validateFile(strNewPathNomFilePdf);
    }


    private boolean onRenombrarFile(String strPathFiles, String strFileName, String strFileNameNew) {
        String strPathFileName = Paths.get(strPathFiles, strFileName).toString();
        String strPathFileNameNew = Paths.get(strPathFiles, strFileNameNew).toString();

        if (FileControl.validateFile(strPathFileNameNew)) {
            FileControl.deleteChildren(strPathFileNameNew);
        }

        if (!FileControl.validateFile(strPathFileName)) {
            return false;
        }

        return FileControl.fileMoveNIO(strPathFileName, strPathFileNameNew);
    }

    private boolean actaNoValidaEnElecciones(String strFileNameActa) {
        String numActa = strFileNameActa.substring(0, 9);
        int rangoActa = Integer.parseInt(numActa.substring(6, 8));
        String digCheq = numActa.substring(8, 9);

        for (Eleccion eleccion : listElecciones) {
            if (rangoActa >= eleccion.getRangoInicial() && rangoActa <= eleccion.getRangoFinal()) {
                if (!eleccion.getDigCheqAIS().isEmpty() && digCheq.equals(eleccion.getDigCheqAIS())) {
                    return false; // Acta válida
                }

                if (!eleccion.getDigCheqAE().isEmpty() && eleccion.getDigCheqAE().contains(digCheq)) {
                    return false; // Acta válida
                }
            }
        }

        return true; // Acta no válida
    }

    private int onEscaneoActasConvencionalesFinalizado(String resultadosEscaneo, String abrevDocumento) 
    {
        if (resultadosEscaneo == null || resultadosEscaneo.isEmpty()) {
            return -15;
        }
        
        if (resultadosEscaneo.startsWith(TEXT_ERROR_LIB)) {
            return 0;
        }
        
        limpiarActasListasActasConvencionales();
        procesarActasConvencionalesEscaneadas(resultadosEscaneo, abrevDocumento);
        
        listActasDigitalNoSave = eliminarDuplicados(listActasDigitalNoSave);
        return 1;
    }
    
    private void limpiarActasListasActasConvencionales() {
        if (!listActasDigtalRec.isEmpty()) {
            listActasDigtalRec.clear();
        }
        if (!listActasDigitalBarNoRec.isEmpty()) {
            listActasDigitalBarNoRec.clear();
        }
        if (!listActasDigitalNoSave.isEmpty()) {
            listActasDigitalNoSave.clear();
        }
    }
    
    private void procesarActasConvencionalesEscaneadas(String resultadosEscaneo, String abrevDocumento) {
        StringTokenizer tokenizer = new StringTokenizer(resultadosEscaneo, ",");
        
        while (tokenizer.hasMoreElements()) {
            String resultadoTifEscaneo = tokenizer.nextElement().toString();
            procesarActasConvencionalesUnActa(resultadoTifEscaneo, abrevDocumento);
        }
    }
    
    private void procesarActasConvencionalesUnActa(String resultadoTifEscaneo, String abrevDocumento) {
        if (resultadoTifEscaneo.startsWith(ConstantDigitalizacion.PREF_IM_TIF_NO_RECONOCIDOS)) {
            String strPathFileName = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), resultadoTifEscaneo).toString();
            listActasDigitalBarNoRec.add(new ActasDigitalEstado(null, strPathFileName, -12, 0));
            return;
        }
        
        if (!validacionSimpleNombreImagen(resultadoTifEscaneo)) {
            String strPathFileName = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), resultadoTifEscaneo).toString();
            listActasDigitalBarNoRec.add(new ActasDigitalEstado(null, strPathFileName, -12, 0));
            return;
        }
        
        if (actaNoValidaEnElecciones(resultadoTifEscaneo)) {
            String message = "Acta " + resultadoTifEscaneo.substring(0, 9) + "\r\nEl rango de copia del acta o el dígito de chequeo, no pertenecen a este proceso electoral.";
            String strPathFileName = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), resultadoTifEscaneo).toString();
            listActasDigitalNoSave.add(new ActasDigitalEstado(resultadoTifEscaneo.substring(0, 9), strPathFileName, -144, message));
            return;
        }
        
        procesarActasConvencionalesUploadYCopia(resultadoTifEscaneo, abrevDocumento);
    }
    
    private void procesarActasConvencionalesUploadYCopia(String resultadoTifEscaneo, String abrevDocumento) {
        String strPathNomFile = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), resultadoTifEscaneo).toString();
        HttpResp httpResp = sceService.uploadActasDigitalizadas(strPathNomFile, resultadoTifEscaneo.substring(0, 9), abrevDocumento, this.dataLogin.getToken());
        
        if (!httpResp.isSuccess()) {
            manejarActasConvencionalesErrorUpload(httpResp, resultadoTifEscaneo);
            return;
        }
        
        int nResult = copyFromAppDataToScanPrincipal(resultadoTifEscaneo, abrevDocumento);
        if (nResult == 1) {
            String strPathFileName = Paths.get(GlobalDigitalizacion.getRutaArchivosImg(), abrevDocumento, resultadoTifEscaneo).toString();
            listActasDigtalRec.add(new ActasDigitalEstado(resultadoTifEscaneo.substring(0, 9), strPathFileName, 0, 1, ConstantDigitalizacion.ESTADO_DIGTAL_DIGITALIZADA));
        } else {
            String strPathFileName = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), resultadoTifEscaneo).toString();
            listActasDigitalNoSave.add(new ActasDigitalEstado(resultadoTifEscaneo.substring(0, 9), strPathFileName, nResult, 0));
        }
    }
    
    private void manejarActasConvencionalesErrorUpload(HttpResp httpResp, String resultadoTifEscaneo) {
        int statusCode = httpResp.getStatusCode();
        String message = "";
        
        if (statusCode > 0) {
            if (!httpResp.getMessage().isEmpty()) {
                message = httpResp.getMessage();
            } else {
                message = TEXT_ERROR1 + statusCode + ": " + ListHttpStatusCode.getDescription(statusCode);
            }
        } else {
            if (!httpResp.getMessage().isEmpty()) {
                strValRetFromLib = TEXT_ERROR2 + httpResp.getMessage();
            }
        }
        
        String strPathFileName = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), resultadoTifEscaneo).toString();
        listActasDigitalNoSave.add(new ActasDigitalEstado(resultadoTifEscaneo.substring(0, 9), strPathFileName, statusCode, message));
    }

    private List<ActasDigitalEstado> eliminarDuplicados(List<ActasDigitalEstado> lista) {

        Set<String> mensajeUnico = new HashSet<>();
        return lista.stream()
                .filter(acta -> mensajeUnico.add(acta.getStrMessageError())) // Filtra solo los mensajes únicos
                .collect(Collectors.toCollection(ArrayList::new));

    }

    private void borrarDocElecTemp(int idx) {
        for (int i = 0; i < scanDocElect.get(idx).getTotPaginas(); i++) {
            if (scanDocElect.get(idx).getPaginas().get(i).getArchivo() != null) {
                onEliminarImagenEscaneadaEnAppData(scanDocElect.get(idx).getPaginas().get(i).getArchivo());
            }
        }
    }

    private int guardarDocElec() 
    {
        for (int i = 0; i < scanDocElect.size(); i++) {
            actualizarEstadoScanDocElec(i);

            if (scanDocElect.get(i).getEstado() == 1) {
                int resultado = procesarYGuardarDocElec(i);
                if (resultado == 0) {
                    return 0;
                }
            }
        }

        if (verificarIncompletosDocElect()) {
            strValRetFromLib = obtenerIncompletosDocElect();
            return -1;
        }

        return 1;
    }
    
    private int procesarYGuardarDocElec(int i) {
        int nret = onActualizarNomFileDocElect(i);
        if (nret != 1) {
            scanDocElect.get(i).setMensaje(ListaMensajes.obtenerMensaje(nret));
            scanDocElect.get(i).setEstado(3);
            return 1;
        }

        StringBuilder fileNamePdfFile = new StringBuilder();
        nret = onGenerarPdfDocElect(i, fileNamePdfFile);
        if (nret != 1) {
            scanDocElect.get(i).setMensaje(MSG_ERROR_FILEPDF);
            scanDocElect.get(i).setEstado(3);
            return 1;
        }

        List<String> archivosAdd = new ArrayList<>();
        archivosAdd.add(fileNamePdfFile.toString());

        StringBuilder fileNameZipFile = new StringBuilder();
        nret = onGenerarZipeadoDocElect(i, fileNameZipFile, archivosAdd);
        archivosAdd.clear();

        if (nret != 1) {
            scanDocElect.get(i).setMensaje(ListaMensajes.obtenerMensaje(nret));
            scanDocElect.get(i).setEstado(3);
            return 1;
        }

        return procesarUploadDocElec(i, fileNameZipFile);
    }
    
    private int procesarUploadDocElec(int i, StringBuilder fileNameZipFile) {
        if (GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)) {
            scanDocElect.get(i).setEstado(2);
            borrarDocElecTemp(i);
            FileControl.deleteChildren(fileNameZipFile.toString());
            return 1;
        }

        HttpResp httpResp = sceService.uploadHojaAsistenciaMMyRelNoSort(fileNameZipFile.toString(), scanDocElect.get(i).getMesa(), this.dataLogin.getToken());

        if (httpResp.isSuccess()) {
            scanDocElect.get(i).setEstado(2);
            return 1;
        }

        return manejarErrorUploadDocElec(i, fileNameZipFile, httpResp);
    }
    
    private int manejarErrorUploadDocElec(int i, StringBuilder fileNameZipFile, HttpResp httpResp) {
        onEliminarNomFileDocElect(i);
        borrarDocElecTemp(i);
        FileControl.deleteChildren(fileNameZipFile.toString());

        int statusCode = httpResp.getStatusCode();
        
        if (statusCode > 0) {
            String message = TEXT_MESA1 + scanDocElect.get(i).getMesa() + "\n";
            if (!httpResp.getMessage().isEmpty()) {
                message += httpResp.getMessage();
            } else {
                message += TEXT_ERROR1 + statusCode + ": " + ListHttpStatusCode.getDescription(statusCode);
            }
            scanDocElect.get(i).setMensaje(message);
            scanDocElect.get(i).setEstado(3);
            return 1;
        }

        if (!httpResp.getMessage().isEmpty()) {
            strValRetFromLib = TEXT_ERROR2 + httpResp.getMessage();
        }
        return 0;
    }

    private int onEscaneoHojaAsistenciaFinalizado(String strDocs, boolean iniciarEscaneo) 
    {
        if (strDocs == null || strDocs.isEmpty()) {
            return -15;
        }

        if (strDocs.startsWith(TEXT_ERROR_LIB)) {
            return 0;
        }

        procesarDocumentosEscaneadosHa(strDocs, iniciarEscaneo);

        int nret = guardarDocElec();
        if (nret == 0) {
            return 0;
        }

        if (verificarIncompletosDocElect()) {
            strValRetFromLib = obtenerIncompletosDocElect();
            return -1;
        }

        return 1;
    }
    
    private void procesarDocumentosEscaneadosHa(String strDocs, boolean iniciarEscaneo) {
        StringTokenizer tok = new StringTokenizer(strDocs, ",");

        if (iniciarEscaneo) {
            if (!scanDocElect.isEmpty()) {
                scanDocElect.clear();
            }
            if (!listActasDigitalBarNoRec.isEmpty()) {
                listActasDigitalBarNoRec.clear();
            }
        }

        while (tok.hasMoreElements()) {
            String strNameImage = tok.nextElement().toString();
            String strPathFileName = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), strNameImage).toString();

            if (!strNameImage.startsWith("IM")) {
                procesarArchivoEscaneadoHa(strPathFileName, strNameImage);
            } else {
                listActasDigitalBarNoRec.add(new ActasDigitalEstado(null, strPathFileName, -12, 0));
            }
        }
    }

    public void procesarArchivoEscaneadoHa(String strPathFileName, String strNameImage) {

        if (validacionSimpleNombreImagen(strNameImage)) {
            if(verificarDigitoChequeoSimple(strNameImage)) {
                int idx = generarIdxDocElect(strNameImage, 2);
                int nPag = Integer.parseInt(strNameImage.substring(6, 8));  //01:MM  02:MMC 00040901B
                String descDocCorto = ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA;
                scanDocElect.get(idx).getPaginas().get(nPag - 1).setArchivo(strNameImage);
                scanDocElect.get(idx).getPaginas().get(nPag - 1).setDescDocCorto(descDocCorto);
                actualizarEstadoScanDocElec(idx);
            } else {
                listActasDigitalBarNoRec.add(new ActasDigitalEstado(null, strPathFileName, -12, 0));
            }
        } else {
            listActasDigitalBarNoRec.add(new ActasDigitalEstado(null, strPathFileName, -12, 0));
        }
    }

    private int onGenerarPdfResoluciones(String nombreImagenResolucion, String nombreImagenResolucionPdf) {
        return generaPdfDesdeImg(GlobalDigitalizacion.getFullRutaArchivosAppData(), GlobalDigitalizacion.getFullRutaArchivosAppData(), nombreImagenResolucion, nombreImagenResolucionPdf, GlobalDigitalizacion.FACTOR_COMPRESION_IMGPDF, ConstantDigitalizacion.DIGTAL_SZA4);
    }

    private Task<Integer> createTaskGuardarResolucion(long idDoc, String numeroResolucion, String strFileNameImg, String strTipoDoc, int nTotPages) {   
        return new Task<Integer>() {

            @Override
            protected Integer call() throws Exception {

                String nomImgResPdf = strFileNameImg.replace(".TIF", ".PDF");

                if (onGenerarPdfResoluciones(strFileNameImg, nomImgResPdf) != 1) {
                    return -142;
                }

                if (GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)) {
                    return onActualizaNomFileResolucion(strFileNameImg, nomImgResPdf, strTipoDoc);
                }

                return procesarUploadResolucion(idDoc, numeroResolucion, strFileNameImg, strTipoDoc, nTotPages, nomImgResPdf);
            }
        };
    }
    
    private int procesarUploadResolucion(long idDoc, String numeroResolucion, String strFileNameImg, String strTipoDoc, int nTotPages, String nomImgResPdf) {
        HttpResp httpResp;

        if (strTipoDoc.equalsIgnoreCase(ConstantDigitalizacion.ABREV_DENUNCIAS)) {
            httpResp = sceService.uploadOtrosDocumentos(idDoc, strTipoDoc, GlobalDigitalizacion.getFullRutaArchivosAppData() + File.separator + nomImgResPdf, numeroResolucion, nTotPages, dataLogin.getToken());
        } else {
            httpResp = sceService.uploadResolucion(idDoc, GlobalDigitalizacion.getFullRutaArchivosAppData() + File.separator + nomImgResPdf, numeroResolucion, nTotPages, dataLogin.getToken());
        }

        if (httpResp.isSuccess()) {
            return onActualizaNomFileResolucion(strFileNameImg, nomImgResPdf, strTipoDoc);
        }
        
        return manejarErrorUploadResolucion(httpResp);
    }
    
    private int manejarErrorUploadResolucion(HttpResp httpResp) {
        strValRetFromLib = "";
        if (httpResp.getStatusCode() > 0) {
            strValRetFromLib = TEXT_ERROR1 + httpResp.getStatusCode() + ": " + ListHttpStatusCode.getDescription(httpResp.getStatusCode()) + "\n";
        }
        if (!httpResp.getMessage().isEmpty()) {
            strValRetFromLib = httpResp.getMessage();
        } else {
            strValRetFromLib += ListaMensajes.obtenerMensaje(-136);
        }
        return -136;
    }

    private void onIniciarGuardadoResolucion(long idDoc, boolean desdeVerEscaneados, String numeroResolucion, String strFileNameImg, String strTipoDoc, int nTotPages) {   

        Task<Integer> task = createTaskGuardarResolucion(idDoc, numeroResolucion, strFileNameImg, strTipoDoc, nTotPages);

        task.stateProperty().addListener(new ChangeListener<Worker.State>() {
            @Override
            public void changed(ObservableValue<? extends Worker.State> observableValue, Worker.State oldState, Worker.State newState) {
                if (newState == Worker.State.RUNNING) {
                    scene.setCursor(javafx.scene.Cursor.WAIT);
                }
                else if (newState == Worker.State.SUCCEEDED) {
                    procesarGuardadoResolucionExitoso(task, numeroResolucion);
                    finalizarGuardadoResolucion(desdeVerEscaneados);
                }
                else if (newState == Worker.State.FAILED) {
                    AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, "Error al guardar la resolución");
                    finalizarGuardadoResolucion(desdeVerEscaneados);
                }
            }
        });

        scene.setCursor(javafx.scene.Cursor.WAIT);
        new Thread(task).start();

        desabilitarBotones(true);
        mainStage.requestFocus();
        scene.setCursor(javafx.scene.Cursor.WAIT);
    }
    
    private void procesarGuardadoResolucionExitoso(Task<Integer> task, String numeroResolucion) {
        Integer iTask = task.getValue();

        if (iTask == 1) {
            scene.setCursor(javafx.scene.Cursor.DEFAULT);
            AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.CHECK, String.format("Se digitalizó el documento: %s.", numeroResolucion));
        } else if (iTask == 0) {
            AppController.mostrarMensajeErrorDesdeLib(mainStage, strValRetFromLib, null);
        } else if (iTask == -136) {
            if (strValRetFromLib.isEmpty()) {
                AppController.mostrarMensajeError(mainStage, -136, null);
            } else {
                AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, strValRetFromLib);
            }
        } else if (iTask < 0) {
            AppController.mostrarMensajeError(mainStage, iTask, null);
        }
    }
    
    private void finalizarGuardadoResolucion(boolean desdeVerEscaneados) {
        if (desdeVerEscaneados) {
            mainClassStage.onFinalizoGuardadoDocumento();
        }
        desabilitarBotones(false);
        scene.setCursor(javafx.scene.Cursor.DEFAULT);
    }

    public int onMostrarResolucionEscaneada(String strDocs, DocumentoElectoral docElectoral, String numeroDocumento, long idDoc, boolean desdeVerEscaneados) {   

        String abreviaturaDocumento = docElectoral.getDescDocCorto();
        actualizaRutasArchivos();

        if (strDocs == null || strDocs.isEmpty()) {
            return -15;
        }

        if (strDocs.startsWith(TEXT_ERROR_LIB)) {
            return 0;
        }

        return procesarYMostrarResolucion(strDocs, docElectoral, numeroDocumento, idDoc, desdeVerEscaneados, abreviaturaDocumento);
    }
    
    private int procesarYMostrarResolucion(String strDocs, DocumentoElectoral docElectoral, String numeroDocumento, long idDoc, boolean desdeVerEscaneados, String abreviaturaDocumento) {
        StringTokenizer tok = new StringTokenizer(strDocs, "|");
        String strTokFileName = "";

        if (tok.hasMoreElements()) {
            strTokFileName = tok.nextElement().toString();
        }

        String strFileNameImg = strTokFileName;
        String strPathNomFile = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), strFileNameImg).toString();

        ActasDigitalEstado actaDigital = new ActasDigitalEstado();
        actaDigital.setId(idDoc);
        actaDigital.setStrActa(numeroDocumento);
        actaDigital.setStrFechaDigital(null);
        actaDigital.setStrHoraDigital(null);
        actaDigital.setStrNomFile(strPathNomFile);
        actaDigital.setStrTipoActa(abreviaturaDocumento);
        actaDigital.setNombreEleccion("");
        actaDigital.setNEstadoDigital(1);
        actaDigital.setEstadoDigitalizacion("");

        cargarEditarResolucionController(actaDigital, docElectoral, idDoc, desdeVerEscaneados, numeroDocumento, strFileNameImg, abreviaturaDocumento);
        return 1;
    }
    
    private void cargarEditarResolucionController(ActasDigitalEstado actaDigital, DocumentoElectoral docElectoral, long idDoc, boolean desdeVerEscaneados, String numeroDocumento, String strFileNameImg, String abreviaturaDocumento) {
        try {
            FXMLLoader fxmlLoader = loadFXML("EditarResolucion");
            fxmlLoader.setBuilderFactory(new JavaFXBuilderFactory());
            fxmlLoader.load();

            EditarResolucionController editarResol = fxmlLoader.getController();
            editarResol.setMainStage(this.mainStage);
            editarResol.setStageParent(this.mainStage);
            editarResol.setMainClassStage(mainClassStage);
            editarResol.setActasDigital(actaDigital);
            editarResol.setTipoDocumentoScan(docElectoral);

            EventHandler<WindowEvent> eventHiden = (WindowEvent event) -> {
                if (editarResol.isGuardarDocumento()) {
                    onIniciarGuardadoResolucion(idDoc, desdeVerEscaneados, numeroDocumento, strFileNameImg, abreviaturaDocumento, editarResol.getTotImgs());
                }
            };

            editarResol.init();
            editarResol.setEventHiden(eventHiden);
        } catch (IOException e) {
            logger.warn("Error setting event handler", e);
        }
    }





    private int esHojaAsistenciaMMesa(DocumentoElectoral documentoElectoral) {
        if (documentoElectoral.getDescDocCorto().equalsIgnoreCase(ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA)) {
            return 1;
        }
        return 0;
    }

    private int esActa(DocumentoElectoral documentoElectoral) {

        int esActa = 0;

        if (documentoElectoral.getDescDocCorto().equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_CELESTE)
                || documentoElectoral.getDescDocCorto().equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_CONVENCIONAL)
                || documentoElectoral.getDescDocCorto().equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_EXTRANJERO)
                || documentoElectoral.getDescDocCorto().equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_VOTO_DIGITAL)) {
            esActa = 1;
        }
        return esActa;
    }

    private int generarIdxDocElect(String strNameImage, int totPages) {
        String strMesa = strNameImage.substring(0, 6);
        int idx = -1;

        for (int i = 0; i < scanDocElect.size(); i++) {
            if (scanDocElect.get(i).getMesa().equals(strMesa)) {
                idx = i;
                break;
            }
        }

        if (idx < 0) {
            scanDocElect.add(new ScanDoc(strMesa, totPages, 0));
            idx = generarIdxDocElect(strNameImage, totPages);
        }

        return idx;
    }

    private void actualizarEstadoScanDocElec(int idx) {
        boolean finalizado = true;
        for (int i = 0; i < scanDocElect.get(idx).getTotPaginas(); i++) {
            if (scanDocElect.get(idx).getPaginas().get(i).getArchivo() == null) {
                finalizado = false;
            } else {
                if (scanDocElect.get(idx).getEstado() != 2) {
                    String strPathNomFile = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), scanDocElect.get(idx).getPaginas().get(i).getArchivo()).toString();
                    if (!FileControl.validateFile(strPathNomFile)) {
                        scanDocElect.get(idx).getPaginas().get(i).setArchivo(null);
                        finalizado = false;
                    }
                }
            }
        }
        if (finalizado) {
            if (scanDocElect.get(idx).getEstado() == 0) {
                scanDocElect.get(idx).setEstado(1);
            }
        } else {
            scanDocElect.get(idx).setEstado(0);
        }
    }

    private int onActualizarNomFileDocElect(int idx) {

        for (int i = 0; i < scanDocElect.get(idx).getTotPaginas(); i++) {
            if (scanDocElect.get(idx).getPaginas().get(i).getArchivo() != null) {

                String strNomFile = scanDocElect.get(idx).getPaginas().get(i).getArchivo();
                String strPathNomFile = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), strNomFile).toString();

                String desDocCorto = scanDocElect.get(idx).getPaginas().get(i).getDescDocCorto();

                String strNewPathNomFile = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosImg(), desDocCorto).toString();

                boolean bSuccess = FileControl.validateDir(strNewPathNomFile, true);

                if (bSuccess) {
                    strNewPathNomFile = Paths.get(strNewPathNomFile, strNomFile).toString();

                    bSuccess = FileControl.fileCopyNIO(strPathNomFile, strNewPathNomFile);
                    if (bSuccess) {
                        bSuccess = FileControl.validateFile(strNewPathNomFile);
                    }
                }
                if (!bSuccess) {
                    return -143;
                }
            }
        }
        return 1;
    }

    private void onEliminarNomFileDocElect(int idx) {
        for (int i = 0; i < scanDocElect.get(idx).getTotPaginas(); i++) {
            if (scanDocElect.get(idx).getPaginas().get(i).getArchivo() != null) {
                String desDocCorto = scanDocElect.get(idx).getPaginas().get(i).getDescDocCorto();
                String strNomFile = scanDocElect.get(idx).getPaginas().get(i).getArchivo();
                String strPathToDelete = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosImg(), desDocCorto, desDocCorto + strNomFile).toString();

                boolean bSuccess = FileControl.deleteChildren(strPathToDelete);

                if (!bSuccess) {
                    return;
                }
            }
        }
    }

    private int onGenerarPdfDocElect(int idx, StringBuilder fileNamePdfFile) {

        String strNumActa = scanDocElect.get(idx).getMesa();
        String strPathFiles = GlobalDigitalizacion.getFullRutaArchivosAppData();

        StringBuilder strListaImgs = new StringBuilder();
        String strFileNamePdf = strNumActa + ".pdf";

        String strPathFilePdf = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosPdf(), ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA).toString();

        String strPathFileNamePdf = Paths.get(strPathFilePdf, strFileNamePdf).toString();
        fileNamePdfFile.append(strPathFileNamePdf);

        boolean bSuccess = FileControl.validateDir(strPathFilePdf, true);
        if (bSuccess) {
            for (int i = 0; i < scanDocElect.get(idx).getTotPaginas(); i++) {
                if (scanDocElect.get(idx).getPaginas().get(i).getArchivo() != null) {
                    strListaImgs.append(scanDocElect.get(idx).getPaginas().get(i).getArchivo()).append(",");
                }
            }

            if (!strListaImgs.isEmpty()) {
                return generaPdfDesdeImg(strPathFiles, strPathFilePdf, strListaImgs.toString(), strFileNamePdf, GlobalDigitalizacion.FACTOR_COMPRESION_IMGPDF, ConstantDigitalizacion.DIGTAL_SZAUTO);
            }
        }
        return 0;
    }

    private int onGenerarZipeadoDocElect(int idx, StringBuilder fileNameZipFile, List<String> archivosAdd) {

        String strNumActa = scanDocElect.get(idx).getMesa();
        String strNameFolder = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA).toString();
        String strNameFileZip = Paths.get(strNameFolder, strNumActa + ".zip").toString();

        boolean bSuccess = FileControl.validateDir(strNameFolder, true);

        if (!bSuccess) {
            return 1;
        }

        List<String> archivos = recopilarArchivosParaZipear(idx, archivosAdd);
        
        int resultado = crearArchivoZip(strNameFileZip, archivos);
        if (resultado < 0) {
            return resultado;
        }

        archivos.clear();
        fileNameZipFile.append(strNameFileZip);

        return 1;
    }
    
    private List<String> recopilarArchivosParaZipear(int idx, List<String> archivosAdd) {
        List<String> archivos = new ArrayList<>();

        for (int i = 0; i < scanDocElect.get(idx).getTotPaginas(); i++) {
            if (scanDocElect.get(idx).getPaginas().get(i).getArchivo() != null) {
                String archivo = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), 
                    scanDocElect.get(idx).getPaginas().get(i).getArchivo()).toString();

                if (FileControl.validateFile(archivo)) {
                    archivos.add(archivo);
                }
            }
        }

        for (String archivoAdd : archivosAdd) {
            if (FileControl.validateFile(archivoAdd)) {
                archivos.add(archivoAdd);
            }
        }
        
        return archivos;
    }
    
    private int crearArchivoZip(String strNameFileZip, List<String> archivos) {
        try (FileOutputStream fos = new FileOutputStream(strNameFileZip);
             ZipOutputStream zipOut = new ZipOutputStream(fos)) {
            zipFiles(archivos, zipOut);
            return 1;
        } catch (IOException ex) {
            return -141;
        }
    }

    private String obtenerIncompletosDocElect() {
        StringBuilder str = new StringBuilder();

        int nmesasf = 0;
        for (ScanDoc doc : scanDocElect) {
            if (doc.getEstado() == 0) {
                str.append(doc.getMesa()).append(", ");
                nmesasf++;
            }
        }

        if (nmesasf > 0 && str.length() >= 2) {
            str.setLength(str.length() - 2);
        }

        return str.toString();
    }

    private boolean verificarIncompletosDocElect() {
        for (ScanDoc doc : scanDocElect) {
            if (doc.getEstado() == 0) {
                return true;
            }
        }
        return false;
    }

    private int contarCompletosDocElect() {
        int nmesasf = 0;
        for (ScanDoc doc : scanDocElect) {
            if (doc.getEstado() == 2) {
                nmesasf++;
            }
        }
        return nmesasf;
    }

    private int buscarIndiceEnListaElectoresPorMesa(String strNameImage) {
        String strMesa = strNameImage.substring(0, 6);
        int totPages = Integer.parseInt(strNameImage.substring(10, 12));
        int idx = -1;

        for (int i = 0; i < listaElectores.size(); i++) {
            if (listaElectores.get(i).getMesa().equals(strMesa)) {
                idx = i;
                break;
            }
        }

        if (idx < 0) {
            listaElectores.add(new ListaElectores(strMesa, totPages, 0));
            idx = buscarIndiceEnListaElectoresPorMesa(strNameImage);
        }

        return idx;
    }

    private void actualizarEstadoCompletoIncompletoListaElec(int idx) {
        ListaElectores listaElector = listaElectores.get(idx);

        listaElector.actualizarEstadoCompleto(
                GlobalDigitalizacion.getFullRutaArchivosAppData(),
                ConstantDigitalizacion.N_ESTADO_LE_ENVIADO,
                ConstantDigitalizacion.N_ESTADO_LE_INCOMPLETO,
                ConstantDigitalizacion.N_ESTADO_LE_COMPLETO
        );
    }

    private void borrarImagenesListaElectoresEnAppData(int idx) {

        for (int i = 0; i < listaElectores.get(idx).getTotPaginas(); i++) {
            if (listaElectores.get(idx).getPaginas().get(i).getArchivo() != null) {
                onEliminarImagenEscaneadaEnAppData(listaElectores.get(idx).getPaginas().get(i).getArchivo());
            }
        }

    }

    private String obtenerIncompletasListaElect() {   
        StringBuilder str = new StringBuilder();
        int nmesasf = 0;
        for (int i = 0; i < listaElectores.size(); i++) {
            if (listaElectores.get(i).getEstado() == ConstantDigitalizacion.N_ESTADO_LE_INCOMPLETO) {
                if (nmesasf > 0) {
                    str.append("\r\n");
                }
                agregarPaginasFaltantesListaElector(str, i);
                nmesasf++;
            }
        }
        return str.toString();
    }
    
    private void agregarPaginasFaltantesListaElector(StringBuilder str, int i) {
        str.append("Mesa ").append(listaElectores.get(i).getMesa()).append(": ");

        int npagf = 0;
        for (int p = 0; p < listaElectores.get(i).getTotPaginas(); p++) {
            if (listaElectores.get(i).getPaginas().get(p).getArchivo() == null) {
                str.append(listaElectores.get(i).getPaginas().get(p).getnPagina()).append(", ");
                npagf++;
            }
        }
        if (npagf > 0 && str.length() >= 2) {
            str.setLength(str.length() - 2);
        }
    }

    private boolean verificarIncompletasListaElect() {
        for (ListaElectores listaElector : listaElectores) {
            if (listaElector.getEstado() == 0) {
                return true;
            }
        }
        return false;
    }

    private String obtenerCompletasListaElect() {
        StringBuilder str = new StringBuilder();
        int nmesasf = 0;
        for (ListaElectores listaElector : listaElectores) {
            if (listaElector.getEstado() == 2) {
                str.append(listaElector.getMesa()).append(", ");
                nmesasf++;
            }
        }
        if (nmesasf > 0 && str.length() >= 2) {
            str.setLength(str.length() - 2);
        }
        return str.toString();
    }

    private int contarCompletasListaElect() {
        int nmesasf = 0;
        for (ListaElectores listaElector : listaElectores) {
            if (listaElector.getEstado() == 2) {
                nmesasf++;
            }
        }
        return nmesasf;
    }

    private int copiarTifLeDeAppDataACarpetaMesa(int idx, String abrevDoc) {

        String strNumActa = listaElectores.get(idx).getMesa();
        String strNewPathNomFileR = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), abrevDoc, strNumActa).toString();
        boolean bSuccess = FileControl.validateDir(strNewPathNomFileR, true);

        for (int i = 0; i < listaElectores.get(idx).getTotPaginas(); i++) {
            if (listaElectores.get(idx).getPaginas().get(i).getArchivo() != null) {
                String strNomFile = listaElectores.get(idx).getPaginas().get(i).getArchivo();
                String strPathNomFile = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), strNomFile).toString();
                String strNewPathNomFile = Paths.get(strNewPathNomFileR, strNomFile).toString();
                if (bSuccess) {
                    bSuccess = FileControl.fileCopyNIO(strPathNomFile, strNewPathNomFile);
                    if (bSuccess) {
                        bSuccess = FileControl.validateFile(strNewPathNomFile);
                    }
                }
                if (!bSuccess) {
                    return -140;
                }
            }
        }
        return 1;
    }

    private int generarPdfEnCarpetaMesaEnAppData(int idx, String abrevDoc, StringBuilder sbRutaArchivoPdf, StringBuilder sbRutaDirectorioCarpetaMesaAppData) {
        ListaElectores listaElector = listaElectores.get(idx);
        String mesa = listaElector.getMesa();

        String rutaDirectorioImagenesLe = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), abrevDoc, mesa).toString();
        String nombreArchivoPdf = mesa + ".pdf";

        if (!FileControl.validateDir(rutaDirectorioImagenesLe, false)) {
            return 0;
        }

        String listaImagenes = obtenerListaImagenes(listaElector);
        if (listaImagenes.isEmpty()) {
            return 0;
        }

        int resultado = generaPdfDesdeImg(
                rutaDirectorioImagenesLe,
                rutaDirectorioImagenesLe,
                listaImagenes,
                nombreArchivoPdf,
                GlobalDigitalizacion.FACTOR_COMPRESION_IMGPDF,
                ConstantDigitalizacion.DIGTAL_SZA4
        );

        if (resultado == 1) {
            sbRutaArchivoPdf.append(Paths.get(rutaDirectorioImagenesLe, nombreArchivoPdf));
            sbRutaDirectorioCarpetaMesaAppData.append(rutaDirectorioImagenesLe);
        }

        return resultado;
    }

    private String obtenerListaImagenes(ListaElectores listaElector) {
        return listaElector.getPaginas().stream()
                .map(ScanDoc.Pagina::getArchivo)
                .filter(Objects::nonNull)
                .collect(Collectors.joining(","));
    }

    private static void zipFolder(File carpeta, String rutaRelativa, ZipOutputStream zipOut) throws IOException {
        File[] archivos = carpeta.listFiles();
        if (archivos == null) {
            return;
        }
        
        for (File archivo : archivos) {
            if (archivo.isDirectory()) {
                zipFolder(archivo, rutaRelativa + "/" + archivo.getName(), zipOut);
                continue;
            }

            ZipEntry zipEntry = new ZipEntry(rutaRelativa + "/" + archivo.getName());
            zipOut.putNextEntry(zipEntry);

            try ( FileInputStream fis = new FileInputStream(archivo)) {
                byte[] bytes = new byte[1024];
                int length;
                while ((length = fis.read(bytes)) >= 0) {
                    zipOut.write(bytes, 0, length);
                }
            }

            zipOut.closeEntry();
        }

    }

    private static void zipFiles(List<String> archivos, ZipOutputStream zipOut) throws IOException {

        for (String archivo : archivos) {
            File fileToZip = new File(archivo);

            ZipEntry zipEntry = new ZipEntry(fileToZip.getName());
            zipOut.putNextEntry(zipEntry);

            try ( FileInputStream fis = new FileInputStream(fileToZip)) {
                byte[] bytes = new byte[1024];
                int length;
                while ((length = fis.read(bytes)) >= 0) {
                    zipOut.write(bytes, 0, length);
                }
            }

            zipOut.closeEntry();
        }
    }

    private int generarZipLeCarpetaMesaEnAppData(int idx, String strTipoDoc, StringBuilder sbRutaArchivoZip) {

        String strNumActa = listaElectores.get(idx).getMesa();
        String strNameFolder = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), strTipoDoc, strNumActa).toString();
        String strNameFileZip = strNameFolder + ".zip";

        try ( FileOutputStream fos = new FileOutputStream(strNameFileZip);  ZipOutputStream zipOut = new ZipOutputStream(fos)) {
            File folder = new File(strNameFolder);
            zipFolder(folder, folder.getName(), zipOut);
        } catch (IOException ex) {
            return -141;
        }

        sbRutaArchivoZip.append(strNameFileZip);
        return 1;
    }

    private Integer iniciarLlamadaAServiceSubirActas(String abrevDocumento) {

        int totalProcesadas = 0;
        int exitosas = 0;

        for (ActasDigitalEstado actasDigitalEstado : listActasDigitalBarNoRec) {
            // Early return si no hay copia
            if (actasDigitalEstado.getStrActaCopia() == null) {
                continue;
            }

            totalProcesadas++;
            String numeroActa = actasDigitalEstado.getStrActaCopia();
            String nombreArchivoTif = numeroActa + ConstantDigitalizacion.EXTENSION_TIF;
            String rutaArchivoTif = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), nombreArchivoTif).toString();

            // Procesar upload
            HttpResp httpResp = sceService.uploadActasDigitalizadas(rutaArchivoTif, numeroActa, abrevDocumento, this.dataLogin.getToken());

            if (httpResp.isSuccess()) {
                // Upload exitoso - procesar copia
                int nResult = copyFromAppDataToScanPrincipal(nombreArchivoTif, abrevDocumento);

                if (nResult == 1) {
                    // Éxito completo
                   String strPathFileName = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosImg(), abrevDocumento, nombreArchivoTif).toString();
                    listActasDigtalRec.add(new ActasDigitalEstado(
                            numeroActa, strPathFileName, 0, 1, ConstantDigitalizacion.ESTADO_DIGTAL_DIGITALIZADA));
                    exitosas++;
                } else {
                    // Upload OK pero fallo en copia local
                    agregarActaNoSave(numeroActa, rutaArchivoTif, nResult,
                            "Se subió la imagen al servidor correctamente, pero no se copio en la carpeta principal.");
                }
            } else {
                // Upload falló - construir mensaje de error
                String message = construirMensajeError(httpResp);
                agregarActaNoSave(numeroActa, rutaArchivoTif, httpResp.getStatusCode(), message);
            }
        }

        // Limpiar lista procesada
        listActasDigitalBarNoRec.clear();

        // Retornar código basado en resultados
        if (totalProcesadas == 0) {
            return 0;        // No había nada que procesar
        }
        if (exitosas == totalProcesadas) {
            return 1; // Exitoso
        }
        if (exitosas > 0) {
            return 2;                // Parcialmente exitoso
        }
        return -1;                                 // Fallo total

    }

    // Métod para agregar actas no guardadas
    private void agregarActaNoSave(String numeroActa, String ruta, int codigo, String mensaje) {
        listActasDigitalNoSave.add(new ActasDigitalEstado(numeroActa, ruta, codigo, mensaje));
    }

    // Métod para construir mensaje de error
    private String construirMensajeError(HttpResp httpResp) {
        int statusCode = httpResp.getStatusCode();
        String message = "";

        if (statusCode > 0) {
            message = !httpResp.getMessage().isEmpty()
                    ? httpResp.getMessage()
                    : TEXT_ERROR1 + statusCode + ": " + ListHttpStatusCode.getDescription(statusCode);
        } else {
            // Error de conexión
            message = !httpResp.getMessage().isEmpty()
                    ? TEXT_ERROR2 + httpResp.getMessage()
                    : TEXT_ERROR2 + "Error de conexión";
        }

        return message;
    }

    private void iniciarLlamadaAServiceSubirListaElectores(String abrevDocumento)
    {
        for (int idx = 0; idx < listaElectores.size(); idx++) {
            actualizarEstadoCompletoIncompletoListaElec(idx);

            int resultado = procesarListaElectorPorIndice(idx, abrevDocumento);
            if (resultado != 1) {
                return;
            }
        }
    }
    
    private int procesarListaElectorPorIndice(int idx, String abrevDocumento) {
        int nret = copiarTifLeDeAppDataACarpetaMesa(idx, abrevDocumento);
        if (nret != 1) {
            listaElectores.get(idx).setMensaje(ListaMensajes.obtenerMensaje(nret));
            listaElectores.get(idx).setEstado(3);
            return 1;
        }

        StringBuilder sbRutaArchivoPdfAppdata = new StringBuilder();
        StringBuilder sbRutaDirectorioCarpetaMesaAppdata = new StringBuilder();
        nret = generarPdfEnCarpetaMesaEnAppData(idx, abrevDocumento, sbRutaArchivoPdfAppdata, sbRutaDirectorioCarpetaMesaAppdata);
        if (nret != 1) {
            listaElectores.get(idx).setMensaje(MSG_ERROR_FILEPDF);
            listaElectores.get(idx).setEstado(3);
            return 1;
        }

        StringBuilder sbRutaArchivoZipAppdata = new StringBuilder();
        nret = generarZipLeCarpetaMesaEnAppData(idx, abrevDocumento, sbRutaArchivoZipAppdata);
        if (nret != 1) {
            listaElectores.get(idx).setMensaje(ListaMensajes.obtenerMensaje(nret));
            listaElectores.get(idx).setEstado(3);
            return 1;
        }

        return procesarUploadListaElector(idx, abrevDocumento, sbRutaDirectorioCarpetaMesaAppdata, sbRutaArchivoZipAppdata);
    }
    
    private int procesarUploadListaElector(int idx, String abrevDocumento, StringBuilder sbRutaDirectorioCarpetaMesaAppdata, StringBuilder sbRutaArchivoZipAppdata) {
        String mesa = listaElectores.get(idx).getMesa();
        HttpResp httpResp = sceService.uploadListaElect(mesa, sbRutaArchivoZipAppdata.toString(), this.dataLogin.getToken());
        int statusCode = httpResp.getStatusCode();

        if (httpResp.isSuccess()) {
            listaElectores.get(idx).setEstado(ConstantDigitalizacion.N_ESTADO_LE_ENVIADO);
            copiarCarpetayZipDeAppDataAPrincipal(abrevDocumento, sbRutaDirectorioCarpetaMesaAppdata, mesa, sbRutaArchivoZipAppdata);
            eliminarArchivoyCarpetasDeAppdata(sbRutaDirectorioCarpetaMesaAppdata, sbRutaArchivoZipAppdata, idx);
            return 1;
        }
        
        if (statusCode > 0) {
            manejarErrorHttpListaElector(idx, mesa, httpResp, sbRutaDirectorioCarpetaMesaAppdata, sbRutaArchivoZipAppdata);
            return 1;
        }
        
        if (!httpResp.getMessage().isEmpty()) {
            strValRetFromLib = TEXT_ERROR2 + httpResp.getMessage();
        }
        return 0;
    }
    
    private void manejarErrorHttpListaElector(int idx, String mesa, HttpResp httpResp, StringBuilder sbRutaDirectorioCarpetaMesaAppdata, StringBuilder sbRutaArchivoZipAppdata) {
        eliminarArchivoyCarpetasDeAppdata(sbRutaDirectorioCarpetaMesaAppdata, sbRutaArchivoZipAppdata, idx);

        String message = TEXT_MESA1 + mesa + "\n";
        message += httpResp.getMessage().isEmpty()
                ? TEXT_ERROR1 + httpResp.getStatusCode() + ": " + ListHttpStatusCode.getDescription(httpResp.getStatusCode()) + "\n"
                : httpResp.getMessage();

        listaElectores.get(idx).setMensaje(message);
        listaElectores.get(idx).setEstado(ConstantDigitalizacion.N_ESTADO_LE_ERROR_HTTP);
    }

    private static void copiarCarpetayZipDeAppDataAPrincipal(String abrevDocumento, StringBuilder sbRutaDirectorioCarpetaMesaAppdata, String mesa, StringBuilder rutaArchivoZipAppdata) {
        String rutaDirectorioPrincipalCompleto = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosImg(), abrevDocumento).toString();

        FileControl.validateDir(rutaDirectorioPrincipalCompleto, true);

        CopyOption[] options = {StandardCopyOption.REPLACE_EXISTING};
        try {
            FileControl.copyRecursively(Paths.get(sbRutaDirectorioCarpetaMesaAppdata.toString()), Paths.get(rutaDirectorioPrincipalCompleto, mesa), options);
            FileControl.fileCopyNIO(rutaArchivoZipAppdata.toString(), Paths.get(rutaDirectorioPrincipalCompleto, mesa + ".zip").toString());
        } catch (IOException e) {
            logger.info("No se realizó la copia a la carpeta principal.", e);
        }
    }

    private void eliminarArchivoyCarpetasDeAppdata(StringBuilder sbRutaDirectorioCarpetaMesaAppdata, StringBuilder rutaArchivoZipAppdata, int idx) {
        FileControl.deleteChildren(sbRutaDirectorioCarpetaMesaAppdata.toString());//eliminar carpeta
        FileControl.deleteChildren(rutaArchivoZipAppdata.toString());//eliminar zip
        borrarImagenesListaElectoresEnAppData(idx);
    }

    private Task<Integer> createTaskIniciarLlamadaServiceUploadListaElectores(String strTipoDoc) {
        return new Task<Integer>() {

            @Override
            protected Integer call() throws Exception {
                iniciarLlamadaAServiceSubirListaElectores(strTipoDoc);
                scene.setCursor(javafx.scene.Cursor.WAIT);
                return 0;
            }
        };
    }

    private void iniciarTaskIniciarLlamadaServiceUploadListaElectores(String abrevDoc) {

        Task<Integer> task = createTaskIniciarLlamadaServiceUploadListaElectores(abrevDoc);

        task.stateProperty().addListener(new ChangeListener<Worker.State>() {
            @Override
            public void changed(ObservableValue<? extends Worker.State> observableValue, Worker.State oldState, Worker.State newState) {
                if (newState == Worker.State.RUNNING) {
                    scene.setCursor(javafx.scene.Cursor.WAIT);
                }
                if (newState == Worker.State.SUCCEEDED || newState == Worker.State.FAILED) {
                    mostrarFinalizacionEscaneoListasElectores(0, true);
                    desabilitarBotones(false);
                    scene.setCursor(javafx.scene.Cursor.DEFAULT);
                }
            }
        });
        scene.setCursor(javafx.scene.Cursor.WAIT);
        new Thread(task).start();
        desabilitarBotones(true);
        mainStage.requestFocus();
        scene.setCursor(javafx.scene.Cursor.WAIT);
    }

    private void iniciarTaskIniciarLlamadaServiceUploadActas(String abrevDoc) {

        Task<Integer> task = new Task<>() {
            @Override
            protected Integer call() {
                return iniciarLlamadaAServiceSubirActas(abrevDoc);
            }
        };
        // Configurar callbacks directamente
        task.setOnRunning(e -> {
            scene.setCursor(javafx.scene.Cursor.WAIT);
            desabilitarBotones(true);
        });

        task.setOnSucceeded(e -> {
            desabilitarBotones(false);
            scene.setCursor(javafx.scene.Cursor.DEFAULT);

            int actasLote = listActasDigtalRec.size();
            int actasNoSave = listActasDigitalNoSave.size();
            String strMsg = String.format("Se digitalizaron %d documentos electorales en total.%n", actasLote);
            strMsg = strMsg + ((actasNoSave > 0) ? String.format("Hay %d documentos rechazados. Click en aceptar para ver errores", actasNoSave) : "");

            EventHandler<ActionEvent> continueEvent = (ActionEvent event) -> {
                stageMsgBox.close();

                if (actasNoSave > 0) {
                    mostrarMensajesActasNoGuardadas(0);
                }

            };

            stageMsgBox = AppController.handleMessageBoxModal(mainStage,
                    (actasNoSave > 0) ? Messages.typeMessage.WARNING : Messages.typeMessage.CHECK,
                    strMsg, continueEvent);

        });

        task.setOnFailed(e -> {
            Throwable exception = task.getException();
            if (exception != null) {
                logger.error("Error en tarea", exception);
            }
            mostrarMensajesActasNoGuardadas(0);
            desabilitarBotones(false);
            scene.setCursor(javafx.scene.Cursor.DEFAULT);
        });

        // Iniciar task
        new Thread(task).start();
        mainStage.requestFocus();
    }

    private int onEscaneoListasElectoresFinalizado(String resultadosEscaneo, String abrevDoc, boolean iniciarEscaneo) 
    {
        if (resultadosEscaneo == null || resultadosEscaneo.isEmpty()) {
            return -15;
        }

        if (resultadosEscaneo.startsWith(TEXT_ERROR_LIB)) {
            return 0;
        }

        procesarResultadosEscaneoListasElectores(resultadosEscaneo, abrevDoc, iniciarEscaneo);

        if (!listActasDigitalBarNoRec.isEmpty()) {
            return -999;
        }

        if (verificarListasElectoresIncompletas()) {
            strValRetFromLib = obtenerIncompletasListaElect();
            return -1;
        }

        return 1;
    }
    
    private void procesarResultadosEscaneoListasElectores(String resultadosEscaneo, String abrevDoc, boolean iniciarEscaneo) {
        StringTokenizer tok = new StringTokenizer(resultadosEscaneo, ",");

        if (iniciarEscaneo && !listaElectores.isEmpty()) {
            listaElectores.clear();
            listActasDigitalBarNoRec.clear();
        }

        while (tok.hasMoreElements()) {
            String resultadoEscaneo = tok.nextElement().toString();
            procesarArchivoListaElector(resultadoEscaneo, abrevDoc);
        }
    }
    
    private void procesarArchivoListaElector(String resultadoEscaneo, String abrevDoc) {
        if (resultadoEscaneo.startsWith("tmp")) {
            agregarArchivoNoReconocido(resultadoEscaneo);
            return;
        }

        if (!validacionSimpleNombreImagenListaElect(resultadoEscaneo)) {
            agregarArchivoNoReconocido(resultadoEscaneo);
            return;
        }

        int idx = buscarIndiceEnListaElectoresPorMesa(resultadoEscaneo);
        int nPagina = Integer.parseInt(resultadoEscaneo.substring(8, 10));
        listaElectores.get(idx).getPaginas().get(nPagina - 1).setArchivo(resultadoEscaneo);
        listaElectores.get(idx).getPaginas().get(nPagina - 1).setDescDocCorto(abrevDoc);
        actualizarEstadoCompletoIncompletoListaElec(idx);
    }
    
    private void agregarArchivoNoReconocido(String nombreArchivo) {
        String strPathFileName = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), nombreArchivo).toString();
        listActasDigitalBarNoRec.add(new ActasDigitalEstado(null, strPathFileName, -12, 0));
    }
    
    private boolean verificarListasElectoresIncompletas() {
        for (ListaElectores listaElectore : listaElectores) {
            if (listaElectore.getEstado() == ConstantDigitalizacion.N_ESTADO_LE_INCOMPLETO) {
                return true;
            }
        }
        return false;
    }

    private Task<Integer> createTaskEscaneoMain(DocumentoElectoral docElectoral, String numeroResolucion, boolean iniciarEscaneo) {
        return new Task<Integer>() {

            @Override
            protected Integer call() throws Exception {   

                String descDocCorto = docElectoral.getDescDocCorto();

                // Validar directorios
                if (!validarDirectorios()) {
                    return 0;
                }

                scene.setCursor(javafx.scene.Cursor.WAIT);

                // Procesar según tipo de documento
                return procesarEscaneoPorTipoDocumento(docElectoral, numeroResolucion, iniciarEscaneo, descDocCorto);
            }
        };
    }
    
    private boolean validarDirectorios() {
        boolean bSuccess = FileControl.validateDir(GlobalDigitalizacion.getFullRutaArchivosAppData(), true);
        if (bSuccess) {
            String rutaArchivosImg = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosImg()).toString();
            bSuccess = FileControl.validateDir(rutaArchivosImg, true);
            if (!bSuccess) {
                strValRetFromLib = "Error:|Directorio no encontrado|" + rutaArchivosImg;
                return false;
            }
        } else {
            strValRetFromLib = "Error:|Directorio no encontrado|" + GlobalDigitalizacion.getFullRutaArchivosAppData();
            return false;
        }
        return true;
    }
    
    private int procesarEscaneoPorTipoDocumento(DocumentoElectoral docElectoral, String numeroResolucion, boolean iniciarEscaneo, String descDocCorto) {
        if (esActaConvencional(descDocCorto)) {
            return procesarEscaneoActaConvencional(docElectoral, descDocCorto);
        } else if (esHojaAsistenciaMMesa(docElectoral) > 0) {
            return procesarEscaneoHojaAsistencia(docElectoral, iniciarEscaneo);
        } else if (esResolucionODenuncia(descDocCorto)) {
            return procesarEscaneoResolucion(docElectoral, numeroResolucion);
        } else if (descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.ABREV_LISTA_ELECTORES)) {
            return procesarEscaneoListaElectores(docElectoral, iniciarEscaneo);
        }
        return -17;
    }
    
    private boolean esActaConvencional(String descDocCorto) {
        return descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_CELESTE)
                || descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_CONVENCIONAL)
                || descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_EXTRANJERO);
    }
    
    private boolean esResolucionODenuncia(String descDocCorto) {
        return descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.ABREV_RESOLUCIONES)
                || descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.ABREV_DENUNCIAS);
    }
    
    private int procesarEscaneoActaConvencional(DocumentoElectoral docElectoral, String descDocCorto) {
        List<CodeBarUtil> barUtil = CodeBarUtil.obtenerCodigosBarras(docElectoral.getDescDocCorto());
        
        strValRetFromLib = escanearActasConvencionales(0,
                GlobalDigitalizacion.getFullRutaArchivosAppData(),
                GlobalDigitalizacion.getRutaArchivosTemp(),
                strNameScanner,
                1, // iTipoImgSel - color
                0, // iTamanioHoja - automático
                0, // iImgMultiPage - genera tif multipagina
                1, // iScanBothPages - escanear ambas páginas
                300,
                barUtil.get(0).getOrientacion(),
                barUtil.get(0).getX(),
                barUtil.get(0).getY(),
                barUtil.get(0).getAncho(),
                barUtil.get(0).getAlto(),
                barUtil.get(1).getOrientacion(),
                barUtil.get(1).getX(),
                barUtil.get(1).getY(),
                barUtil.get(1).getAncho(),
                barUtil.get(1).getAlto(),
                barUtil.get(2).getOrientacion(),
                barUtil.get(2).getX(),
                barUtil.get(2).getY(),
                barUtil.get(2).getAncho(),
                barUtil.get(2).getAlto(),
                0, 0, 0, "", "", 0, 0, 1,
                GlobalDigitalizacion.FACTOR_COMPRESION_IMGPDF
        );
        
        return onEscaneoActasConvencionalesFinalizado(strValRetFromLib, descDocCorto);
    }
    
    private int procesarEscaneoHojaAsistencia(DocumentoElectoral docElectoral, boolean iniciarEscaneo) {
        List<CodeBarUtil> barUtil = CodeBarUtil.obtenerCodigosBarras(docElectoral.getDescDocCorto());
        
        if(!barUtil.isEmpty()) {
            logger.debug("Leyendo IniciarTwain hoja de asistencia.");
            CodeBarUtil barU = barUtil.get(0);
            CodeBarUtil barU2 = barUtil.get(1);
            strValRetFromLib = iniciarTwain(0, GlobalDigitalizacion.getFullRutaArchivosAppData(), GlobalDigitalizacion.getRutaArchivosTemp(), strNameScanner,
                1, 0, 0, 1, 300,
                barU.getOrientacion(), barU.getX(), barU.getY(), barU.getAncho(), barU.getAlto(),
                barU2.getOrientacion(), barU2.getX(), barU2.getY(), barU2.getAncho(), barU2.getAlto(),
                0, 0, 1, GlobalDigitalizacion.FACTOR_COMPRESION_IMGPDF);
        } else {
            strValRetFromLib = iniciarTwain(0, GlobalDigitalizacion.getFullRutaArchivosAppData(), GlobalDigitalizacion.getRutaArchivosTemp(), strNameScanner,
                1, 0, 0, 1, 300,
                docElectoral.getCbOrienta(), docElectoral.getCbLeft(), docElectoral.getCbTop(), docElectoral.getCbWidth(), docElectoral.getCbHeight(),
                0, 0, 0, 0, 0,
                0, 0, 1, GlobalDigitalizacion.FACTOR_COMPRESION_IMGPDF);
        }
        
        return onEscaneoHojaAsistenciaFinalizado(strValRetFromLib, iniciarEscaneo);
    }
    
    private int procesarEscaneoResolucion(DocumentoElectoral docElectoral, String numeroResolucion) {
        String fileNameResolucion = numeroResolucion.replaceAll("[ /]+", "-");
        
        strValRetFromLib = escanearResoluciones(0, GlobalDigitalizacion.getFullRutaArchivosAppData(), GlobalDigitalizacion.getRutaArchivosTemp(), strNameScanner,
                docElectoral.getTipoImagen(), docElectoral.getSizeHojaSel(), docElectoral.getImgfileMultiPage(), docElectoral.getScanBothPages(), 300, 
                ConstantDigitalizacion.DIGTAL_DOC_PGNEW_FILE, 0,
                0, 0, 0, 0, 0,
                fileNameResolucion + ".TIF", numeroResolucion, GlobalDigitalizacion.getNomprocCorto(), GlobalDigitalizacion.getCentroComputo(), 0, 0);
        
        return 1;
    }
    
    private int procesarEscaneoListaElectores(DocumentoElectoral docElectoral, boolean iniciarEscaneo) {
        strValRetFromLib = escanearListaElectores(0, GlobalDigitalizacion.getFullRutaArchivosAppData(), GlobalDigitalizacion.getRutaArchivosTemp(), strNameScanner,
                ConstantDigitalizacion.DIGTAL_IMCOLOR, 
                ConstantDigitalizacion.DIGTAL_SZA3, 
                0, 1, 300,
                ConstantDigitalizacion.DIGTAL_CB_TB, 
                ConstantDigitalizacion.DIGITAL_CB_LE_CUT_LEFT_A, 
                ConstantDigitalizacion.DIGITAL_CB_LE_CUT_TOP_A, 
                ConstantDigitalizacion.DIGITAL_CB_LE_CUT_WIDTH_A, 
                ConstantDigitalizacion.DIGITAL_CB_LE_CUT_HEIGTH_A,
                ConstantDigitalizacion.DIGTAL_CB_BT, 
                ConstantDigitalizacion.DIGITAL_CB_LE_CUT_LEFT_B, 
                ConstantDigitalizacion.DIGITAL_CB_LE_CUT_TOP_B, 
                ConstantDigitalizacion.DIGITAL_CB_LE_CUT_WIDTH_B, 
                ConstantDigitalizacion.DIGITAL_CB_LE_CUT_HEIGTH_B,
                GlobalDigitalizacion.getNomprocCorto(), GlobalDigitalizacion.getCentroComputo(), 0, 0);
        
        return onEscaneoListasElectoresFinalizado(strValRetFromLib, docElectoral.getDescDocCorto(), iniciarEscaneo);
    }

    private void mostrarMensajesActasNoGuardadas(int nIndexMessage) {

        if (listActasDigitalNoSave == null || listActasDigitalNoSave.isEmpty()) {
            logger.info("PROCESO DE DIGITALIZACION DE ACTAS FINALIZADO");
            logger.info("Se digitalizaron {} documentos electorales.", listActasDigtalRec.size());
            return;
        }

        if (nIndexMessage < 0 || nIndexMessage >= listActasDigitalNoSave.size()) {
            return;
        }

        String message = listActasDigitalNoSave.get(nIndexMessage).getStrMessageError();

        String mensajeCompleto = String.format("Mensaje %d de %d%n%n%s",
                nIndexMessage + 1,
                listActasDigitalNoSave.size(),
                message != null ? message : "Error desconocido");

        EventHandler<ActionEvent> eventWindow = (ActionEvent event) -> {
            stageMsgBox.close();

            int siguienteIndex = nIndexMessage + 1;
            if (siguienteIndex < listActasDigitalNoSave.size()) {
                mostrarMensajesActasNoGuardadas(siguienteIndex);
            }
        };

        stageMsgBox = AppController.handleMessageBoxModal(mainStage,
                Messages.typeMessage.WARNING,
                mensajeCompleto, eventWindow);

    }

    private void onIniciarEscaneoActasConvencionales(DocumentoElectoral documentoElectoral) 
    {
        if (!listElecciones.isEmpty()) {
            listElecciones.clear();
        }
        listElecciones = sceService.obtenerListaElecciones(this.dataLogin.getToken());

        if (listElecciones.isEmpty()) {
            AppController.handleMessageBoxModal(mainStage,
                    Messages.typeMessage.WARNING,
                    "No se pudo obtener información de elecciones");
            return;
        }

        Task<Integer> task = createTaskEscaneoMain(documentoElectoral, null, true);

        task.stateProperty().addListener(new ChangeListener<Worker.State>() {
            @Override
            public void changed(ObservableValue<? extends Worker.State> observableValue, Worker.State oldState, Worker.State newState) {
                if (newState == Worker.State.RUNNING) {
                    scene.setCursor(javafx.scene.Cursor.WAIT);
                }
                else if (newState == Worker.State.SUCCEEDED) {
                    procesarActasConvencionalesEscaneoExitoso(task, documentoElectoral);
                    finalizarActasConvencionalesEscaneo();
                }
                else if (newState == Worker.State.FAILED) {
                    AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, MSG_ERROR_SCAN1);
                    finalizarActasConvencionalesEscaneo();
                }
            }
        });

        bEscaneando = true;
        scene.setCursor(javafx.scene.Cursor.WAIT);

        new Thread(task).start();

        desabilitarBotones(true);
        mainStage.requestFocus();
        scene.setCursor(javafx.scene.Cursor.WAIT);

    }
    
    private void procesarActasConvencionalesEscaneoExitoso(Task<Integer> task, DocumentoElectoral documentoElectoral) {
        Integer iTask = task.getValue();

        if (iTask == 1) {
            scene.setCursor(javafx.scene.Cursor.DEFAULT);
            mostrarResultadosActasConvencionales(documentoElectoral);
        } else if (iTask == 0) {
            AppController.mostrarMensajeErrorDesdeLib(mainStage, strValRetFromLib, null);
        } else if (iTask < 0) {
            AppController.mostrarMensajeError(mainStage, iTask, null);
        }
    }
    
    private void mostrarResultadosActasConvencionales(DocumentoElectoral documentoElectoral) {
        int actasLote = listActasDigtalRec.size();
        int actasNoRec = listActasDigitalBarNoRec.size();
        int actasNoSave = listActasDigitalNoSave.size();

        String strMsg = String.format("Se digitalizaron %d documentos electorales.%n", actasLote);
        strMsg = strMsg + ((actasNoRec > 0) ? String.format("Hay %d documentos no reconocidos.", actasNoRec) : "");
        strMsg = strMsg + ((actasNoSave > 0) ? String.format("Hay %d documentos rechazados.", actasNoSave) : "");

        EventHandler<ActionEvent> continueEvent = (ActionEvent event) -> {
            stageMsgBox.close();
            
            if (actasNoRec > 0) {
                onIniciarIngresoManualBarNoRec(documentoElectoral, 0);
            }else if (actasNoSave > 0) {
                mostrarMensajesActasNoGuardadas(0);
            }
        };

        EventHandler<ActionEvent> cancelEvent = (ActionEvent event) -> stageMsgBox.close();
        
        boolean hayProblemas = actasNoRec > 0 || actasNoSave > 0;
        
        if (hayProblemas) {
            stageMsgBox = AppController.handleMessageBoxModal(mainStage,
                Messages.typeMessage.WARNING,
                Messages.addButtons.OKCANCEL,
                strMsg, continueEvent, cancelEvent);
        } else {
            stageMsgBox = AppController.handleMessageBoxModal(mainStage,
                Messages.typeMessage.CHECK,
                Messages.addButtons.ONLYOK,
                strMsg, cancelEvent);
        }
    }
    
    private void finalizarActasConvencionalesEscaneo() {
        bEscaneando = false;
        desabilitarBotones(false);
        scene.setCursor(javafx.scene.Cursor.DEFAULT);
    }

    private void onIniciarEscaneoResoluciones(DocumentoElectoral docElectoral, String numeroResolucion)  
    {
        Task<Integer> task = createTaskEscaneoMain(docElectoral, numeroResolucion, false);

        task.stateProperty().addListener(new ChangeListener<Worker.State>() {
            @Override
            public void changed(ObservableValue<? extends Worker.State> observableValue, Worker.State oldState, Worker.State newState) {
                if (newState == Worker.State.RUNNING) {
                    scene.setCursor(javafx.scene.Cursor.WAIT);
                }
                else if (newState == Worker.State.SUCCEEDED) {
                    procesarResolucionesEscaneoExitoso(task, docElectoral, numeroResolucion);
                    finalizarResolucionesEscaneo();
                }
                else if (newState == Worker.State.FAILED) {
                    AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, MSG_ERROR_SCAN1);
                    finalizarResolucionesEscaneo();
                }
            }
        });

        bEscaneando = true;
        scene.setCursor(javafx.scene.Cursor.WAIT);

        new Thread(task).start();

        desabilitarBotones(true);
        mainStage.requestFocus();

        scene.setCursor(javafx.scene.Cursor.WAIT);
    }
    
    private void procesarResolucionesEscaneoExitoso(Task<Integer> task, DocumentoElectoral docElectoral, String numeroResolucion) {
        Integer iTask = task.getValue();

        if (iTask == 1) {
            scene.setCursor(javafx.scene.Cursor.DEFAULT);

            iTask = onMostrarResolucionEscaneada(strValRetFromLib, docElectoral, numeroResolucion, -1, false);

            if (iTask == 0) {
                AppController.mostrarMensajeErrorDesdeLib(mainStage, strValRetFromLib, null);
            } else if (iTask == -136) {
                if (strValRetFromLib.isEmpty()) {
                    AppController.mostrarMensajeError(mainStage, -136, null);
                } else {
                    AppController.handleMessageBoxModal(mainStage,
                            Messages.typeMessage.WARNING, strValRetFromLib);
                }
            } else if (iTask < 0) {
                AppController.mostrarMensajeError(mainStage, iTask, null);
            }
        }
    }
    
    private void finalizarResolucionesEscaneo() {
        bEscaneando = false;
        desabilitarBotones(false);
        scene.setCursor(javafx.scene.Cursor.DEFAULT);
    }

    private void mostrarFinalizacionEscaneoListasElectores(int index, boolean iniciar) {

        EventHandler<ActionEvent> okfinEvent = (ActionEvent event) -> {
            stageMsgBox.close();

            if (index + 1 < listaElectores.size()) {
                mostrarFinalizacionEscaneoListasElectores(index + 1, false);
            }
        };

        if (iniciar) {
            if (contarCompletasListaElect() > 0) {
                stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.CHECK,
                        "Se digitalizaron las Listas de Electores: " + obtenerCompletasListaElect(), okfinEvent);
            } else {
                mostrarFinalizacionEscaneoListasElectores(0, false);
            }

        } else {
            if (index < listaElectores.size()) {
                //buscando Errores en la lista
                if (listaElectores.get(index).getEstado() == ConstantDigitalizacion.N_ESTADO_LE_ERROR_HTTP) {
                    stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                            listaElectores.get(index).getMensaje(), okfinEvent);
                } else {
                    mostrarFinalizacionEscaneoListasElectores(index + 1, false);
                }
            }
        }
    }

    private void onReanudarEscaneoListasElectores(DocumentoElectoral docElectoral) {

        if (verificarIncompletasListaElect()) {

            EventHandler<ActionEvent> continueEvent = (ActionEvent event) -> {
                stageMsgBox.close();
                onIniciarEscaneoListasElectores(docElectoral, Boolean.FALSE);
            };

            EventHandler<ActionEvent> finishEvent = (ActionEvent event) -> {
                stageMsgBox.close();
                //meter esto en un Task
                iniciarTaskIniciarLlamadaServiceUploadListaElectores(docElectoral.getDescDocCorto());
            };

            EventHandler<ActionEvent> cancelEvent = (ActionEvent event) -> {
                stageMsgBox.close();

                mostrarFinalizacionEscaneoListasElectores(0, true);
            };

            stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, Messages.addButtons.CONTINUEFINALCANCEL,
                    "Listas incompletas. Escanee las páginas faltantes:\r\n" + obtenerIncompletasListaElect(),
                    continueEvent, finishEvent, cancelEvent);
        }

    }

    private void onIniciarEscaneoListasElectores(DocumentoElectoral docElectoral, boolean iniciarEscaneo) {

        Task<Integer> task = createTaskEscaneoMain(docElectoral, null, iniciarEscaneo);

        task.stateProperty().addListener(new ChangeListener<Worker.State>() {
            @Override
            public void changed(ObservableValue<? extends Worker.State> observableValue, Worker.State oldState, Worker.State newState) {
                if (newState == Worker.State.RUNNING) {
                    scene.setCursor(javafx.scene.Cursor.WAIT);
                }
                else if (newState == Worker.State.SUCCEEDED) {
                    procesarListasElectoresEscaneoExitoso(task, docElectoral);
                    finalizarListasElectoresEscaneo();
                }
                else if (newState == Worker.State.FAILED) {
                    EventHandler<ActionEvent> continueEven = (ActionEvent event) -> {
                        stageMsgBox.close();
                        onReanudarEscaneoListasElectores(docElectoral);
                    };
                    stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                            MSG_ERROR_SCAN1, continueEven);
                    finalizarListasElectoresEscaneo();
                }
            }
        });

        bEscaneando = true;
        scene.setCursor(javafx.scene.Cursor.WAIT);
        new Thread(task).start();
        desabilitarBotones(true);
        mainStage.requestFocus();
        scene.setCursor(javafx.scene.Cursor.WAIT);
    }
    
    private void procesarListasElectoresEscaneoExitoso(Task<Integer> task, DocumentoElectoral docElectoral) {
        EventHandler<ActionEvent> continueEven = (ActionEvent event) -> {
            stageMsgBox.close();
            onReanudarEscaneoListasElectores(docElectoral);
        };

        Integer iTask = task.getValue();

        if (iTask == 1) {
            iniciarTaskIniciarLlamadaServiceUploadListaElectores(docElectoral.getDescDocCorto());
        } else if (iTask == -1) {
            onReanudarEscaneoListasElectores(docElectoral);
        } else if (iTask == 0) {
            stageMsgBox = AppController.mostrarMensajeErrorDesdeLib(mainStage, strValRetFromLib, continueEven);
        } else if (iTask == -999) {
            onMostrarDocumentosBarNoRec(docElectoral);
        } else if (iTask < 0) {
            stageMsgBox = AppController.mostrarMensajeError(mainStage, iTask, continueEven);
        }
    }
    
    private void finalizarListasElectoresEscaneo() {
        bEscaneando = false;
        desabilitarBotones(false);
        scene.setCursor(javafx.scene.Cursor.DEFAULT);
    }

    private void onMostrarFinalizacionEscaneoDocElect(int index, boolean iniciar) {

        EventHandler<ActionEvent> okfin2Event = (ActionEvent event) -> {
            stageMsgBox.close();
            if (index + 1 < scanDocElect.size()) {
                onMostrarFinalizacionEscaneoDocElect(index + 1, false);
            }
        };

        if (iniciar) {
            if (contarCompletosDocElect() > 0) {
                stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.CHECK,
                        String.format("Se digitalizaron %d documentos electorales", contarCompletosDocElect()), okfin2Event);
            } else {
                onMostrarFinalizacionEscaneoDocElect(0, false);
            }
        } else {
            if (scanDocElect.isEmpty()) {
                stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                        "No se reconoció ningun documento electoral", okfin2Event);
            } else if (index < scanDocElect.size()) {
                //buscando Errores en la lista
                if (scanDocElect.get(index).getEstado() == 3) {
                    stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                            scanDocElect.get(index).getMensaje(), okfin2Event);
                } else {
                    onMostrarFinalizacionEscaneoDocElect(index + 1, false);
                }
            }
        }
    }

    private void onReanudarEscaneoDocElec(DocumentoElectoral tipoDocumentoScan, boolean iniciarEscaneo) {

        if (verificarIncompletosDocElect()) {

            EventHandler<ActionEvent> continueEvent = (ActionEvent event) -> {
                stageMsgBox.close();
                onIniciarEscaneoHojasAsistenciaMMyNoSort(tipoDocumentoScan, iniciarEscaneo);
            };

            EventHandler<ActionEvent> cancelEvent = (ActionEvent event) -> {
                stageMsgBox.close();
                onMostrarFinalizacionEscaneoDocElect(0, true);
            };

            String strdocsIncompletos = obtenerIncompletosDocElect();

            stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, Messages.addButtons.CONTINUECANCEL,
                    "Hay documentos electorales incompletos para volver a escanear: " + strdocsIncompletos,
                    continueEvent, null, cancelEvent);
        } else {
            onMostrarFinalizacionEscaneoDocElect(0, true);
        }
    }

    private void renombrarDocumentosHojaAsistenciaBarNoRec( String nombreArchivoIngresado, String strPathNameSource) {
        String nuevoNombreArchivo = nombreArchivoIngresado + ConstantDigitalizacion.EXTENSION_TIF;

        File file = new File(strPathNameSource);

        if (onRenombrarFile(file.getParent(), file.getName(), nuevoNombreArchivo)) {
            int idx = generarIdxDocElect(nuevoNombreArchivo, 2);
            int nPag = Integer.parseInt(nuevoNombreArchivo.substring(6, 8));
            String descDocCorto = ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA;
            scanDocElect.get(idx).getPaginas().get(nPag - 1).setArchivo(nuevoNombreArchivo);
            scanDocElect.get(idx).getPaginas().get(nPag - 1).setDescDocCorto(descDocCorto);
            actualizarEstadoScanDocElec(idx);
        }
    }

    private Task<Integer> createTaskGuardarDocsHojaAsistenciaBarNoRec() {
        return new Task<Integer>() {
            @Override
            protected Integer call() throws Exception {
                return guardarDocElec();
            }
        };
    }

    private void onIniciarGuardadoHojaAsistenciaBarNoRec(DocumentoElectoral tipoDocumentoScan) {

        Task<Integer> task = createTaskGuardarDocsHojaAsistenciaBarNoRec();

        TaskExecutor.ejecutarTarea(
            task,
            scene,
            iTask -> {
                EventHandler<ActionEvent> continueEven = (ActionEvent event) -> {
                    stageMsgBox.close();
                    onReanudarEscaneoDocElec(tipoDocumentoScan, false);
                };

                //1:ok 0:conexion o error desde lib, -1 incompletos -15 lib no retorno datos
                if (iTask == 1) {
                    onMostrarFinalizacionEscaneoDocElect(0, true);
                } else if (iTask == -1) {
                    onReanudarEscaneoDocElec(tipoDocumentoScan, false);
                } else if (iTask == 0) {
                    stageMsgBox = AppController.mostrarMensajeErrorDesdeLib(mainStage, strValRetFromLib, continueEven);
                } else if (iTask < -1) {
                    stageMsgBox = AppController.mostrarMensajeError(mainStage, iTask, continueEven);
                }
            },
            () -> AppController.handleMessageBoxModal(mainStage,
                    Messages.typeMessage.WARNING,
                    "Error al ejecutar el guardado de documentos electorales"),
            disabled -> {
                desabilitarBotones(disabled);
                if (!disabled) {
                    mainStage.requestFocus();
                }
            }
        );
    }

    private void onIniciarIngresoManualBarNoRec(DocumentoElectoral docElectoral, int index) {

        if (index < listActasDigitalBarNoRec.size()) {
            cargarRenombrarActasController(docElectoral, index);
        } else {
            finalizarIngresoManualBarNoRec(docElectoral);
        }
    }
    
    private void cargarRenombrarActasController(DocumentoElectoral docElectoral, int index) {
        try {
            FXMLLoader fxmlLoader = loadFXML("RenombrarActas");
            fxmlLoader.setBuilderFactory(new JavaFXBuilderFactory());
            fxmlLoader.load();

            RenombrarActasController renombrarActasController = fxmlLoader.getController();
            renombrarActasController.setMainClassStage(this.mainClassStage);
            renombrarActasController.setMainStage(this.mainStage);
            renombrarActasController.setStageParent(this.mainStage);
            renombrarActasController.init();

            EventHandler<WindowEvent> eventHiden = (WindowEvent event) -> 
                procesarRenombramientoBarNoRec(docElectoral, index, renombrarActasController);

            renombrarActasController.setActasDigital(listActasDigitalBarNoRec.get(index));
            renombrarActasController.setDocElectoral(docElectoral);
            renombrarActasController.setEventHiden(eventHiden);
            renombrarActasController.loadImage();
        } catch (IOException e) {
            logger.warn("Error loading image", e);
        }
    }
    
    private void procesarRenombramientoBarNoRec(DocumentoElectoral docElectoral, int index, RenombrarActasController renombrarActasController) {
        String nombreArchivoIngresado = renombrarActasController.getNumActa();

        if (nombreArchivoIngresado == null) {
            onIniciarIngresoManualBarNoRec(docElectoral, index + 1);
            return;
        }

        if (esHojaAsistenciaMMesa(docElectoral) > 0) {
            procesarHojaAsistenciaBarNoRec(docElectoral, index, nombreArchivoIngresado);
        } else if (esActa(docElectoral) > 0) {
            procesarActaBarNoRec(docElectoral, index, nombreArchivoIngresado);
        } else if (docElectoral.getDescDocCorto().equals(ConstantDigitalizacion.ABREV_LISTA_ELECTORES)) {
            procesarListaElectorBarNoRec(docElectoral, index, nombreArchivoIngresado);
        } else {
            onIniciarIngresoManualBarNoRec(docElectoral, index + 1);
        }
    }
    
    private void procesarHojaAsistenciaBarNoRec(DocumentoElectoral docElectoral, int index, String nombreArchivoIngresado) {
        EventHandler<ActionEvent> okEvent = (ActionEvent event) -> {
            stageMsgBox.close();
            onIniciarIngresoManualBarNoRec(docElectoral, index);
        };

        EventHandler<ActionEvent> okEventnext = (ActionEvent event) -> {
            stageMsgBox.close();
            onIniciarIngresoManualBarNoRec(docElectoral, index + 1);
        };

        if (!verificarDigitoChequeoSimple(nombreArchivoIngresado)) {
            stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                    "El número de documento ingresado no es válido. Vuelva a ingresar los datos.", okEvent);
            return;
        }

        if (archivoRegistrado(nombreArchivoIngresado + ConstantDigitalizacion.EXTENSION_TIF)) {
            stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                    "El número de documento se encuentra agregado.", okEvent);
            return;
        }

        renombrarDocumentosHojaAsistenciaBarNoRec(nombreArchivoIngresado, listActasDigitalBarNoRec.get(index).getStrNomFile());
        stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.CHECK,
                ConstantMensajes.CODIGO_BARRAS_VALIDADO_CORRECTAMENTE, okEventnext);
    }
    
    private void procesarActaBarNoRec(DocumentoElectoral docElectoral, int index, String nombreArchivoIngresado) {
        EventHandler<ActionEvent> okEvent = (ActionEvent event) -> {
            stageMsgBox.close();
            onIniciarIngresoManualBarNoRec(docElectoral, index);
        };

        EventHandler<ActionEvent> okEventnext = (ActionEvent event) -> {
            stageMsgBox.close();
            onIniciarIngresoManualBarNoRec(docElectoral, index + 1);
        };

        String nuevoNombreArchivo = nombreArchivoIngresado + ConstantDigitalizacion.EXTENSION_TIF;
        
        if (!validacionSimpleNombreImagen(nuevoNombreArchivo)) {
            stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                    "El código de barras ingresado no es válido para las actas.", okEvent);
            return;
        }
        
        if (actaNoValidaEnElecciones(nuevoNombreArchivo)) {
            stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                    "Dígito de chequeo inválido.", okEvent);
            return;
        }

        ActasDigitalEstado actaDigitalNoRec = listActasDigitalBarNoRec.get(index);
        Path path = Paths.get(actaDigitalNoRec.getStrNomFile());
        
        onRenombrarFile(GlobalDigitalizacion.getFullRutaArchivosAppData(), path.getFileName().toString(), nuevoNombreArchivo);
        
        String pathFileActualizado = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), nuevoNombreArchivo).toString();
        actaDigitalNoRec.setStrActaCopia(nombreArchivoIngresado);
        actaDigitalNoRec.setStrNomFile(pathFileActualizado);

        stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.CHECK,
                ConstantMensajes.CODIGO_BARRAS_VALIDADO_CORRECTAMENTE, okEventnext);
    }
    
    private void procesarListaElectorBarNoRec(DocumentoElectoral docElectoral, int index, String nombreArchivoIngresado) {
        EventHandler<ActionEvent> okEvent = (ActionEvent event) -> {
            stageMsgBox.close();
            onIniciarIngresoManualBarNoRec(docElectoral, index);
        };

        EventHandler<ActionEvent> okEventnext = (ActionEvent event) -> {
            stageMsgBox.close();
            onIniciarIngresoManualBarNoRec(docElectoral, index + 1);
        };

        String nomnbreNuevaImagen = nombreArchivoIngresado.concat(ConstantDigitalizacion.EXTENSION_TIF);

        if (!validacionSimpleNombreImagenListaElect(nomnbreNuevaImagen)) {
            stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                    "El número de documento " + nombreArchivoIngresado + " ingresado no es válido.", okEvent);
            return;
        }

        Path path = Paths.get(listActasDigitalBarNoRec.get(index).getStrNomFile());
        onRenombrarFile(GlobalDigitalizacion.getFullRutaArchivosAppData(), path.getFileName().toString(), nomnbreNuevaImagen);

        String pathFileActualizado = Paths.get(GlobalDigitalizacion.getFullRutaArchivosAppData(), nomnbreNuevaImagen).toString();
        listActasDigitalBarNoRec.get(index).setStrActaCopia(nombreArchivoIngresado);
        listActasDigitalBarNoRec.get(index).setStrNomFile(pathFileActualizado);

        int idx = buscarIndiceEnListaElectoresPorMesa(nombreArchivoIngresado);
        int nPagina = Integer.parseInt(nombreArchivoIngresado.substring(8, 10));

        if (listaElectores.get(idx).getPaginas().get(nPagina - 1).getArchivo() != null) {
            stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                    "Ya se encuentra un archivo registrado para la página " + nPagina + ".", okEvent);
            return;
        }

        listaElectores.get(idx).getPaginas().get(nPagina - 1).setArchivo(nomnbreNuevaImagen);
        listaElectores.get(idx).getPaginas().get(nPagina - 1).setDescDocCorto(ConstantDigitalizacion.ABREV_LISTA_ELECTORES);
        actualizarEstadoCompletoIncompletoListaElec(idx);

        stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.CHECK,
                ConstantMensajes.CODIGO_BARRAS_VALIDADO_CORRECTAMENTE, okEventnext);
    }
    
    private void finalizarIngresoManualBarNoRec(DocumentoElectoral docElectoral) {
        switch (docElectoral.getDescDocCorto()) {
            case ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA -> {
                listActasDigitalBarNoRec.clear();
                onIniciarGuardadoHojaAsistenciaBarNoRec(docElectoral);
            }
            case ConstantDigitalizacion.ABREV_LISTA_ELECTORES -> {
                listActasDigitalBarNoRec.clear();
                logger.info("PROCESO FINALIZADO {}", listaElectores);
                if (!obtenerIncompletasListaElect().isEmpty()) {
                    logger.info("SIGUEN LAS INCOMPLETAS ");
                    onReanudarEscaneoListasElectores(docElectoral);
                } else {
                    iniciarTaskIniciarLlamadaServiceUploadListaElectores(docElectoral.getDescDocCorto());
                }
            }
            case ConstantDigitalizacion.ABREV_ACTA_CONVENCIONAL, 
                    ConstantDigitalizacion.ABREV_ACTA_CELESTE, 
                    ConstantDigitalizacion.ABREV_ACTA_EXTRANJERO, 
                    ConstantDigitalizacion.ABREV_ACTA_VOTO_DIGITAL -> 
                iniciarTaskIniciarLlamadaServiceUploadActas(docElectoral.getDescDocCorto());
            default -> logger.warn("PROCESO FINALIZADO {}", listaElectores);

        }
    }

    public boolean archivoRegistrado(String nombreArchivo) {
        if (scanDocElect == null || nombreArchivo == null) {
            return false;
        }

        return scanDocElect.stream()
                .filter(doc -> doc.getPaginas() != null)
                .flatMap(doc -> doc.getPaginas().stream())
                .anyMatch(pagina -> nombreArchivo.equals(pagina.getArchivo()));
    }

    private void onMostrarDocumentosBarNoRec(DocumentoElectoral documentoElectoral) {
        EventHandler<ActionEvent> okEvent = (ActionEvent event) -> {
            stageMsgBox.close();
            onIniciarIngresoManualBarNoRec(documentoElectoral, 0);
        };

        int actasNoRec = listActasDigitalBarNoRec.size();

        stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                "Hay " + actasNoRec + " documentos no reconocidos. Ingrese los códigos de barra manualmente.", okEvent);
    }

    private void onIniciarEscaneoHojasAsistenciaMMyNoSort(DocumentoElectoral tipoDocumentoScan, boolean iniciarEscaneo) 
    {
        Task<Integer> task = createTaskEscaneoMain(tipoDocumentoScan, null, iniciarEscaneo);

        task.stateProperty().addListener(new ChangeListener<Worker.State>() {
            @Override
            public void changed(ObservableValue<? extends Worker.State> observableValue, Worker.State oldState, Worker.State newState) {
                if (newState == Worker.State.RUNNING) {
                    scene.setCursor(javafx.scene.Cursor.WAIT);
                }
                else if (newState == Worker.State.SUCCEEDED) {
                    procesarHojasAsistenciaEscaneoExitoso(task, tipoDocumentoScan);
                    finalizarHojasAsistenciaEscaneo();
                }
                else if (newState == Worker.State.FAILED) {
                    EventHandler<ActionEvent> continueEven = (ActionEvent event) -> {
                        stageMsgBox.close();
                        onReanudarEscaneoDocElec(tipoDocumentoScan, false);
                    };
                    stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                            MSG_ERROR_SCAN1, continueEven);
                    finalizarHojasAsistenciaEscaneo();
                }
            }
        });

        bEscaneando = true;
        scene.setCursor(javafx.scene.Cursor.WAIT);
        new Thread(task).start();
        desabilitarBotones(true);
        mainStage.requestFocus();
        scene.setCursor(javafx.scene.Cursor.WAIT);
    }
    
    private void procesarHojasAsistenciaEscaneoExitoso(Task<Integer> task, DocumentoElectoral tipoDocumentoScan) {
        Integer iTask = task.getValue();
        scene.setCursor(javafx.scene.Cursor.DEFAULT);
        
        EventHandler<ActionEvent> continueEven = (ActionEvent event) -> {
            stageMsgBox.close();
            onReanudarEscaneoDocElec(tipoDocumentoScan, false);
        };

        if ((iTask == 1) || (iTask == -1)) {
            manejarResultadoHojasAsistencia(iTask, tipoDocumentoScan);
        } else if (iTask == 0) {
            stageMsgBox = AppController.mostrarMensajeErrorDesdeLib(mainStage, strValRetFromLib, continueEven);
        } else if (iTask < -1) {
            stageMsgBox = AppController.mostrarMensajeError(mainStage, iTask, continueEven);
        }
    }
    
    private void manejarResultadoHojasAsistencia(int iTask, DocumentoElectoral tipoDocumentoScan) {
        if (!listActasDigitalBarNoRec.isEmpty()) {
            onMostrarDocumentosBarNoRec(tipoDocumentoScan);
        } else {
            if (iTask == 1) {
                onMostrarFinalizacionEscaneoDocElect(0, true);
            } else if (iTask == -1) {
                onReanudarEscaneoDocElec(tipoDocumentoScan, false);
            }
        }
    }
    
    private void finalizarHojasAsistenciaEscaneo() {
        bEscaneando = false;
        desabilitarBotones(false);
        scene.setCursor(javafx.scene.Cursor.DEFAULT);
    }

    private boolean validacionToken() {
        if (!Utils.tiempoPorVencer(dataLogin.getExpToken(), ConstantDigitalizacion.MINUTOS_ANTES_VENCER, 0)) {
            return true;
        }

        if (GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)) {
            dataLogin.setExpToken(obtenerHoraExpiracion(ConstantDigitalizacion.MINUTOS_ADICIONALES));
            return true;
        }

        return this.mainClassStage.refreshToken();
    }


    @FXML
    public void onEscanear() {   

        if (!validacionToken()) {
            return;
        }

        String mensaje = sceService.validarSesionActiva(this.dataLogin.getToken());
        if (!mensaje.isEmpty()) {
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }

        try {
            FXMLLoader fxmlLoader = loadFXML("SelectTipoDocumento");
            fxmlLoader.setBuilderFactory(new JavaFXBuilderFactory());
            fxmlLoader.load();
            SelectTipoDocumentoController selectTipoDocumento = fxmlLoader.getController();
            selectTipoDocumento.setStageParent(this.mainStage);
            selectTipoDocumento.setMainClassStage(mainClassStage);

            EventHandler<WindowEvent> eventHiden = (WindowEvent event) -> {

                actualizaRutasArchivos();

                DocumentoElectoral docElectoral = selectTipoDocumento.getDocumentoElectoral();
                if (docElectoral != null) {
                    String strDescDocCorto = docElectoral.getDescDocCorto();

                    if (strDescDocCorto.equals(ConstantDigitalizacion.ABREV_ACTA_CELESTE)
                            || strDescDocCorto.equals(ConstantDigitalizacion.ABREV_ACTA_CONVENCIONAL)
                            || strDescDocCorto.equals(ConstantDigitalizacion.ABREV_ACTA_EXTRANJERO) ) {
                        onIniciarEscaneoActasConvencionales(docElectoral);
                    } else if (strDescDocCorto.equalsIgnoreCase(ConstantDigitalizacion.ABREV_RESOLUCIONES)
                            || strDescDocCorto.equalsIgnoreCase(ConstantDigitalizacion.ABREV_DENUNCIAS)) {
                        String numeroResolucion = selectTipoDocumento.getNumeroResolucion();
                        onIniciarEscaneoResoluciones(docElectoral, numeroResolucion);
                    } else if (strDescDocCorto.equalsIgnoreCase(ConstantDigitalizacion.ABREV_LISTA_ELECTORES)) {
                        onIniciarEscaneoListasElectores(docElectoral, true);
                    } else if (strDescDocCorto.equalsIgnoreCase(ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA)) {
                        onIniciarEscaneoHojasAsistenciaMMyNoSort(docElectoral, true);
                    }
                }
            };

            selectTipoDocumento.init();
            selectTipoDocumento.setEventHiden(eventHiden);
        } catch (IOException e) {
            logger.error("Error setting event handler", e);
        }

    }

    @FXML
    public void onVerEscaneados() {
        //Se ejecutara desde Listener
    }

    private Task<Boolean> createTaskPuestaCeroBorrarImagenes() {
        return new Task<Boolean>() {

            @Override
            protected Boolean call() throws Exception {

                //..Validando Directorios....
                boolean bSuccess = FileControl.validateDir(GlobalDigitalizacion.getRutaScanPrincipal(), true);
                if (bSuccess) {
                    bSuccess = FileControl.deleteWithChildren(GlobalDigitalizacion.getRutaScanPrincipal() + File.separator + GlobalDigitalizacion.getRutaArchivosImg());
                    if (bSuccess) {
                        bSuccess = FileControl.deleteWithChildren(GlobalDigitalizacion.getRutaScanPrincipal() + File.separator + GlobalDigitalizacion.getRutaArchivosPdf());
                        if (bSuccess) {
                            bSuccess = FileControl.deleteWithChildren(GlobalDigitalizacion.getRutaScanPrincipal() + File.separator + GlobalDigitalizacion.getRutaArchivosNorec());
                        }
                    }
                } else {
                    return false;
                }

                scene.setCursor(javafx.scene.Cursor.WAIT);

                return bSuccess;
            }
        };
    }

    private void confirmaPuestaCero() {
        HttpResp httpResp = this.sceService.confirmarPuestaCero(this.dataLogin.getToken());

        boolean confirma = httpResp.isSuccess();
        int statusCode = httpResp.getStatusCode();
        String message = httpResp.getMessage();

        if (!confirma) {
            if (statusCode > 0) {
                if (httpResp.getMessage().isEmpty()) {
                    message = TEXT_ERROR1 + statusCode + ": " + ListHttpStatusCode.getDescription(statusCode);
                }
            } else {
                //se asume que hay un error en conexion
                if (httpResp.getMessage().isEmpty()) {
                    message = "Error no identificado";
                }
            }
        }
        AppController.handleMessageBoxModal(mainStage, message);
    }

    private void onIniciarPuestaCero() {
        Task<Boolean> task = createTaskPuestaCeroBorrarImagenes();

        TaskExecutor.ejecutarTarea(
            task,
            scene,
            bTask -> {
                if (Boolean.TRUE.equals(bTask)) {
                    confirmaPuestaCero();
                } else {
                    AppController.handleMessageBoxModal(mainStage,
                            Messages.typeMessage.WARNING,
                            "Error al ejecutar el borrado de imágenes");
                }
            },
            () -> AppController.handleMessageBoxModal(mainStage,
                    Messages.typeMessage.WARNING,
                    "Error al ejecutar el borrado de imágenes"),
            disabled -> {
                desabilitarBotones(disabled);
                if (!disabled) {
                    mainStage.requestFocus();
                }
            }
        );
    }

    public void iniciarPuestaCero() {

        actualizaRutasArchivos();

        EventHandler<ActionEvent> yesEvent = (ActionEvent event) -> {
            stageMsgBox.close();
            onIniciarPuestaCero();
        };

        EventHandler<ActionEvent> noEvent = (ActionEvent event) -> {
            stageMsgBox.close();
            mainClassStage.onCerrarSesion();
        };

        stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, Messages.addButtons.YESNO,
                "Se ha realizado la puesta a cero en el sistema.\r\nSe deben borrar todas las imágenes del repositorio: " + GlobalDigitalizacion.getRutaScanPrincipal() + File.separator + GlobalDigitalizacion.getRutaArchivos() + "\r\n"
                + "Puede hacer una copia de seguridad antes de iniciar\r\n"
                + "¿Desea iniciar el borrado de imágenes?",
                yesEvent, noEvent);
    }
    
    public void setMainClassStage(IMainController mainClassStage) {
        this.mainClassStage = mainClassStage;
    }
    
    public void setMainStage(Stage mainStage) {
        this.mainStage = mainStage;
    }
}
