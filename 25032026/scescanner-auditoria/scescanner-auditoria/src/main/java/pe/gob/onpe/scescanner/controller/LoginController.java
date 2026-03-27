package pe.gob.onpe.scescanner.controller;

import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.concurrent.Task;
import javafx.concurrent.Worker;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.AnchorPane;
import javafx.stage.Stage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.gob.onpe.scescanner.common.constant.ConstantClasesCss;
import pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion;
import pe.gob.onpe.scescanner.common.global.GlobalDigitalizacion;
import pe.gob.onpe.scescanner.common.util.ListHttpStatusCode;
import pe.gob.onpe.scescanner.common.util.Messages;
import pe.gob.onpe.scescanner.common.util.TaskExecutor;
import pe.gob.onpe.scescanner.common.view.AppController;
import pe.gob.onpe.scescanner.domain.Login;
import pe.gob.onpe.scescanner.service.ISceService;
import pe.gob.onpe.scescanner.service.impl.SceServiceImpl;

import java.net.URL;
import java.util.ResourceBundle;

import static pe.gob.onpe.scescanner.common.util.Utils.hashSHA256;


public class LoginController implements Initializable {

    private static final Logger logger = LoggerFactory.getLogger(LoginController.class);

    ISceService sceService;
    
    @FXML
    private AnchorPane anchorPaneLogin;
    
    @FXML
    private Button btnSalir;
    
    @FXML
    private Button btnIngresar;
    
    @FXML
    private Button btnMinimize;
    
    @FXML
    private Button btnMaximize;
    
    @FXML
    private Button btnClose;
    
    @FXML
    private TextField textUser;
    
    @FXML
    private TextField textPassword;
    
    @FXML
    private TextField textPasswordVisible;
    
    @FXML
    private Button btnTogglePassword;
    
    @FXML
    private Label lbVersion;
    
    private Scene scene;
    private Stage mainStage;
    
    private Login dataLogin;
    
    private EventHandler<ActionEvent> initLogin;
        
    @Override
    public void initialize(URL url, ResourceBundle rb) {
        textUser.addEventFilter(KeyEvent.KEY_PRESSED, (KeyEvent t) -> {
            if (t.getCode() == KeyCode.ENTER) {
                textPassword.requestFocus();
            }
        });

        textPassword.addEventFilter(KeyEvent.KEY_PRESSED, (KeyEvent t) -> {
            if (t.getCode() == KeyCode.ENTER) {
                onLogin();
            }
        });
        
        textPasswordVisible.setVisible(false);
        
        btnTogglePassword.setOnMousePressed(event -> {
            textPasswordVisible.setText(textPassword.getText());
            
            textPassword.setVisible(false);
            textPasswordVisible.setVisible(true);
            textPasswordVisible.requestFocus();
            textPasswordVisible.positionCaret(textPasswordVisible.getText().length());
        });

        btnTogglePassword.setOnMouseReleased(event -> {
            textPassword.setText(textPasswordVisible.getText());
            
            // Ocultar el TextField y mostrar el PasswordField
            textPassword.setVisible(true);
            textPasswordVisible.setVisible(false);
            textPassword.requestFocus();
            textPassword.positionCaret(textPassword.getText().length());
        });
        
        textUser.requestFocus();
    }
    
    public void init() {
        this.scene = this.mainStage.getScene();
        
        textPassword.setVisible(true);
        textPasswordVisible.setVisible(false);
        
        this.sceService = new SceServiceImpl();
        
        this.lbVersion.setText("SCE-Scanner v"+ ConstantDigitalizacion.VERSION_SCE_SCANNER);
        
        textUser.requestFocus();
    }
    
    public void requestFocusTextUser(){
        textUser.requestFocus();
    }

    public Parent getView(){
       return anchorPaneLogin;
    }
    
    public void setMainStage(Stage mainStage) {
        this.mainStage = mainStage;
        
        this.mainStage.maximizedProperty().addListener((obs, wasMaximized, isNowMaximized) -> {
            if (isNowMaximized) {
                btnMaximize.getStyleClass().remove(ConstantClasesCss.BUTTON_WIN_MAXIMIZE);
                if (!btnMaximize.getStyleClass().contains(ConstantClasesCss.BUTTON_WIN_RESTORE)) {
                    btnMaximize.getStyleClass().add(ConstantClasesCss.BUTTON_WIN_RESTORE);
                }
                btnMaximize.getTooltip().setText("Restaurar");
            } else {
                btnMaximize.getStyleClass().remove(ConstantClasesCss.BUTTON_WIN_RESTORE);
                if (!btnMaximize.getStyleClass().contains(ConstantClasesCss.BUTTON_WIN_MAXIMIZE)) {
                    btnMaximize.getStyleClass().add(ConstantClasesCss.BUTTON_WIN_MAXIMIZE);
                }
                btnMaximize.getTooltip().setText("Maximizar");
            }
        });
    }
    
    public void setEventCloseLogin(EventHandler<ActionEvent> closeLogin) {
        this.btnSalir.setOnAction(closeLogin);
    }
    
    public void setEventLoginMinimize(EventHandler<ActionEvent> winMinimize) {
        this.btnMinimize.setOnAction(winMinimize);
    }
    
    public void setEventLoginMaximize(EventHandler<ActionEvent> winMaximize) {
        this.btnMaximize.setOnAction(winMaximize);
    }
    
    public void setEventLoginClose(EventHandler<ActionEvent> winClose) {
        this.btnClose.setOnAction(winClose);
    }
        
    public void setEventInitLogin(EventHandler<ActionEvent> initLogin) {
        this.initLogin = initLogin;
    }
    
    private boolean validarPerfil(String perfilUsuario){   

        return ConstantDigitalizacion.USER_PROFILES_PERMITIDOS.contains(perfilUsuario);
    }
    
    private Task<Login> createTaskLogin(String strUser, String strPassword) {
        return new Task<Login>() {
            @Override
            protected Login call() throws Exception {
                dataLogin = sceService.login(strUser, strPassword);
                return dataLogin;
            }
        };
    }

    
    private void iniciarLogin(String strUser, String strPassword){  
        
        textPassword.setVisible(true);
        textPasswordVisible.setVisible(false);
        
        Task<Login> task = createTaskLogin(strUser, strPassword);
        
        TaskExecutor.ejecutarTarea(
            task,
            scene,
            result -> procesarLoginExitoso(),
            () -> AppController.handleMessageBoxModal(mainStage,
                    Messages.typeMessage.WARNING,
                    "Error no especificado."),
            this::desabilitarBotones
        );
    }
    
    private void procesarLoginExitoso() {
        if(dataLogin.getStatus() != 200){
            mostrarErrorLogin();
            return;
        }
        
        if(!validarPerfil(dataLogin.getPer())){
            AppController.handleMessageBoxModal(mainStage,
                            Messages.typeMessage.WARNING,
                            "Perfil de usuario no admitido");
            
            sceService.cerrarSesion(dataLogin.getUserName(), dataLogin.getToken());
            return;
        }
        
        if(ConstantDigitalizacion.ADM_REF.equalsIgnoreCase(hashSHA256(dataLogin.getUserName().toUpperCase()))) {
            GlobalDigitalizacion.setUsarSinConexion(ConstantDigitalizacion.ACCEP_SIN_CONEXION);
        }
        
        if(!GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)&&
            (dataLogin.getCcc().isEmpty()||dataLogin.getApr().isEmpty()) )
        {
            //se logro hacer la conexion pero el token no devolvio el nombre del proceso ni del ccomputo
            AppController.handleMessageBoxModal(mainStage,
                Messages.typeMessage.WARNING,
                "No se encontró nombre de elección y/o centro de cómputo.");
                
            sceService.cerrarSesion(dataLogin.getUserName(), dataLogin.getToken());
        }
        else{
            textUser.setText("");
            textPassword.setText("");
            initLogin.handle(null);
        }
    }
    
    private void mostrarErrorLogin() {
        String strError;
        if(dataLogin.getMessage()!=null){
            strError = dataLogin.getMessage();
        }
        else if(dataLogin.getStatus()>0){
            strError = "Error: "+ dataLogin.getStatus()+", "+ ListHttpStatusCode.getDescription(dataLogin.getStatus());
        }else{
            strError = "Error no especificado";
        }
        AppController.handleMessageBoxModal(mainStage,
                            Messages.typeMessage.WARNING,
                            strError);
    }
    
    private void desabilitarBotones(boolean bDisable)
    {
        btnIngresar.setDisable(bDisable);
        btnSalir.setDisable(bDisable);
        textUser.setDisable(bDisable);
        textPassword.setDisable(bDisable);
    }
    
    
    @FXML
    public void onLogin(){
        
        String strUser = textUser.getText();
        String strPassword = textPassword.getText();
        
        if(!(strUser.isBlank()||strPassword.isBlank())){
            iniciarLogin(strUser, strPassword);
        }
    }


    @FXML
    public void onMinimize(){
        logger.warn("Minimizando");
    }

    @FXML
    public void onMaximize(){
        logger.warn("Maximizando");
    }

    @FXML
    public void onClose(){
        logger.warn("Cerrando");
    }
    
    public Login getDataLogin() {
        return dataLogin;
    }

}
