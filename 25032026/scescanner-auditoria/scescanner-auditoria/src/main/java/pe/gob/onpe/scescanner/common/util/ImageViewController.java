package pe.gob.onpe.scescanner.common.util;

import javafx.scene.control.ScrollPane;
import javafx.scene.image.ImageView;
import org.opencv.core.Mat;
import static pe.gob.onpe.scescanner.common.util.ImagenUtil.mat2ImageFX;
import static pe.gob.onpe.scescanner.common.util.ImagenUtil.resizeImagenOCV;

public class ImageViewController {
    
    public static final int VISTA_FITWIDTH = 1;
    public static final int VISTA_FITHEIGTH = 2;
    public static final int VISTA_FULLSIZE = 3;
    
    private ImageViewController() {
    }
    
    public static void mostrarImagen(Mat mat2Image, ImageView imageView, ScrollPane scrollPane, int vistaActual) {
        if (mat2Image != null) {
            double imageWidth = mat2Image.cols();
            double imageHeight = mat2Image.rows();

            switch (vistaActual) {
                case VISTA_FITWIDTH:
                    fitWidth(mat2Image, imageView, scrollPane, imageWidth, imageHeight);
                    break;
                case VISTA_FITHEIGTH:
                    fitHeight(mat2Image, imageView, scrollPane, imageWidth, imageHeight);
                    break;
                case VISTA_FULLSIZE:
                    fullSize(mat2Image, imageView, imageWidth, imageHeight);
                    break;
                default:
                    break;
            }
        } else {
            imageView.setImage(null);
        }
    }
    
    public static double aplicarZoom(Mat mat2Image, ImageView imageView, double currentZoom, double factor) {
        double newZoom = currentZoom * factor;
        
        if (newZoom > 0.1 && newZoom < 10.0 && mat2Image != null) {
            if (newZoom > 1.0) {
                newZoom = 1.0;
            }
            
            double imageWidth = mat2Image.cols();
            double imageHeight = mat2Image.rows();
            double newWidth = imageWidth * newZoom;
            double newHeight = imageHeight * newZoom;
            recargarResizeImage(mat2Image, imageView, newWidth, newHeight);
            
            return newZoom;
        }
        
        return currentZoom;
    }
    
    public static void fitWidth(Mat mat2Image, ImageView imageView, ScrollPane scrollPane, double imageWidth, double imageHeight) {
        double verticalScrollBarWidth = 15;
        double scrollPaneWidth = scrollPane.getPrefWidth();
        
        // Validar que el scrollPane tenga un ancho válido
        if (scrollPaneWidth <= verticalScrollBarWidth) {
            // Si el scrollPane no tiene dimensiones, intentar obtener el ancho actual
            scrollPaneWidth = scrollPane.getWidth();
            if (scrollPaneWidth <= verticalScrollBarWidth) {
                // Como último recurso, usar un ancho por defecto razonable
                scrollPaneWidth = 800;
            }
        }
        
        double newZoom = (scrollPaneWidth - verticalScrollBarWidth) / imageWidth;
        double newWidth = scrollPaneWidth - verticalScrollBarWidth;
        double newHeight = imageHeight * newZoom;
        recargarResizeImage(mat2Image, imageView, newWidth, newHeight);
    }
    
    public static void fitHeight(Mat mat2Image, ImageView imageView, ScrollPane scrollPane, double imageWidth, double imageHeight) {
        double scrollPaneHeight = scrollPane.getHeight();
        
        // Validar que el scrollPane tenga una altura válida
        if (scrollPaneHeight <= 2) {
            // Si el scrollPane no tiene dimensiones, intentar obtener la altura preferida
            scrollPaneHeight = scrollPane.getPrefHeight();
            if (scrollPaneHeight <= 2) {
                // Como último recurso, usar una altura por defecto razonable
                scrollPaneHeight = 600;
            }
        }
        
        double newZoom = (scrollPaneHeight - 2) / imageHeight;
        double newHeight = scrollPaneHeight - 2;
        double newWidth = imageWidth * newZoom;
        recargarResizeImage(mat2Image, imageView, newWidth, newHeight);
    }
    
    public static void fullSize(Mat mat2Image, ImageView imageView, double imageWidth, double imageHeight) {
        recargarResizeImage(mat2Image, imageView, imageWidth, imageHeight);
    }
    
    public static void recargarResizeImage(Mat mat2Image, ImageView imageView, double newWidth, double newHeight) {
        if (mat2Image != null) {
            // Validar que las dimensiones sean válidas antes de hacer resize
            if (newWidth <= 0 || newHeight <= 0) {
                // Si las dimensiones no son válidas, calcular un tamaño proporcional razonable
                double originalWidth = mat2Image.cols();
                double originalHeight = mat2Image.rows();
                double defaultSize = 600; // Tamaño por defecto
                
                if (originalWidth > originalHeight) {
                    newWidth = defaultSize;
                    newHeight = (originalHeight / originalWidth) * defaultSize;
                } else {
                    newHeight = defaultSize;
                    newWidth = (originalWidth / originalHeight) * defaultSize;
                }
            }
            
            imageView.setFitWidth(newWidth);
            imageView.setFitHeight(newHeight);

            Mat resMat = resizeImagenOCV(mat2Image, (int) newWidth, (int) newHeight);
            javafx.scene.image.Image image = mat2ImageFX(resMat);
            resMat.release();
            imageView.setImage(image);
        } else {
            imageView.setImage(null);
        }
    }
}
