package pe.gob.onpe.scescanner.controller;

import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.image.ImageView;
import javafx.scene.layout.AnchorPane;
import javafx.stage.Stage;
import org.opencv.core.Mat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion;
import pe.gob.onpe.scescanner.common.util.ImageViewController;
import pe.gob.onpe.scescanner.common.util.ImagenUtil;
import pe.gob.onpe.scescanner.common.view.AppController;
import pe.gob.onpe.scescanner.domain.ActasDigitalEstado;
import pe.gob.onpe.scescanner.domain.ListaElectores;

import java.io.File;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.ResourceBundle;

import static pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion.ABREV_LISTA_ELECTORES;
import static pe.gob.onpe.scescanner.common.util.ImageViewController.VISTA_FITHEIGTH;
import static pe.gob.onpe.scescanner.common.util.ImageViewController.VISTA_FITWIDTH;
import static pe.gob.onpe.scescanner.common.util.ImageViewController.VISTA_FULLSIZE;
import static pe.gob.onpe.scescanner.common.util.ImagenUtil.cargarImagenOCV;
import static pe.gob.onpe.scescanner.common.util.ImagenUtil.rotateImagenOCV;
import static pe.gob.onpe.scescanner.common.util.Utils.validacionSimpleNombreImagenListaElect;

public class VerImagenController implements Initializable {

    @FXML
    private AnchorPane anchorPane;
    
    @FXML
    private ScrollPane scrollPane;
        
    @FXML
    private ImageView imageView;
    
    @FXML
    private Label tituloImagen;
    
    @FXML
    private Label pagesImagen;
    
    private static final Logger logger = LoggerFactory.getLogger(VerImagenController.class);

    private Stage stage;
    private Stage stageParent;
    
    private double currentZoom = 1.0;
    
    ActasDigitalEstado actaDigital;

    private List<ListaElectores> listaElectores;
    
    private Mat mat2Image;
    private List<Mat> listMat2Image;
    private int totImgs;
    private int countImgs;
    
    private int vistaActual;
    
    private Parent getView(){
       return anchorPane;
    }

    public void setActasDigital(ActasDigitalEstado actaDigital){
        this.actaDigital = actaDigital;        
    }
            
    @Override
    public void initialize(URL url, ResourceBundle rb) {
        listaElectores = new ArrayList<>();
    }
    
    
    public void init() {
        try {
            stage = AppController.iniciarStage(stageParent, this.getView(), true);
            
            stage.requestFocus();

            tituloImagen.setText(actaDigital.getStrActa());
            
            cargarImagen();
        }
        catch (Exception e) {
            logger.error("Error en inicialización", e);
        }
    }
    
    private int generarIdxListaElect(String strNameImage){
        String strMesa = strNameImage.substring(0, 6);
        int totPages = Integer.parseInt(strNameImage.substring(10, 12));
        int idx = -1;
        
        for(int i=0; i<listaElectores.size(); i++){
            if(listaElectores.get(i).getMesa().equals(strMesa)){
                idx = i;
                break;
            }
        }
        
        if(idx<0){
            listaElectores.add(new ListaElectores(strMesa, totPages, 0));
            idx = generarIdxListaElect(strNameImage);
        }
        
        return idx;
    }
    
    private List<Mat> cargarListaFilesLE(String pathFileNameFolder){
        List<Mat> listMat;
        listMat = new ArrayList<>();
        
        if(!listaElectores.isEmpty()){
            listaElectores.clear();
        }
        
        final File folder = new File(pathFileNameFolder);
        
        for (final File fileEntry : folder.listFiles(
            (dir, name) -> name.toUpperCase().endsWith(".TIF")
        ))
        {
            if (fileEntry.isFile()) {
                String strNameImage = fileEntry.getName().toUpperCase();
                if(validacionSimpleNombreImagenListaElect(strNameImage))
                {
                    int idx = generarIdxListaElect(strNameImage);

                    int nPag = Integer.parseInt(strNameImage.substring(8, 10));

                    listaElectores.get(idx).getPaginas().get(nPag-1).setArchivo(strNameImage);
                }
            }
        }
        
        return listMat;
    }
    
    private Mat obtenerImagenPaginaLE(int nPag)
    {
        String pathFileNameFolder = actaDigital.getStrNomFile();
        String strNameImage = listaElectores.get(0).getPaginas().get(nPag).getArchivo();
        if(strNameImage!=null)
            return cargarImagenOCV(pathFileNameFolder+File.separator+strNameImage);
        
        return null;
    }
    
    public void cargarImagen(){
        
        if(actaDigital.getStrTipoActa().equalsIgnoreCase(ABREV_LISTA_ELECTORES)){
            
            listMat2Image = cargarListaFilesLE(actaDigital.getStrNomFile());
            totImgs = listaElectores.get(0).getPaginas().size();
            countImgs = 0;
            mat2Image = obtenerImagenPaginaLE(countImgs);
            
        } else if(actaDigital.getStrTipoActa().equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_CELESTE)||
                actaDigital.getStrTipoActa().equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_CONVENCIONAL)||
                actaDigital.getStrTipoActa().equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_EXTRANJERO)||
                actaDigital.getStrTipoActa().equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_VOTO_DIGITAL)){
            listMat2Image = ImagenUtil.cargarImagenesOCV(
                    actaDigital.getFullPathImagenes()+File.separator+actaDigital.getArchivoEscrutinio(),
                    actaDigital.getFullPathImagenes()+File.separator+actaDigital.getArchivoInstalacion(),
                    actaDigital.getFullPathImagenes()+File.separator+actaDigital.getArchivoSufragio(),
                    actaDigital.getFullPathImagenes()+File.separator+actaDigital.getArchivoInstalacionSufragio()
            );
            
            if (listMat2Image == null || listMat2Image.isEmpty()) {
                return;
            }
            
            totImgs = listMat2Image.size();
            countImgs = 0;
            mat2Image = listMat2Image.get(countImgs);
        }else if(actaDigital.getStrTipoActa().equalsIgnoreCase(ConstantDigitalizacion.ABREV_RESOLUCIONES)||
                actaDigital.getStrTipoActa().equalsIgnoreCase(ConstantDigitalizacion.ABREV_DENUNCIAS)){
            
            listMat2Image = ImagenUtil.cargarImagenMultiPageOCV(actaDigital.getStrNomFile());
            
            if (listMat2Image.isEmpty()) {
                return;
            }
            
            totImgs = listMat2Image.size();
            countImgs = 0;
            mat2Image = listMat2Image.get(countImgs);
        }else if(actaDigital.getStrTipoActa().equalsIgnoreCase(ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA)){
            
            listMat2Image = ImagenUtil.cargarImagenesOCV(
                    actaDigital.getFullPathImagenes()+File.separator+actaDigital.getArchivoEscrutinio(),
                    actaDigital.getFullPathImagenes()+File.separator+actaDigital.getArchivoInstalacionSufragio()
            );
            
            if (listMat2Image == null || listMat2Image.isEmpty()) {
                return;
            }
            
            totImgs = listMat2Image.size();
            countImgs = 0;
            mat2Image = listMat2Image.get(countImgs);
        }
        
        vistaActual = VISTA_FITHEIGTH;
                
        mostrarImagen();

    }
    
    public void mostrarImagen(){
        aplicarVistaImagen();
        actualizarTituloImagen();
        actualizarPaginacion();
    }
    
    private void aplicarVistaImagen() {
        if (mat2Image != null) {
            aplicarVistaActual();
        } else {
            imageView.setImage(null);
        }
    }
    
    private void aplicarVistaActual() {
        if (mat2Image == null) {
            return;
        }
        
        double imageWidth = mat2Image.cols();
        double imageHeight = mat2Image.rows();
        
        switch (vistaActual) {
            case VISTA_FITWIDTH -> ImageViewController.fitWidth(mat2Image, imageView, scrollPane, imageWidth, imageHeight);
            case VISTA_FITHEIGTH -> ImageViewController.fitHeight(mat2Image, imageView, scrollPane, imageWidth, imageHeight);
            case VISTA_FULLSIZE -> ImageViewController.fullSize(mat2Image, imageView, imageWidth, imageHeight);
            default -> logger.warn("Tipo de vista desconocido: {}", vistaActual);
        }
    }
    
    private void actualizarTituloImagen() {
        if (esActaElectoral()) {
            actualizarTituloActaElectoral();
        }
    }
    
    private boolean esActaElectoral() {
        String tipoActa = actaDigital.getStrTipoActa();
        return tipoActa.equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_CELESTE) ||
               tipoActa.equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_CONVENCIONAL) ||
               tipoActa.equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_EXTRANJERO) ||
               tipoActa.equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_VOTO_DIGITAL);
    }
    
    private void actualizarTituloActaElectoral() {
        switch (totImgs) {
            case 1 -> actualizarTituloUnaImagen();
            case 2 -> actualizarTituloDosImagenes();
            case 3 -> actualizarTituloTresImagenes();
            default -> logger.warn("Número de imágenes inesperado: {}", totImgs);
        }
    }
    
    private void actualizarTituloUnaImagen() {
        if (countImgs != 0) {
            return;
        }
        
        setTituloSiNoNulo(actaDigital.getArchivoEscrutinio());
        setTituloSiNoNulo(actaDigital.getArchivoInstalacionSufragio());
        setTituloSiNoNulo(actaDigital.getArchivoInstalacion());
        setTituloSiNoNulo(actaDigital.getArchivoSufragio());
    }
    
    private void actualizarTituloDosImagenes() {
        if (countImgs == 0) {
            setTitulo(actaDigital.getArchivoEscrutinio());
        } else if (countImgs == 1) {
            setTitulo(actaDigital.getArchivoInstalacionSufragio());
        }
    }
    
    private void actualizarTituloTresImagenes() {
        switch (countImgs) {
            case 0 -> setTituloOVacio(actaDigital.getArchivoEscrutinio());
            case 1 -> setTituloOVacio(actaDigital.getArchivoInstalacion());
            case 2 -> setTituloOVacio(actaDigital.getArchivoSufragio());
            default -> logger.warn("Índice de imagen inesperado: {} para 3 imágenes", countImgs);
        }
    }
    
    private void setTituloSiNoNulo(String archivo) {
        if (archivo != null) {
            setTitulo(archivo);
        }
    }
    
    private void setTitulo(String archivo) {
        tituloImagen.setText(archivo.replace(ConstantDigitalizacion.EXTENSION_TIF, ""));
    }
    
    private void setTituloOVacio(String archivo) {
        String titulo = archivo == null ? "" : archivo.replace(ConstantDigitalizacion.EXTENSION_TIF, "");
        tituloImagen.setText(titulo);
    }
    
    private void actualizarPaginacion() {
        pagesImagen.setText("Página " + (countImgs + 1) + " de " + totImgs);
    }
    
    @FXML
    public void onRotarImagen(){
        if(mat2Image!=null){
            rotateImagenOCV(mat2Image, 90);
            mostrarImagen();
        }
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
    public void onFitWidth(){
        vistaActual = VISTA_FITWIDTH;
        mostrarImagen();
    }
    
    @FXML
    public void onFitHeight(){
        vistaActual = VISTA_FITHEIGTH;
        mostrarImagen();
    }
    
    @FXML
    public void onFullSize(){
        vistaActual = VISTA_FULLSIZE;
        mostrarImagen();
    }
    
    @FXML
    public void onPagAnterior(){
        if(countImgs-1>=0){
            countImgs--;
            if(actaDigital.getStrTipoActa().equalsIgnoreCase(ABREV_LISTA_ELECTORES)){
                mat2Image = obtenerImagenPaginaLE(countImgs);
            }else{
                mat2Image = listMat2Image.get(countImgs);
            }
            mostrarImagen();
        }
    }
    
    @FXML
    public void onPagSiguiente(){
        if(countImgs+1<totImgs){
            countImgs++;
            if(actaDigital.getStrTipoActa().equalsIgnoreCase(ABREV_LISTA_ELECTORES)){
                mat2Image = obtenerImagenPaginaLE(countImgs);
            }else{
                mat2Image = listMat2Image.get(countImgs);
            }
            mostrarImagen();
        }
    }
    
    @FXML
    public void onCerrar(){
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
        stage.close();
    }
    
    public void setStageParent(Stage stageParent) {
        this.stageParent = stageParent;
    }
    
}
