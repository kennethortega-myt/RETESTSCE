package pe.gob.onpe.scescanner.controller;

import javafx.beans.value.ChangeListener;
import javafx.embed.swing.SwingFXUtils;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.TextField;
import javafx.scene.control.Tooltip;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.AnchorPane;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;
import org.opencv.core.Mat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion;
import pe.gob.onpe.scescanner.common.dll.SceOpt;
import pe.gob.onpe.scescanner.common.util.CodeBarUtil;
import pe.gob.onpe.scescanner.common.util.ImageCropParams;
import pe.gob.onpe.scescanner.common.util.ImageViewController;
import pe.gob.onpe.scescanner.common.util.Messages;
import pe.gob.onpe.scescanner.common.view.AppController;
import pe.gob.onpe.scescanner.domain.ActasDigitalEstado;
import pe.gob.onpe.scescanner.domain.DocumentoElectoral;
import pe.gob.onpe.scescanner.service.ISceService;
import pe.gob.onpe.scescanner.service.impl.SceServiceImpl;

import java.awt.image.BufferedImage;
import java.io.File;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.ResourceBundle;

import static pe.gob.onpe.scescanner.common.util.ImagenUtil.cargarImagenMultiPageOCV;
import static pe.gob.onpe.scescanner.common.util.ImagenUtil.cargarImagenRecortadaOCV;
import static pe.gob.onpe.scescanner.common.util.ImageViewController.VISTA_FITHEIGTH;

public class RenombrarActasController implements Initializable {

    @FXML
    private AnchorPane anchorPane;

    private IMainController mainClassStage;

    ISceService sceService;

    @FXML
    ImageView imagePage1;

    @FXML
    private ScrollPane scrollPane;

    private Mat mat2Image;


    @FXML
    ImageView imageView;

    @FXML
    Button btnSiguienteCorte;

    @FXML
    Button btnZoomIn;

    @FXML
    Button btnZoomOut;

    @FXML
    Button btnGirarArchivo;

    @FXML
    Label lblTitleMain;

    @FXML
    Label lblTitleBox1;

    private double currentZoom = 1.0;

    private int vistaActual;

    @FXML
    private TextField textNunActa;

    private static final Logger logger = LoggerFactory.getLogger(RenombrarActasController.class);

    private Stage mainStage;
    private Stage stage;
    private Stage stageParent;

    private String numActa;

    ActasDigitalEstado actaDigitalEstado;
    DocumentoElectoral docElectoral;

    private List<CodeBarUtil> listaCodigoBarras;

    private int indexTipoDocActas;

    BufferedImage bufferedImage;

    private ChangeListener<String> lengthAndPatternListener9;
    private ChangeListener<String> lengthAndPatternListener13;

    public Parent getView() {
        return anchorPane;
    }


    public void setActasDigital(ActasDigitalEstado actaDigital) {
        this.actaDigitalEstado = actaDigital;
    }


    public void setDocElectoral(DocumentoElectoral docElec) {

        this.docElectoral = docElec;

        String desDocCorto = this.docElectoral.getDescDocCorto();

        listaCodigoBarras = CodeBarUtil.obtenerCodigosBarras(desDocCorto);

        // Remover todos los listeners antes de agregar uno nuevo
        textNunActa.textProperty().removeListener(lengthAndPatternListener9);
        textNunActa.textProperty().removeListener(lengthAndPatternListener13);

        if (desDocCorto.equals(ConstantDigitalizacion.ABREV_ACTA_CELESTE)
                || desDocCorto.equals(ConstantDigitalizacion.ABREV_ACTA_CONVENCIONAL)) {
            lblTitleMain.setText("Asigne un número de acta");
            lblTitleBox1.setText("Numero de acta");
            textNunActa.textProperty().addListener(lengthAndPatternListener9);
            indexTipoDocActas = 0;

        } else if (desDocCorto.equals(ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA)) {
            lblTitleMain.setText("Asigne un número de documento");
            lblTitleBox1.setText("Numero de documento");
            textNunActa.textProperty().addListener(lengthAndPatternListener9);
            indexTipoDocActas = 0;

        } else {
            textNunActa.textProperty().addListener(lengthAndPatternListener13);
            indexTipoDocActas = 0;
            lblTitleMain.setText("Asigne un número de documento");
            lblTitleBox1.setText("Numero de documento");
        }
    }

    public void setEventHiden(EventHandler<WindowEvent> eventHiden) {
        stage.setOnHidden(eventHiden);
    }


    @Override
    public void initialize(URL url, ResourceBundle rb) {

        sceService = new SceServiceImpl();

        this.listaCodigoBarras = new ArrayList<>();

        this.numActa = null;

        // Definir listeners combinados (patrón + longitud)
        String pattern = "[a-zA-Z0-9]";

        lengthAndPatternListener9 = (ov, oldValue, newValue) -> {
            // Primero validar longitud
            if (newValue.length() > 9) {
                textNunActa.setText(oldValue);
                return;
            }
            // Luego validar patrón
            if (!newValue.matches(pattern + "*")) {
                textNunActa.setText(oldValue.toUpperCase());
            } else {
                textNunActa.setText(newValue.toUpperCase());
            }
        };

        lengthAndPatternListener13 = (ov, oldValue, newValue) -> {
            if (newValue.length() > 13) {
                textNunActa.setText(oldValue);
                return;
            }
            if (!newValue.matches(pattern + "*")) {
                textNunActa.setText(oldValue.toUpperCase());
            } else {
                textNunActa.setText(newValue.toUpperCase());
            }
        };

        textNunActa.addEventFilter(KeyEvent.KEY_PRESSED, (KeyEvent t) -> {
            if (t.getCode() == KeyCode.ENTER) {
                onAceptarButton();
            }
        });

        Tooltip t = new Tooltip("Siguiente corte de código de barras.");
        btnSiguienteCorte.setTooltip(t);

        Tooltip t1 = new Tooltip("Click para girar archivo permanentemente.");
        btnGirarArchivo.setTooltip(t1);

        Tooltip t2 = new Tooltip("Aumentar tamaño de imagen.");
        btnZoomIn.setTooltip(t2);

        Tooltip t3 = new Tooltip("Disminuir tamaño de imagen.");
        btnZoomOut.setTooltip(t3);

    }

    public void init() {
        try {
            stage = AppController.iniciarStage(stageParent, this.getView(), false);

            this.numActa = null;

            this.indexTipoDocActas = -1;
        } catch (Exception e) {
            logger.error("Error en inicialización", e);
        }
    }

    private int obtenerAnguloCbOrientacion(Integer cbOrienta) {
        int ncbOrienta;
        ncbOrienta = switch (cbOrienta) {
            case ConstantDigitalizacion.DIGTAL_CB_LR ->
                0;
            case ConstantDigitalizacion.DIGTAL_CB_BT ->
                90;
            case ConstantDigitalizacion.DIGTAL_CB_TB ->
                -90;
            case ConstantDigitalizacion.DIGTAL_CB_RL ->
                180;
            default ->
                0;
        };
        return ncbOrienta;
    }
    
    
    @FXML
    public void onSiguienteCorte() {
        if (this.indexTipoDocActas > -1) {
            this.indexTipoDocActas++;
            if (this.indexTipoDocActas >= this.listaCodigoBarras.size()) {
                this.indexTipoDocActas = 0;
            }
            loadImage();
        }
    }

    public void loadImage() {
        
        List<CodeBarUtil> barUtil = CodeBarUtil.obtenerCodigosBarras(docElectoral.getDescDocCorto());
        
        int intentos = 0;
        int maxIntentos = barUtil.size();
        boolean imagenCargada = false;
        int indiceInicial = indexTipoDocActas; // Guardar el índice inicial
        
        while (intentos < maxIntentos && !imagenCargada) {
            try {
                ImageCropParams params = crearImageCropParams(barUtil);
                
                bufferedImage = cargarImagenRecortadaOCV(params);

                if (bufferedImage == null) {
                    throw new IllegalStateException("No se pudo cargar la imagen");
                }

                javafx.scene.image.Image image = SwingFXUtils.toFXImage(bufferedImage, null);
                imagePage1.setImage(image);

                cargarImagen();
                
                imagenCargada = true;
                
            } catch (Exception e) {
                logger.warn("Error al cargar imagen con índice {}: {}", indexTipoDocActas, e.getMessage());
                
                indexTipoDocActas++;
                if (indexTipoDocActas >= barUtil.size()) {
                    indexTipoDocActas = 0;
                }
                
                intentos++;
            }
        }
        
        if (!imagenCargada) {
            indexTipoDocActas = indiceInicial;
            
            AppController.handleMessageBoxModal(stage,
                    Messages.typeMessage.WARNING,
                    "No es posible obtener el corte del código de barras.");
            return;
        }

        stage.show();
        stage.requestFocus();
        textNunActa.requestFocus();

    }
    
    private ImageCropParams crearImageCropParams(List<CodeBarUtil> barUtil) {
        ImageCropParams params = new ImageCropParams();
        params.setRutaImagen(actaDigitalEstado.getStrNomFile());
        params.setLeft(barUtil.get(indexTipoDocActas).getX());
        params.setTop(barUtil.get(indexTipoDocActas).getY());
        params.setWidth(barUtil.get(indexTipoDocActas).getAncho());
        params.setHeight(barUtil.get(indexTipoDocActas).getAlto());
        params.setRotate(obtenerAnguloCbOrientacion(barUtil.get(indexTipoDocActas).getOrientacion()));
        params.setWidthControl((int) imagePage1.getFitWidth());
        params.setHeightControl((int) imagePage1.getFitHeight());
        return params;
    }

    public void cargarImagen() {

        List<Mat> listMat2Image = cargarImagenMultiPageOCV(actaDigitalEstado.getStrNomFile());
        
        if (listMat2Image.isEmpty()) {
            return;
        }
        
        int countImgs = 0;
        mat2Image = listMat2Image.get(countImgs);

        vistaActual = VISTA_FITHEIGTH;

        mostrarImagen();

    }

    public void mostrarImagen() {
        ImageViewController.mostrarImagen(mat2Image, imageView, scrollPane, vistaActual);
    }

    @FXML
    public void zoomIn() {
        currentZoom = ImageViewController.aplicarZoom(mat2Image, imageView, currentZoom, 1.1);
    }

    @FXML
    public void zoomOut() {
        currentZoom = ImageViewController.aplicarZoom(mat2Image, imageView, currentZoom, 0.9);
    }

    

    @FXML
    public void onGirarArchivo() {
        
        final Stage[] stageMsgBox = new Stage[1]; // Array para permitir acceso desde lambdas

        EventHandler<ActionEvent> yesEvent = (ActionEvent event) -> {
            stageMsgBox[0].close();

            String fullPath = actaDigitalEstado.getStrNomFile();
            File file = new File(fullPath);

            String path = file.getParent();           // C:\Users\ncoqchi\AppData\Roaming\SCE\EG2026\C59002\TIF
            String nombreArchivo = file.getName();     // IM0000253.TIF

            int nrotado = SceOpt.rotarPaginaImagen(0, path, nombreArchivo, 1, 180);

            if (this.indexTipoDocActas > -1) {
                this.indexTipoDocActas++;
                if (this.indexTipoDocActas >= this.listaCodigoBarras.size()) {
                    this.indexTipoDocActas = 0;
                }
                loadImage();
            } else {
                loadImage();
            }
        };

        EventHandler<ActionEvent> noEvent = (ActionEvent event)
                -> stageMsgBox[0].close();

        stageMsgBox[0] = AppController.handleMessageBoxModal(
                mainStage,
                Messages.typeMessage.QUESTION,
                Messages.addButtons.YESNO,
                "¿Desea girar la imagen?\n\nADVERTENCIA: El archivo será modificado permanentemente en el repositorio.",
                yesEvent,
                noEvent
        );

    }

    @FXML
    public void onAceptarButton() {

        String mensaje = sceService.validarSesionActiva(mainClassStage.getDataLogin().getToken());
        if (!mensaje.isEmpty()) {
            stage.close();
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }

        if (textNunActa.getText().isEmpty()) {
            AppController.handleMessageBoxModal(stage,
                    Messages.typeMessage.WARNING,
                    "Ingrese un número de documento.");
            return;
        }

        this.numActa = textNunActa.getText();
        stage.close();

    }

    @FXML
    public void onCancelarButton() {
        stage.close();
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
    
    public String getNumActa() {
        return numActa;
    }

}
