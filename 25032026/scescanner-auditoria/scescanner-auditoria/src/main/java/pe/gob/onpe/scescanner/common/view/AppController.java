package pe.gob.onpe.scescanner.common.view;

import javafx.animation.FadeTransition;
import javafx.animation.ScaleTransition;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import javafx.util.Duration;
import pe.gob.onpe.scescanner.common.util.Messages;

import java.io.IOException;

import static pe.gob.onpe.scescanner.common.util.ListaMensajes.obtenerMensaje;


public class AppController {
    
    static Stage stageMessageBox;   
    
    private AppController(){
        
    }
    
    public static FXMLLoader loadFXML(String fxml) throws IOException {
        return new FXMLLoader(AppController.class.getResource("/pe/gob/onpe/scescanner/fxml/" + fxml + ".fxml"));
    }
    
    public static Stage iniciarStage(Stage stageParent, Parent parent, boolean show){
        
        Stage stage = new Stage();
        stage.initOwner(stageParent);
        stage.initModality(Modality.APPLICATION_MODAL);
        stage.initStyle(StageStyle.TRANSPARENT);
        
        Scene scene = new Scene(parent);
        scene.getStylesheets().add("/pe/gob/onpe/scescanner/styles/styles.css");
        scene.setFill(null);
        stage.setScene(scene);
        stage.setMaximized(true);
        if(show)
            stage.show();
        
        return stage;
    }
    
    protected static void scaleTransition(boolean hide, Node node) {

        double time = 200.0;
        double fromValue;
        double toValue;

        if (hide) {
            fromValue = 1.0;
            toValue = 0.0;
        } else {
            fromValue = 0.0;
            toValue = 1.0;
        }
        ScaleTransition stNode = new ScaleTransition(Duration.millis(time), node);
        stNode.setFromX(fromValue);
        stNode.setToX(toValue);
        stNode.setFromY(fromValue);
        stNode.setToY(toValue);
        stNode.setOnFinished(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent e) {
                if (hide) {
                    node.setVisible(false);
                }
            }
        });
        stNode.play();
    }

    protected static void fadeTransition(boolean hide, Node node) {
        if ((hide && node.isVisible()) || (!hide && !node.isVisible())) {
            double timeFade = 300.0;
            double fromValue = 0.0;
            double toValue = 1.0;

            if (hide) {
                fromValue = 1.0;
                toValue = 0.0;
            } else {
                node.setVisible(true);
            }

            FadeTransition ftNode = new FadeTransition(Duration.millis(timeFade), node);
            ftNode.setFromValue(fromValue);
            ftNode.setToValue(toValue);
            ftNode.setOnFinished(new EventHandler<ActionEvent>() {

                @Override
                public void handle(ActionEvent e) {
                    if (hide) {
                        node.setVisible(false);
                    }
                }
            });

            ftNode.play();
        }
    }
    
    public static class MessageBoxParams {
        private final Stage mainStage;
        private final Messages.typeMessage typeMessage;
        private final Messages.addButtons addButtons;
        private final String message;
        private Node nFocus;
        private EventHandler<ActionEvent> yesEvent;
        private EventHandler<ActionEvent> okEvent;
        private EventHandler<ActionEvent> cancelNoEvent;
        private boolean showAndWait;
        
        public MessageBoxParams(Stage mainStage, Messages.typeMessage typeMessage, Messages.addButtons addButtons, String message) {
            this.mainStage = mainStage;
            this.typeMessage = typeMessage;
            this.addButtons = addButtons;
            this.message = message;
            this.showAndWait = false;
        }
        
        public MessageBoxParams setFocus(Node nFocus) {
            this.nFocus = nFocus;
            return this;
        }
        
        public MessageBoxParams setYesEvent(EventHandler<ActionEvent> yesEvent) {
            this.yesEvent = yesEvent;
            return this;
        }
        
        public MessageBoxParams setOkEvent(EventHandler<ActionEvent> okEvent) {
            this.okEvent = okEvent;
            return this;
        }
        
        public MessageBoxParams setCancelNoEvent(EventHandler<ActionEvent> cancelNoEvent) {
            this.cancelNoEvent = cancelNoEvent;
            return this;
        }
        
        public MessageBoxParams setShowAndWait(boolean showAndWait) {
            this.showAndWait = showAndWait;
            return this;
        }
    }
    
    public static Stage handleMessageBoxModal(MessageBoxParams params) {
        try {
            Stage stage = crearStage(params.mainStage);
            Scene scene = stage.getScene();
            
            AnchorPane modalContentMainF = (AnchorPane) scene.lookup("#message_content_main");
            Pane mainPane = (Pane) scene.lookup("#mainPane");
            mainPane.setScaleX(0.0);
            mainPane.setScaleY(0.0);
            
            configurarImagen(scene, params.typeMessage);
            configurarMensaje(scene, params.message);
            
            MessageBoxButtons buttons = obtenerBotones(scene);
            EventHandler<ActionEvent> closeEvent = crearCloseEvent(mainPane, modalContentMainF, stage, params.nFocus);
            
            configurarEventosBotones(buttons, params.yesEvent, params.okEvent, params.cancelNoEvent, closeEvent);
            configurarTeclasBotones(buttons);
            configurarBotonesVisibles(buttons, params.addButtons);
            
            mostrarStage(stage, mainPane, modalContentMainF, params.showAndWait);
            
            return stage;

        } catch (IOException ex) {
            return null;
        }
    }

    
    private static Stage crearStage(Stage mainStage) throws IOException {
        Stage stage = new Stage();
        stage.initOwner(mainStage);
        
        FXMLLoader loader = loadFXML("MesssageBox");
        AnchorPane newApWindow = (AnchorPane) loader.load();
        stage.setMaximized(true);
        stage.initStyle(StageStyle.TRANSPARENT);
        
        Scene scene = new Scene(newApWindow);
        scene.setFill(null);
        stage.setScene(scene);
        
        return stage;
    }
    
    private static void configurarImagen(Scene scene, Messages.typeMessage ptypeMessage) {
        ImageView imgMsg = (ImageView) scene.lookup("#imgMsg");
        Image img = new Image("/pe/gob/onpe/scescanner/images/" + ptypeMessage.getImg() + ".png");
        imgMsg.setImage(img);
    }
    
    private static void configurarMensaje(Scene scene, String message) {
        Label lblMessageMsg = (Label) scene.lookup("#lblMessageMsg");
        lblMessageMsg.setText(message);
        lblMessageMsg.setWrapText(true);
    }
    
    private static MessageBoxButtons obtenerBotones(Scene scene) {
        MessageBoxButtons buttons = new MessageBoxButtons();
        buttons.btnContinue = (Button) scene.lookup("#btnContinue");
        buttons.btnFinish = (Button) scene.lookup("#btnFinish");
        buttons.btnNoMsg = (Button) scene.lookup("#btnNoMsg");
        buttons.btnYesMsg = (Button) scene.lookup("#btnYesMsg");
        buttons.btnOKMsg = (Button) scene.lookup("#btnOKMsg");
        buttons.btnCancelMsg = (Button) scene.lookup("#btnCancelMsg");
        buttons.btnOnlyOKMsg = (Button) scene.lookup("#btnOnlyOKMsg");
        buttons.hboxBotones = (HBox) scene.lookup("#hboxBotones");
        return buttons;
    }
    
    private static EventHandler<ActionEvent> crearCloseEvent(Pane mainPane, AnchorPane modalContentMainF, Stage stage, Node nFocus) {
        return event -> {
            scaleTransition(true, mainPane);
            fadeTransition(true, modalContentMainF);
            modalContentMainF.setMouseTransparent(true);
            stage.close();
            if (nFocus != null) {
                nFocus.requestFocus();
            }
        };
    }
    
    private static void configurarEventosBotones(MessageBoxButtons buttons, EventHandler<ActionEvent> yesEvent, 
                                                  EventHandler<ActionEvent> okEvent, EventHandler<ActionEvent> cancelNoEvent, 
                                                  EventHandler<ActionEvent> closeEvent) {
        if (yesEvent != null) {
            buttons.btnYesMsg.setOnAction(yesEvent);
            buttons.btnContinue.setOnAction(yesEvent);
        }

        if (okEvent != null) {
            buttons.btnYesMsg.setOnAction(okEvent);
            buttons.btnOKMsg.setOnAction(okEvent);
            buttons.btnOnlyOKMsg.setOnAction(okEvent);
            buttons.btnFinish.setOnAction(okEvent);
        } else {
            buttons.btnOKMsg.setOnAction(closeEvent);
            buttons.btnOnlyOKMsg.setOnAction(closeEvent);
        }

        if (cancelNoEvent != null) {
            buttons.btnNoMsg.setOnAction(cancelNoEvent);
            buttons.btnCancelMsg.setOnAction(cancelNoEvent);
        } else {
            buttons.btnNoMsg.setOnAction(closeEvent);
            buttons.btnCancelMsg.setOnAction(closeEvent);
        }
    }
    
    private static void configurarTeclasBotones(MessageBoxButtons buttons) {
        configurarTeclaEnter(buttons.btnContinue);
        configurarTeclaEnter(buttons.btnFinish);
        configurarTeclaEnter(buttons.btnYesMsg);
        configurarTeclaEnter(buttons.btnNoMsg);
        configurarTeclaEnter(buttons.btnOKMsg);
        configurarTeclaEnter(buttons.btnCancelMsg);
        configurarTeclaEnter(buttons.btnOnlyOKMsg);
    }
    
    private static void configurarTeclaEnter(Button button) {
        button.setOnKeyPressed(event -> {
            if (event.getCode().equals(KeyCode.ENTER)) {
                button.fire();
            }
        });
    }
    
    private static void configurarBotonesVisibles(MessageBoxButtons buttons, Messages.addButtons paddButtons) {
        switch (paddButtons) {
            case ONLYOK:
                buttons.hboxBotones.getChildren().retainAll(buttons.btnOnlyOKMsg);
                buttons.btnOnlyOKMsg.setCancelButton(true);
                buttons.btnOnlyOKMsg.requestFocus();
                break;
            case YESNO:
                buttons.hboxBotones.getChildren().retainAll(buttons.btnYesMsg, buttons.btnNoMsg);
                buttons.btnNoMsg.setCancelButton(true);
                buttons.btnNoMsg.requestFocus();
                break;
            case OKCANCEL:
                buttons.hboxBotones.getChildren().retainAll(buttons.btnOKMsg, buttons.btnCancelMsg);
                buttons.btnCancelMsg.setCancelButton(true);
                buttons.btnCancelMsg.requestFocus();
                break;
            case CONTINUECANCEL:
                buttons.hboxBotones.getChildren().retainAll(buttons.btnContinue, buttons.btnCancelMsg);
                buttons.btnCancelMsg.setCancelButton(true);
                buttons.btnCancelMsg.requestFocus();
                break;
            case CONTINUEFINALCANCEL:
                buttons.hboxBotones.getChildren().retainAll(buttons.btnContinue, buttons.btnFinish, buttons.btnCancelMsg);
                buttons.btnCancelMsg.setCancelButton(true);
                buttons.btnCancelMsg.requestFocus();
                break;
            default: 
                break;
        }
    }
    
    private static void mostrarStage(Stage stage, Pane mainPane, AnchorPane modalContentMainF, boolean showAndWait) {
        scaleTransition(false, mainPane);
        fadeTransition(false, modalContentMainF);
        modalContentMainF.setMouseTransparent(false);
        
        stage.toFront();
        stage.isAlwaysOnTop();
        
        if (showAndWait) {
            stage.showAndWait();
        } else {
            stage.show();
        }
    }
    
    private static class MessageBoxButtons {
        Button btnContinue;
        Button btnFinish;
        Button btnNoMsg;
        Button btnYesMsg;
        Button btnOKMsg;
        Button btnCancelMsg;
        Button btnOnlyOKMsg;
        HBox hboxBotones;
    }

    
    public static void handleMessageBoxModal(Stage mainStage, Messages.typeMessage ptypeMessage, String message) {
        MessageBoxParams params = new MessageBoxParams(mainStage, ptypeMessage, Messages.addButtons.ONLYOK, message);
        handleMessageBoxModal(params);
    }
    
    public static Stage handleMessageBoxModal(Stage mainStage, Messages.typeMessage ptypeMessage, String message, EventHandler<ActionEvent> okEvent) {
        MessageBoxParams params = new MessageBoxParams(mainStage, ptypeMessage, Messages.addButtons.ONLYOK, message)
                .setOkEvent(okEvent);
        return handleMessageBoxModal(params);
    }
    
    public static Stage handleMessageBoxModal(Stage mainStage, Messages.typeMessage ptypeMessage, Messages.addButtons paddButtons, String message, 
            EventHandler<ActionEvent> okEvent) {
        MessageBoxParams params = new MessageBoxParams(mainStage, ptypeMessage, paddButtons, message)
                .setOkEvent(okEvent);
        return handleMessageBoxModal(params);
    }
    
    public static Stage handleMessageBoxModal(Stage mainStage, Messages.typeMessage ptypeMessage, Messages.addButtons paddButtons, String message, 
            EventHandler<ActionEvent> okEvent, EventHandler<ActionEvent> cancelNoEvent) {
        MessageBoxParams params = new MessageBoxParams(mainStage, ptypeMessage, paddButtons, message)
                .setOkEvent(okEvent)
                .setCancelNoEvent(cancelNoEvent);
        return handleMessageBoxModal(params);
    }
    
    public static Stage handleMessageBoxModal(Stage mainStage, Messages.typeMessage ptypeMessage, Messages.addButtons paddButtons, String message, 
            EventHandler<ActionEvent> continueEvent, EventHandler<ActionEvent> finishEvent, EventHandler<ActionEvent> cancelNoEvent) {
        MessageBoxParams params = new MessageBoxParams(mainStage, ptypeMessage, paddButtons, message)
                .setYesEvent(continueEvent)
                .setOkEvent(finishEvent)
                .setCancelNoEvent(cancelNoEvent);
        return handleMessageBoxModal(params);
    }
    
    public static void handleMessageBoxModal(Stage mainStage, String message) {
        MessageBoxParams params = new MessageBoxParams(mainStage, Messages.typeMessage.CHECK, Messages.addButtons.ONLYOK, message);
        handleMessageBoxModal(params);
    }
    
    
    public static Stage mostrarMensajeErrorDesdeLib(Stage mainStage, String strMessage, EventHandler<ActionEvent> okEvent) {
        String strTit = "";
        String strMsg = "";
        
        final int title = 1;
        final int titsub = 2;
        final int titsubmsg = 3;
        
        String[] parts = strMessage.split("\\|");
        switch (parts.length) {
        case title:
            strTit = parts[0];
            break;
        case titsub:
            strTit = parts[0];
            strMsg = parts[1];
            break;
        case titsubmsg:
            strTit = parts[0];
            strMsg = parts[2];
            break;
        default:
            break;
        }
        
        if(!strTit.startsWith("Error:")){
            return handleMessageBoxModal(mainStage, Messages.typeMessage.CHECK, strMsg, okEvent);
        }else{
            return handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, strMsg, okEvent);
        }
    }
    
    public static Stage mostrarMensajeError(Stage mainStage, int codMensaje, EventHandler<ActionEvent> okEvent ){
        String strMsg = obtenerMensaje(codMensaje);
        return handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, strMsg, okEvent);
    }
    
    
    public static void addMaxLengthRestriction(TextField textField, int maxLength) {
        textField.textProperty().addListener((ov, oldValue, newValue) -> {   
            if (newValue.length() > maxLength) {
                textField.setText(oldValue);
            }
        });
    }


                
}
