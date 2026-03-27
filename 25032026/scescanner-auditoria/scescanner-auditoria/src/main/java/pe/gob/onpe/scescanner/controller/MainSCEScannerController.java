package pe.gob.onpe.scescanner.controller;

import javafx.application.Platform;
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
import javafx.scene.image.Image;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.AnchorPane;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import javafx.stage.WindowEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.gob.onpe.scescanner.IdleListener;
import pe.gob.onpe.scescanner.IdleManager;
import pe.gob.onpe.scescanner.common.constant.ConstantClasesCss;
import pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion;
import pe.gob.onpe.scescanner.common.global.GlobalDigitalizacion;
import pe.gob.onpe.scescanner.common.util.Utils;
import pe.gob.onpe.scescanner.common.view.AppController;
import pe.gob.onpe.scescanner.domain.DocumentoElectoral;
import pe.gob.onpe.scescanner.domain.Login;
import pe.gob.onpe.scescanner.service.ISceService;
import pe.gob.onpe.scescanner.service.impl.SceServiceImpl;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.Date;
import java.util.ResourceBundle;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.TimeUnit;

import static pe.gob.onpe.scescanner.common.util.Utils.obtenerHoraExpiracion;
import static pe.gob.onpe.scescanner.common.view.AppController.loadFXML;



public class MainSCEScannerController implements Initializable, IMainController {

    ISceService sceService;
    
    private Stage mainStage;
    
    @FXML
    Parent anchorPane;
    
    @FXML
    AnchorPane anchorPaneContenido;
    
    @FXML
    AnchorPane anchorPaneDashboard;
    
    @FXML
    private Label lbVersion;

    
    @FXML
    private Button btnMaximize;

    
    @FXML
    AnchorPane anchorPaneMain;
    
    @FXML
    Label lblComputo;

    @FXML
    Label lblUsuario;
    
    private static final Logger logger = LoggerFactory.getLogger(MainSCEScannerController.class);
    
    AnchorPane fxVerEscaneados;
    VerEscaneadosController verEscanadosControl;
    private EventHandler<ActionEvent> closeVerEscaneados;
    
    AnchorPane fxEscanear;
    EscaneoController escanearControl;
    private EventHandler<ActionEvent> verEscaneados;
    
    AnchorPane fxLogin;
    LoginController loginControl;
    private EventHandler<ActionEvent> closeLogin;
    private EventHandler<ActionEvent> initLogin;
    private EventHandler<ActionEvent> loginMinimize;
    private EventHandler<ActionEvent> loginMaximize;
    private EventHandler<ActionEvent> loginClose;
    
    
    private EventHandler<WindowEvent> eventHidenMain;
    private Timer timer;
    
    private Login dataLogin;
    
    private double initX;
    private double initY;
    
    
    @Override
    public void initialize(URL url, ResourceBundle rb) {
        
        eventHidenMain = (WindowEvent event) -> {
            
        };
        
        closeVerEscaneados = (ActionEvent event) ->
            mostrarEscanear();
        
        verEscaneados = (ActionEvent event) -> {
            if(validacionToken()){
                
                String mensaje = sceService.validarSesionActiva(this.dataLogin.getToken());  
                if(!mensaje.isEmpty()){
                    mostrarLoginTokenInvalido();
                    return;
                }
                
                
                mostrarVerEscaneados();
            }
        };
        
        initLogin = (ActionEvent event) -> {
            Login datalogin = loginControl.getDataLogin();
            mostrarDashboard(datalogin);
        };
        
        
        closeLogin = (ActionEvent event) ->{
            mainStage.close();
            Platform.exit();
            System.exit(0);
        };
            
        
        loginMinimize = (ActionEvent event) -> mainStage.setIconified(true);
        loginMaximize = (ActionEvent event) -> mainStage.setMaximized(!mainStage.isMaximized());
        loginClose = (ActionEvent event) -> mainStage.close();
        
        this.lbVersion.setText("SCE-Scanner v"+ ConstantDigitalizacion.VERSION_SCE_SCANNER);
        
        timer = null;
    }
    
    private static void actualizarVarDefualt()
    {
        GlobalDigitalizacion.setCentroComputo(GlobalDigitalizacion.getCentroComputoDef());
        GlobalDigitalizacion.setNomprocCorto(GlobalDigitalizacion.getNomprocCortoDef());
        GlobalDigitalizacion.setUsarSinConexion(GlobalDigitalizacion.getUsarSinConexionDef());
    }
    
    public void mostrarLogin()
    {
        actualizarVarDefualt();
        anchorPaneMain.getChildren().clear();
        anchorPaneMain.getChildren().add(fxLogin);
        loginControl.requestFocusTextUser();
    }
    
    @Override
    public void mostrarLoginTokenInvalido() {
        AppController.mostrarMensajeError(mainStage, -999, null);
        actualizarVarDefualt();
        anchorPaneMain.getChildren().clear();
        anchorPaneMain.getChildren().add(fxLogin);
        loginControl.requestFocusTextUser();
    }
    
    private static void actualizaRutasEscaneo()
    {
        GlobalDigitalizacion.setRutaArchivos(GlobalDigitalizacion.getNomprocCorto() +File.separator+ GlobalDigitalizacion.getCentroComputo());
        GlobalDigitalizacion.setRutaArchivosImg(GlobalDigitalizacion.getNomprocCorto() +File.separator+ GlobalDigitalizacion.getCentroComputo() +File.separator+"TIF");
        GlobalDigitalizacion.setRutaArchivosPdf(GlobalDigitalizacion.getNomprocCorto() +File.separator+ GlobalDigitalizacion.getCentroComputo() +File.separator+"PDF");
        GlobalDigitalizacion.setRutaArchivosNorec(GlobalDigitalizacion.getNomprocCorto() +File.separator+ GlobalDigitalizacion.getCentroComputo() +File.separator+"NO_LEIDAS");
        
        GlobalDigitalizacion.setFullRutaArchivosAppData(System.getenv("APPDATA")+File.separator+ConstantDigitalizacion.NOMBRE_SISTEMA+File.separator+ GlobalDigitalizacion.getRutaArchivosImg());
        GlobalDigitalizacion.setRutaArchivosTemp(System.getenv("TEMP")   +File.separator+ConstantDigitalizacion.NOMBRE_SISTEMA+File.separator+ GlobalDigitalizacion.getRutaArchivosImg());
    }
    
    private static void actualizarVarDataLogin(Login dataLogin){
        GlobalDigitalizacion.setCentroComputo((dataLogin.getCcc().isEmpty())? GlobalDigitalizacion.getCentroComputo() :dataLogin.getCcc());
        GlobalDigitalizacion.setNomprocCorto((dataLogin.getApr().isEmpty())? GlobalDigitalizacion.getNomprocCorto() :dataLogin.getApr());
    }
    
    private void mostrarDashboard(Login dataLogin){
        
        this.dataLogin = dataLogin;
        
        if(dataLogin.getEcc()==1){
            AppController.mostrarMensajeError(mainStage, -1000, null);
            onCerrarSesion();
            return;
        }
        
        anchorPaneMain.getChildren().clear();
        anchorPaneMain.getChildren().add(anchorPaneDashboard);
        lblUsuario.setText(dataLogin.getUserName());
        lblComputo.setText(dataLogin.getCcc() +"-" +dataLogin.getNcc());
        
        if(!GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)){
            actualizarVarDataLogin(this.dataLogin);
        }
        
        actualizaRutasEscaneo();
        
        escanearControl.setDataLogin(dataLogin);
        verEscanadosControl.setDataLogin(dataLogin);
        verEscanadosControl.init();
        
        mostrarEscanear();
        if(dataLogin.getExePc()==1){
            escanearControl.iniciarPuestaCero();
        }
        
        
        
        reloj();
    }
    
    @Override
    public boolean refreshToken(){
        
        if(!Utils.tiempoPorVencer(dataLogin.getExpRefToken(), 0, 0)){
            
            Login ldataLogin = sceService.refreshToken(dataLogin.getRefreshToken());

            if(ldataLogin.getStatus()==200){
                dataLogin.setToken(ldataLogin.getToken());
                dataLogin.setRefreshToken(ldataLogin.getRefreshToken());
                dataLogin.setExpToken(ldataLogin.getExpToken());
                dataLogin.setExpRefToken(ldataLogin.getExpRefToken());
                return true;
            }else{
                onCerrarSesion();
            }
        }else{
            logger.info("Expiró token refresh");
            onCerrarSesion();
        }
        
        return false;
    }
    
    @Override
    public Login getDataLogin() {
        return this.dataLogin;
    }
    
    public boolean validacionToken(){
        if(GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)){
            if(Utils.tiempoPorVencer(dataLogin.getExpToken(), ConstantDigitalizacion.MINUTOS_ANTES_VENCER, 0)){
                dataLogin.setExpToken(obtenerHoraExpiracion(ConstantDigitalizacion.MINUTOS_ADICIONALES));
            }
        } else {
            if(Utils.tiempoPorVencer(dataLogin.getExpToken(), ConstantDigitalizacion.MINUTOS_ANTES_VENCER, 0)){
                //Pedir el refresh
                String msg = "Se ejecutara el refresh del token: " + dataLogin.getToken();
                logger.info(msg);
                boolean refresh = refreshToken();
                if(!refresh){
                    return false;
                }
                msg = "Se refresco la fecha de expiracion: " + dataLogin.getExpToken();
                logger.info(msg);
                msg = "Nuevo token: " + dataLogin.getToken();
                logger.info(msg);
            }
        }
        return true;
    }
    
    @Override
    public int onMostrarResolucionEscaneada(String strDocs, DocumentoElectoral tipoDocumentoScan, String numeroResolucion, long idDoc){   
        return escanearControl.onMostrarResolucionEscaneada(strDocs, tipoDocumentoScan, numeroResolucion, idDoc, true);
    }
    
    @Override
    public void onFinalizoGuardadoDocumento(){
        verEscanadosControl.onFinalizoGuardadoDocumento();
    }
    
    private void mostrarVerEscaneados(){
        anchorPaneContenido.getChildren().clear();
        anchorPaneContenido.getChildren().add(fxVerEscaneados);
        verEscanadosControl.updateListSelected();
    }
    
    private void mostrarEscanear(){
        anchorPaneContenido.getChildren().clear();
        anchorPaneContenido.getChildren().add(fxEscanear);        
    }
    
    public void init() {
        
        this.sceService = new SceServiceImpl();
        
        try{
            Scene scene = new Scene(this.getView());
            scene.setFill(Color.TRANSPARENT);
            scene.getStylesheets().add("/pe/gob/onpe/scescanner/styles/styles.css");
            mainStage.setScene(scene);
            mainStage.setFullScreenExitHint("");
            mainStage.initStyle(StageStyle.TRANSPARENT);
            mainStage.setTitle("SCE-Escaneo");
            
            barraStagePrincipal(mainStage);
            
            mainStage.setMaximized(true);
            //Datos para la barra de estado.........
            mainStage.setOnHidden(eventHidenMain);
            
            mainStage.getIcons().add(new Image("/pe/gob/onpe/scescanner/images/ico_onpe.png"));


            IdleListener.attachTo(scene);
            IdleManager.getInstance().start(ConstantDigitalizacion.SEGUNDOS_INACTIVIDAD, () -> {
                logger.info("Tiempo de inactividad agotado");
                Platform.runLater(this::onCerrarSesion);
            });
                        
            
        }
        catch (Exception e) {
            logger.error("Error en inicialización", e);
        }
        
        try {
            FXMLLoader fxmlLoader;
            fxmlLoader = loadFXML("VerEscaneados");
            fxmlLoader.setBuilderFactory(new JavaFXBuilderFactory());
            fxVerEscaneados = (AnchorPane)fxmlLoader.load();
            
            verEscanadosControl = fxmlLoader.getController();
            verEscanadosControl.setMainClassStage(this);
            verEscanadosControl.setMainStage(mainStage);
            verEscanadosControl.setEventHiden(closeVerEscaneados);
            verEscanadosControl.setDataLogin(dataLogin);
            
        } catch (IOException e) {
            logger.error("Error loading VerEscaneados", e);
        }
        
        try {
            FXMLLoader fxmlLoader;
            fxmlLoader = loadFXML("Escaneo");
            fxmlLoader.setBuilderFactory(new JavaFXBuilderFactory());
            fxEscanear = (AnchorPane)fxmlLoader.load();
            
            escanearControl = fxmlLoader.getController();
            escanearControl.setMainClassStage(this);
            escanearControl.setMainStage(mainStage);
            escanearControl.setEventVerEscaneados(verEscaneados);
            escanearControl.init();
            
        } catch (IOException e) {
            logger.error("Error loading Escaneo", e);
        }
        
        try {
            FXMLLoader fxmlLoader;
            fxmlLoader = loadFXML("Login");
            fxmlLoader.setBuilderFactory(new JavaFXBuilderFactory());
            fxLogin = (AnchorPane)fxmlLoader.load();
            
            loginControl = fxmlLoader.getController();
            loginControl.setMainStage(mainStage);
            loginControl.setEventCloseLogin(closeLogin);
            loginControl.setEventInitLogin(initLogin);
            loginControl.setEventLoginMinimize(loginMinimize);
            loginControl.setEventLoginMaximize(loginMaximize);
            loginControl.setEventLoginClose(loginClose);
            
            loginControl.init();
            
        } catch (IOException e) {
            logger.error("Error loading Login", e);
        }
        
        mostrarLogin();
        
        mainStage.show();
    }
    
    public Parent getView() {
        return anchorPane;
    }

    private void reloj()
    {
        if(timer==null){
            timer = new Timer();
            timer.scheduleAtFixedRate(new TimerTask() {
                @Override
                public void run() {
                    Platform.runLater(() -> {
                        Date ahora = new Date();
                        
                        long faltante = dataLogin.getExpToken().getTime() - ahora.getTime();
                        long secfaltante = TimeUnit.MILLISECONDS.toSeconds(faltante);
                        
                        String msg = "Finaliza: "+ dataLogin.getExpToken() + " - ahora: " + ahora + " - Faltante: " + secfaltante;
                        logger.info(msg);
                        
                        if(ahora.getTime()>=dataLogin.getExpToken().getTime()){
                            onCerrarSesion();
                        }
                    });
                }
            }, 0, TimeUnit.MINUTES.toMillis(ConstantDigitalizacion.MINUTOS_VERIFICACION));
            //Inicia despues de 0 segundos, y se ejecuta en intervalos de 5 segundos
        }
    }
    
    @Override
    @FXML
    public void onCerrarSesion(){
        
        String username = this.dataLogin.getUserName();
        String token = this.dataLogin.getToken();
        
        this.sceService.cerrarSesion(username, token);
        
        mostrarLogin();
        
        if(timer!=null){
            logger.info("Tiempo cancelado");
            timer.cancel();
            timer=null;
        }
    }
    
    public void barraStagePrincipal(Stage stage) {

        Scene scene = stage.getScene();
        AnchorPane anchorPanes = (AnchorPane) scene.getRoot();
        
        anchorPanes.setOnMousePressed((MouseEvent me) -> {
            if (!stage.isMaximized()) {
                initX = me.getScreenX() - stage.getX();
                initY = me.getScreenY() - stage.getY();
            }
        });

        anchorPanes.setOnMouseDragged((MouseEvent me) -> {
            if (!stage.isMaximized()) {
                stage.setX(me.getScreenX() - initX);
                stage.setY(me.getScreenY() - initY);
            }
        });
        
        mainStage.maximizedProperty().addListener((obs, wasMaximized, isNowMaximized) -> {
            if (isNowMaximized) {
                AnchorPane.setTopAnchor(anchorPaneMain, 0.0);
                AnchorPane.setRightAnchor(anchorPaneMain, 0.0);
                AnchorPane.setBottomAnchor(anchorPaneMain, 0.0);
                AnchorPane.setLeftAnchor(anchorPaneMain, 0.0);
                
                btnMaximize.getStyleClass().remove(ConstantClasesCss.BUTTON_WIN_MAXIMIZE);
                if (!btnMaximize.getStyleClass().contains(ConstantClasesCss.BUTTON_WIN_RESTORE)) {
                    btnMaximize.getStyleClass().add(ConstantClasesCss.BUTTON_WIN_RESTORE);
                }
                btnMaximize.getTooltip().setText("Restaurar");
            } else {
                AnchorPane.setTopAnchor(anchorPaneMain, 5.0);
                AnchorPane.setRightAnchor(anchorPaneMain, 5.0);
                AnchorPane.setBottomAnchor(anchorPaneMain, 5.0);
                AnchorPane.setLeftAnchor(anchorPaneMain, 5.0);
                
                btnMaximize.getStyleClass().remove(ConstantClasesCss.BUTTON_WIN_RESTORE);
                if (!btnMaximize.getStyleClass().contains(ConstantClasesCss.BUTTON_WIN_MAXIMIZE)) {
                    btnMaximize.getStyleClass().add(ConstantClasesCss.BUTTON_WIN_MAXIMIZE);
                }
                btnMaximize.getTooltip().setText("Maximizar");
            }
        });
        
    }
    
    @FXML
    public void onMinimize(){
        mainStage.setIconified(true);
    }
    
    @FXML
    public void onMaximize(){
        mainStage.setMaximized(!mainStage.isMaximized());
    }
    
    @FXML
    public void onClose(){
        onCerrarSesion();
    }
    
    public void setMainStage(Stage mainStage) {
        this.mainStage = mainStage;
    }
        
}
