package pe.gob.onpe.scescanner;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.fxml.JavaFXBuilderFactory;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.bridge.SLF4JBridgeHandler;
import pe.gob.onpe.scescanner.common.global.GlobalDigitalizacion;
import pe.gob.onpe.scescanner.controller.MainSCEScannerController;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

import static pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion.DENY_OPCONFIG;
import static pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion.DENY_SIN_CONEXION;
import static pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion.NOMBRE_SISTEMA;
import static pe.gob.onpe.scescanner.common.view.AppController.loadFXML;

public class App extends Application {

    private static Scene scene;
    
    private static final Logger logger = LoggerFactory.getLogger(App.class);
    
    static {
        // Bridge java.util.logging to SLF4J
        SLF4JBridgeHandler.removeHandlersForRootLogger();
        SLF4JBridgeHandler.install();
    }
        
    public static boolean abrirArchivoParametros()
    {
        String fileName = System.getenv("PROGRAMDATA") + File.separator + NOMBRE_SISTEMA + File.separator + "sce.config";
        boolean readFile = false;
        
        GlobalDigitalizacion.setUsarSinConexion(DENY_SIN_CONEXION);
        GlobalDigitalizacion.setGenerarPdfLe(DENY_OPCONFIG);
                
        GlobalDigitalizacion.setNomprocCortoDef(GlobalDigitalizacion.getNomprocCorto());
        GlobalDigitalizacion.setCentroComputoDef(GlobalDigitalizacion.getCentroComputo());
        GlobalDigitalizacion.setUsarSinConexionDef(GlobalDigitalizacion.getUsarSinConexion());
                        
        if(!new java.io.File(fileName).exists()){
            return false;
        }
                
        try (BufferedReader fileReader = new BufferedReader(new FileReader(fileName));)
        {
            String line;
            
            while ((line = fileReader.readLine()) != null) {
                String[] param = line.split("=");
                if(param.length==2){
                    
                    String key = param[0].trim();
                    String value = param[1].trim();
                    
                    if(key.equalsIgnoreCase("NOMBRE_TWAIN_ESCANER")){
                        GlobalDigitalizacion.setNombreTwainEscaner(value);
                    }
                    else if(key.equalsIgnoreCase("RUTA_SCAN_PRINCIPAL")){
                        GlobalDigitalizacion.setRutaScanPrincipal(value);
                    }
                    else if(key.equalsIgnoreCase("NOMPROC_CORTO")){
                        GlobalDigitalizacion.setNomprocCorto(value);
                        GlobalDigitalizacion.setNomprocCortoDef(GlobalDigitalizacion.getNomprocCorto());
                    }
                    else if(key.equalsIgnoreCase("CENTRO_COMPUTO")){
                        GlobalDigitalizacion.setCentroComputo(value);
                        GlobalDigitalizacion.setCentroComputoDef(GlobalDigitalizacion.getCentroComputo());
                    }
                    else if(key.equalsIgnoreCase("USAR_SIN_CONEXION")){
                        GlobalDigitalizacion.setUsarSinConexion(value);
                        GlobalDigitalizacion.setUsarSinConexionDef(GlobalDigitalizacion.getUsarSinConexion());
                    }
                    else if(key.equalsIgnoreCase("HOST_SERVICE")){
                        GlobalDigitalizacion.setHostService(value);
                    }
                    else if(key.equalsIgnoreCase("GENERAR_PDF_LISTA_ELECT")){
                        GlobalDigitalizacion.setGenerarPdfLe(value);
                    }
                }
            }
            readFile = true;
        } catch (IOException e) {
            logger.error("Error reading configuration file", e);
        }
        return readFile;
    }

    @Override
    public void start(Stage stage) throws IOException {

        abrirArchivoParametros();
        
        FXMLLoader fxmlLoader = loadFXML("MainSCEScanner");
        fxmlLoader.setBuilderFactory(new JavaFXBuilderFactory());
        fxmlLoader.load();

        MainSCEScannerController mainSCEScannerController = fxmlLoader.getController();
        mainSCEScannerController.setMainStage(stage);
        mainSCEScannerController.init();

    }

    public static void setRoot(String fxml) throws IOException {
        scene.setRoot(loadFXML2(fxml));
    }

    private static Parent loadFXML2(String fxml) throws IOException {
        FXMLLoader fxmlLoader = new FXMLLoader(App.class.getResource("/pe/gob/onpe/scescanner/fxml/" + fxml + ".fxml"));
        return fxmlLoader.load();
    }
    
    public static void main(String[] args) {
        launch();
    }
    
}


