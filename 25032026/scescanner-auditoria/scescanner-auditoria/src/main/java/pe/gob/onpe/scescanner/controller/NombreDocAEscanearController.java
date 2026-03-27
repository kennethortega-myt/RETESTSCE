
package pe.gob.onpe.scescanner.controller;

import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.control.TextField;
import javafx.scene.layout.AnchorPane;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion;
import pe.gob.onpe.scescanner.common.util.Messages;
import pe.gob.onpe.scescanner.common.view.AppController;
import pe.gob.onpe.scescanner.domain.ActasDigitalEstado;
import pe.gob.onpe.scescanner.service.ISceService;
import pe.gob.onpe.scescanner.service.impl.SceServiceImpl;

import java.net.URL;
import java.util.ResourceBundle;

import static pe.gob.onpe.scescanner.common.util.Utils.formatoNumeroDocResol;

/**
 * FXML Controller class
 *
 * @author ncoqchi
 */
public class NombreDocAEscanearController implements Initializable {
    
    IMainController mainClassStage;
    ISceService sceService;
    
    private ActasDigitalEstado actaDigtalEstado;

    @FXML
    private AnchorPane anchorPane;
    
    @FXML
    TextField textNumDocumento;
    
    private static final Logger logger = LoggerFactory.getLogger(NombreDocAEscanearController.class);
    
    private Stage mainStage;
    private Stage stage;
    private Stage stageParent;
    
    private String numeroDocumento;
    
    @Override
    public void initialize(URL url, ResourceBundle rb) {
        sceService = new SceServiceImpl();
    }
    
    public Parent getView(){
       return anchorPane;
    }


    public void setEventHiden(EventHandler<WindowEvent> eventHiden) {
        stage.setOnHidden(eventHiden);
    }
    
    public void init() {
        try{
            stage = AppController.iniciarStage(stageParent, this.getView(), true);
            
            if(numeroDocumento!=null){
                textNumDocumento.setText(numeroDocumento);
            }
        }
        catch (Exception e) {
            logger.error("Error en inicialización", e);
        }
    }
    
    public void setNameDocDigital(String nameDocDigital){
        this.numeroDocumento = nameDocDigital;
    }
    
    public String getNameDocDigital(){
        return numeroDocumento;
    }

    @FXML
    public void onEscanearDoc() {
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());
        
        if(!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }
        
        String numeroDoc = formatoNumeroDocResol(textNumDocumento.getText());
        
        if(numeroDoc.isBlank()){
            AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, "Ingrese un número de documento.");
            return;
        }
        
        if((actaDigtalEstado.getStrTipoActa().equals(ConstantDigitalizacion.ABREV_ACTA_CELESTE) ||
                actaDigtalEstado.getStrTipoActa().equals(ConstantDigitalizacion.ABREV_ACTA_CONVENCIONAL) ||
                actaDigtalEstado.getStrTipoActa().equals(ConstantDigitalizacion.ABREV_ACTA_EXTRANJERO) ||
                actaDigtalEstado.getStrTipoActa().equals(ConstantDigitalizacion.ABREV_ACTA_VOTO_DIGITAL)) &&
                !textNumDocumento.getText().equals(actaDigtalEstado.getStrActa())){
            
            AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, "El número de acta no puede ser modificado.");
            return;
        
        }
        
        this.numeroDocumento = numeroDoc;
        stage.close();
    }
    
    @FXML
    public void onCancelar() {
        this.numeroDocumento = null;
        stage.close();
    }
    
    public void setMainClassStage(IMainController mainClassStage) {
        this.mainClassStage = mainClassStage;
    }
    
    public void setActaDigtalEstado(ActasDigitalEstado actaDigtalEstado) {
        this.actaDigtalEstado = actaDigtalEstado;
    }
    
    public void setMainStage(Stage mainStage) {
        this.mainStage = mainStage;
    }
    
    public void setStageParent(Stage stageParent) {
        this.stageParent = stageParent;
    }
    
}
