package pe.gob.onpe.scescanner.controller;

import javafx.collections.FXCollections;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ListCell;
import javafx.scene.control.TextField;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.gob.onpe.scescanner.common.view.AppController;
import pe.gob.onpe.scescanner.domain.DocumentoElectoral;
import pe.gob.onpe.scescanner.service.ISceService;
import pe.gob.onpe.scescanner.service.impl.SceServiceImpl;

import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.ResourceBundle;

import static pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion.ABREV_DENUNCIAS;
import static pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion.ABREV_RESOLUCIONES;
import static pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion.ITEM_TEXT_SELECCIONAR;
import static pe.gob.onpe.scescanner.common.util.Utils.formatoNumeroDocResol;

public class SelectTipoDocumentoController implements Initializable {

    /**
     * Initializes the controller class.
     */
    ISceService sceService;
      
    private IMainController mainClassStage;
    
    @FXML
    private AnchorPane anchorPane;
    
    @FXML
    private VBox vboxContent;
    
    @FXML
    private VBox vboxSelTipoDoc;
    
    @FXML
    private VBox vboxNumResol;
    
    @FXML
    private TextField textNumResol;
        
    @FXML
    private Label lblNumResol;
    
    private String numeroResolucion;
           
    @FXML
    private ComboBox<DocumentoElectoral> cboTipoDocumento;
    
    @FXML
    private Button btnAceptar;
    
    private static final Logger logger = LoggerFactory.getLogger(SelectTipoDocumentoController.class);

    private Stage stage;
    private Stage stageParent;
    
    private DocumentoElectoral documentoElectoral;
    
    public Parent getView(){
       return anchorPane;
    }


    public void setEventHiden(EventHandler<WindowEvent> eventHiden) {
        stage.setOnHidden(eventHiden);
    }


    public void init() {
        try{
            stage = AppController.iniciarStage(stageParent, this.getView(), true);
            
            cargarComboTipoDocumento();
            
            documentoElectoral = null;
        }
        catch (Exception e) {
            logger.error("Error en inicialización", e);
        }
    }
    
    @Override
    public void initialize(URL url, ResourceBundle rb) {
        sceService = new SceServiceImpl();
        
        AppController.addMaxLengthRestriction(textNumResol, 50);
        
        String pattern = "[a-zA-Z0-9\\- /]*";
        textNumResol.textProperty().addListener((ov, oldValue, newValue) -> {
            if (!newValue.matches(pattern)) {
                textNumResol.setText(oldValue.toUpperCase());
            } else {
                textNumResol.setText(newValue.toUpperCase());
            }
            
            btnAceptar.setDisable(newValue.trim().isEmpty());
        });
    }
    
    private void cargarComboTipoDocumento() {
        
        List<DocumentoElectoral> documentosElectorales = this.sceService.obtenerTiposDocumento(mainClassStage.getDataLogin().getToken());
        
        DocumentoElectoral seleccionar = new DocumentoElectoral();
        seleccionar.setDescDocumento(ITEM_TEXT_SELECCIONAR);

        List<DocumentoElectoral> documentosConSeleccionar = new ArrayList<>();
        documentosConSeleccionar.add(seleccionar); // Agregar el primer elemento
        documentosConSeleccionar.addAll(documentosElectorales); // Agregar el resto de la lista
        
        cboTipoDocumento.getItems().clear();
        cboTipoDocumento.setItems(FXCollections.observableArrayList(documentosConSeleccionar));
        
        cboTipoDocumento.setCellFactory(param -> crearDocumentoListCell());
        cboTipoDocumento.setButtonCell(crearDocumentoListCell());
        
        cboTipoDocumento.getSelectionModel().select(0);
    }
    
    private ListCell<DocumentoElectoral> crearDocumentoListCell() {
        return new ListCell<>() {
            @Override
            protected void updateItem(DocumentoElectoral item, boolean empty) {
                super.updateItem(item, empty);
                if (item == null || empty) {
                    setText(null);
                    setStyle("");
                } else {
                    setText(item.getDescDocumento());
                    setStyle(getEstiloPorNombre(item.getDescDocumento()));
                }
            }
        };
    }
    
    private String getEstiloPorNombre(String nombre) {
        return ITEM_TEXT_SELECCIONAR.equals(nombre)
            ? "-fx-text-fill: gray; -fx-font-size: 15px;"
            : "-fx-text-fill: black;";
    }
    
    @FXML
    public void cboTipoDocumentoOnAction(){
        
        if(cboTipoDocumento.getValue().getDescDocumento().equalsIgnoreCase(ITEM_TEXT_SELECCIONAR)){
            vboxContent.getChildren().setAll(vboxSelTipoDoc);
            btnAceptar.setDisable(true);
            return;
        }
        
        String strDesDocCorto = cboTipoDocumento.getValue().getDescDocCorto();
                
        if(strDesDocCorto.equalsIgnoreCase(ABREV_RESOLUCIONES)||
           strDesDocCorto.equalsIgnoreCase(ABREV_DENUNCIAS)){
            vboxContent.getChildren().setAll(vboxSelTipoDoc, vboxNumResol);
            textNumResol.setText("");
            textNumResol.requestFocus();
            btnAceptar.setDisable(true);
            
            if(strDesDocCorto.equalsIgnoreCase(ABREV_RESOLUCIONES))
                lblNumResol.setText("RESOLUCIÓN/MEMORÁNDUM Nº");
            else if(strDesDocCorto.equalsIgnoreCase(ABREV_DENUNCIAS))
                lblNumResol.setText("DOCUMENTO Nº");
        }else{
            vboxContent.getChildren().setAll(vboxSelTipoDoc);
            btnAceptar.setDisable(false);
        }
    }

    @FXML
    public void onEscanearDocSelected(){
        
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());        
        if(!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }

        int index = cboTipoDocumento.getSelectionModel().getSelectedIndex();
        if(index>-1){
            documentoElectoral = cboTipoDocumento.getSelectionModel().getSelectedItem();
            
            if(documentoElectoral.getDescDocCorto().equalsIgnoreCase(ABREV_RESOLUCIONES)||
               documentoElectoral.getDescDocCorto().equalsIgnoreCase(ABREV_DENUNCIAS)){
                numeroResolucion = textNumResol.getText();
                
                numeroResolucion = formatoNumeroDocResol(numeroResolucion);
                
                if(numeroResolucion.isBlank()){
                    return;
                }
            }
        }
        stage.close();
    }
    
    @FXML
    public void onCancelarDocSelected(){
        documentoElectoral = null;
        stage.close();
        
        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());        
        if(!mensaje.isEmpty()) {
            mainClassStage.mostrarLoginTokenInvalido();
        }
        
    }
    
    public void setMainClassStage(IMainController mainClassStage) {
        this.mainClassStage = mainClassStage;
    }
    
    public String getNumeroResolucion() {
        return numeroResolucion;
    }
    
    public void setStageParent(Stage stageParent) {
        this.stageParent = stageParent;
    }
    
    public DocumentoElectoral getDocumentoElectoral() {
        return documentoElectoral;
    }
    
}
