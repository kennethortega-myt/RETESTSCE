package pe.gob.onpe.scescanner.controller;

import javafx.concurrent.Task;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.image.ImageView;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import javafx.stage.WindowEvent;
import org.opencv.core.Mat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.gob.onpe.scescanner.common.dll.SceOpt;
import pe.gob.onpe.scescanner.common.global.GlobalDigitalizacion;
import pe.gob.onpe.scescanner.common.util.ImageViewController;
import pe.gob.onpe.scescanner.common.util.Messages;
import pe.gob.onpe.scescanner.common.util.TaskExecutor;
import pe.gob.onpe.scescanner.common.view.AppController;
import pe.gob.onpe.scescanner.domain.ActasDigitalEstado;
import pe.gob.onpe.scescanner.domain.DocumentoElectoral;
import pe.gob.onpe.scescanner.service.ISceService;
import pe.gob.onpe.scescanner.service.impl.SceServiceImpl;

import java.io.File;
import java.net.URL;
import java.util.List;
import java.util.ResourceBundle;
import java.util.StringTokenizer;

import static pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion.DIGTAL_DOC_PGADD_LAST;
import static pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion.DIGTAL_DOC_PGINS_HERE;
import static pe.gob.onpe.scescanner.common.dll.SceOpt.escanearResoluciones;
import static pe.gob.onpe.scescanner.common.util.ImageViewController.VISTA_FITHEIGTH;
import static pe.gob.onpe.scescanner.common.util.ImageViewController.VISTA_FITWIDTH;
import static pe.gob.onpe.scescanner.common.util.ImagenUtil.cargarImagenMultiPageOCV;

/**
 * FXML Controller class
 *
 * @author lrestan
 */
public class EditarResolucionController implements Initializable {
    
    private IMainController mainClassStage;
    ISceService sceService;

    @FXML
    private AnchorPane anchorPane;
    
    @FXML
    ScrollPane scrollPane;
        
    @FXML
    ImageView imageView;
    
    @FXML
    Label tituloImagen;
    
    @FXML
    Label pagesImagen;
    
    @FXML
    HBox hboxBotonesTools;
    
    @FXML
    HBox hboxBotonesBasicos;
    
    private static final Logger logger = LoggerFactory.getLogger(EditarResolucionController.class);
        
    private Scene scene;
    private Stage mainStage;
    private Stage stage;
    private Stage stageParent;
    
    private Stage stageMsgBox;
    private boolean guardarDocumento;
    
    private double currentZoom = 1.0;
    
    ActasDigitalEstado actaDigital;
    
    private DocumentoElectoral tipoDocumentoScan;

    
    private Mat mat2Image;
    private List<Mat> listMat2Image;
    private int totImgs;
    private int countImgs;

    private String strValRetFromLib;
    
    private int vistaActual;
    
    public Parent getView(){
       return anchorPane;
    }

    public void setEventHiden(EventHandler<WindowEvent> eventHiden) {
        stage.setOnHidden(eventHiden);
    }
    
    public void setActasDigital(ActasDigitalEstado actaDigital){
        this.actaDigital = actaDigital;        
    }


    @Override
    public void initialize(URL url, ResourceBundle rb) {   
        //Inicio de objetos
        sceService = new SceServiceImpl();
    }
    
    public void init() {
        try{
            stage = new Stage();
            stage.initOwner(stageParent);
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.initStyle(StageStyle.TRANSPARENT);
            scene = new Scene(this.getView());
            scene.getStylesheets().add("/pe/gob/onpe/scescanner/styles/styles.css");
            scene.setFill(null);
            stage.setScene(scene);
            stage.setMaximized(true);
            stage.show();
            
            stage.requestFocus();
            
            tituloImagen.setText(actaDigital.getStrActa());
            
            cargarImagen(0);
        }
        catch (Exception e) {
            logger.error("Error en inicialización", e);
        }
    }
    
    public void cargarImagen(int pagina){
        
        listMat2Image = cargarImagenMultiPageOCV(actaDigital.getStrNomFile());
        if (listMat2Image.isEmpty()) {
            logger.error("No se pudo cargar la imagen: {}", actaDigital.getStrNomFile());
            totImgs = 0;
            mat2Image = null;
            mostrarImagen();
            return;
        }
        totImgs = listMat2Image.size();
        countImgs = (pagina+1>totImgs)?pagina-1:pagina;
        mat2Image = listMat2Image.get(countImgs);
                
        vistaActual = VISTA_FITHEIGTH;
        
        mostrarImagen();
    }
    
    public void mostrarImagen(){
        ImageViewController.mostrarImagen(mat2Image, imageView, scrollPane, vistaActual);
        pagesImagen.setText("Página "+(countImgs+1)+" de "+totImgs);
    }
    
    
    @FXML
    public void zoomIn() {
        
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());
        if(!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }
        
        currentZoom = ImageViewController.aplicarZoom(mat2Image, imageView, currentZoom, 1.1);
    }
    
    @FXML
    public void zoomOut() {
        
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());
        if(!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }
        
        currentZoom = ImageViewController.aplicarZoom(mat2Image, imageView, currentZoom, 0.9);
    }
    
    @FXML
    public void onFitWidth() {
        
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());
        if(!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }
        
        vistaActual = VISTA_FITWIDTH;
        mostrarImagen();
    }
    
    @FXML
    public void onFitHeight() {
        
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());
        if(!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }
        
        vistaActual = VISTA_FITHEIGTH;
        mostrarImagen();
    }
    
    @FXML
    public void onPagAnterior() {
        
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());
        if(!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }
        
        if(countImgs-1>=0){
            countImgs--;
            
            mat2Image = listMat2Image.get(countImgs);
            
            mostrarImagen();
        }
    }
    
    @FXML
    public void onPagSiguiente() {
        
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());
        if(!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }
        
        if(countImgs+1<totImgs){
            countImgs++;
            
            mat2Image = listMat2Image.get(countImgs);
            
            mostrarImagen();
        }
    }
    
    
    private void desabilitarBotones(boolean bDisable)
    {
        hboxBotonesBasicos.setDisable(bDisable);
        hboxBotonesTools.setDisable(bDisable);
    }
    
    private static class ResultadoEscaneo {
        final int codigo;
        final int lastPage;
        
        ResultadoEscaneo(int codigo, int lastPage) {
            this.codigo = codigo;
            this.lastPage = lastPage;
        }
    }
    
    private ResultadoEscaneo onEscaneoResolucionesFinalizado(String strDocs)   
    {
        if(strDocs == null || strDocs.isEmpty()){
            return new ResultadoEscaneo(-15, countImgs);
        }
        
        if(strDocs.startsWith("Error:")){
            return new ResultadoEscaneo(0, countImgs);
        }
        
        int lastPage = procesarResultadoEscaneo(strDocs);
        return new ResultadoEscaneo(1, lastPage);
    }
    
    private int procesarResultadoEscaneo(String strDocs) {
        StringTokenizer tok = new StringTokenizer(strDocs,"|");
        int nTotPages = 0;
        int nLastPage = 0;
        int nCount = 0;
        
        while (tok.hasMoreElements()){
            String strTok = tok.nextElement().toString();
            if(nCount == 1) {
                nTotPages = Integer.parseInt(strTok);
            } else if(nCount == 2) {
                nLastPage = Integer.parseInt(strTok);
            }
            nCount++;
        }
        
        return calcularUltimaPagina(nTotPages, nLastPage);
    }
    
    private int calcularUltimaPagina(int nTotPages, int nLastPage) {
        if(nTotPages > 0 && nLastPage > 0){
            return nLastPage - 1;
        } else {
            return countImgs;
        }
    }
    
    
    private Task<ResultadoEscaneo> createTaskEscanearResolucion(int nTipoDigtalDoc, int nCurrentPage) {
        return new Task<ResultadoEscaneo>() {
            @Override
            protected ResultadoEscaneo call() throws Exception {
                
                int iTipoImgSel    = tipoDocumentoScan.getTipoImagen();
                int iTipoHojaSel   = tipoDocumentoScan.getSizeHojaSel();
                int iImgMultiPage  = tipoDocumentoScan.getImgfileMultiPage();
                int iScanBothPages = tipoDocumentoScan.getScanBothPages();
                
                File file = new File(actaDigital.getStrNomFile());
                String strPath = file.getParent();
                String strFileName = file.getName();
                
                strValRetFromLib = escanearResoluciones(
                                    0, strPath, GlobalDigitalizacion.getRutaArchivosTemp(), GlobalDigitalizacion.getNombreTwainEscaner(),
                                    iTipoImgSel, iTipoHojaSel, iImgMultiPage, iScanBothPages, 300, nTipoDigtalDoc, nCurrentPage,
                                    0, 0, 0, 0, 0,
                                    strFileName, actaDigital.getStrActa(), GlobalDigitalizacion.getNomprocCorto(), GlobalDigitalizacion.getCentroComputo(), 0, 0);
                
                return onEscaneoResolucionesFinalizado(strValRetFromLib);
            }
        };
    }
    
    private void onIniciarEscaneoResoluciones(int nTipoDigtalDoc, int nCurrentPage)
    {
        Task<ResultadoEscaneo> task = createTaskEscanearResolucion(nTipoDigtalDoc, nCurrentPage);
        
        TaskExecutor.ejecutarTarea(
            task,
            scene,
            resultado -> {
                int iTask = resultado.codigo;
                if(iTask==1){
                    limpiarImagenes();
                    cargarImagen(resultado.lastPage);
                }
                else if(iTask==0){
                    AppController.mostrarMensajeErrorDesdeLib(mainStage, strValRetFromLib, null);
                }
                else if(iTask<0){
                    AppController.mostrarMensajeError(mainStage, iTask, null);
                }
            },
            () -> AppController.handleMessageBoxModal(mainStage,
                    Messages.typeMessage.WARNING,
                    "Error al ejecutar escaneo"),
            this::desabilitarBotones
        );
    }
                
    @FXML
    public void onAgregarPagina() {
        
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());
        if(!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }
        onIniciarEscaneoResoluciones(DIGTAL_DOC_PGADD_LAST, 0);
    }
    
    @FXML
    public void onInsertarPagina() {
        
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());
        if(!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }
        onIniciarEscaneoResoluciones(DIGTAL_DOC_PGINS_HERE, countImgs+1);
    }
    
    @FXML
    public void onEliminarPagina() {
        
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());
        if(!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }
        
        
        if(totImgs<=1){
            AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, "No se pueden eliminar mas pàginas del documento.");
            return;
        }
        
        EventHandler<ActionEvent> yesEvent = (ActionEvent event) -> {
            stageMsgBox.close();
                        
            File file = new File(actaDigital.getStrNomFile());
            String strPath = file.getParent();
            String strFileName = file.getName();
            
            if(totImgs>1){
                int result = SceOpt.eliminarPaginaImagen(0, strPath, strFileName, countImgs+1);
                if(result>0){
                    limpiarImagenes();
                    cargarImagen(countImgs);
                }
            }
        };
        
        EventHandler<ActionEvent> noEvent = (ActionEvent event) ->
            stageMsgBox.close();
        
        stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.QUESTION, Messages.addButtons.YESNO,
                "¿Confirma que desea eliminar la página "+(countImgs+1)+" de este documento?",
                yesEvent, noEvent);
        
    }
    
    private void limpiarImagenes(){
        try{
            if(!listMat2Image.isEmpty()){
                for(Mat img: listMat2Image){
                    img.release();
                }
                listMat2Image.clear();
            }
            mat2Image.release();
        }
        catch(Exception e){
            logger.error("Error cerrando ventana", e);
        }
    }
    
    @FXML
    public void onGuardar(){
        
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());
        if(!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }
        
        EventHandler<ActionEvent> yesEvent = (ActionEvent event) -> {
            this.guardarDocumento = true;
            stageMsgBox.close();
            limpiarImagenes();
            stage.close();
        };
        
        EventHandler<ActionEvent> noEvent = (ActionEvent event) -> 
            stageMsgBox.close();
        
        
        stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.QUESTION, Messages.addButtons.YESNO,
                "Se guardará el documento "+actaDigital.getStrActa()+".\r\n"+
                "¿Está seguro de continuar?",
                yesEvent, noEvent);
        
    }
    
    @FXML
    public void onCerrar(){
        
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());
        if(!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }
        
        EventHandler<ActionEvent> yesEvent = (ActionEvent event) -> {
            this.guardarDocumento = false;
            stageMsgBox.close();
            limpiarImagenes();
            stage.close();
        };
        
        EventHandler<ActionEvent> noEvent = (ActionEvent event) ->
            stageMsgBox.close();
                
        stageMsgBox = AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.QUESTION, Messages.addButtons.YESNO,
                "¿Desea cancelar la digitalización del documento "+this.actaDigital.getStrActa()+"?",
                yesEvent, noEvent);
    }
    
    public void setMainClassStage(IMainController mainClassStage) {
        this.mainClassStage = mainClassStage;
    }
    
    public void setMainStage(Stage mainStage) {
        this.mainStage = mainStage;
    }
    
    public void setStageParent(Stage stageParent) {
        this.stageParent = stageParent;
    }
    
    public boolean isGuardarDocumento() {
        return guardarDocumento;
    }
    
    public void setTipoDocumentoScan(DocumentoElectoral tipoDocumentoScan) {
        this.tipoDocumentoScan = tipoDocumentoScan;
    }
    
    public int getTotImgs() {
        return totImgs;
    }
}
