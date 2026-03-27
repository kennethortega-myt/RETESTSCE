package pe.gob.onpe.scescanner.common.util;

import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.core.MatOfByte;
import org.opencv.core.Rect;
import org.opencv.core.Size;
import org.opencv.imgcodecs.Imgcodecs;

import java.awt.image.BufferedImage;
import java.awt.image.DataBufferByte;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.opencv.imgcodecs.Imgcodecs.imread;
import static org.opencv.imgcodecs.Imgcodecs.imreadmulti;
import static org.opencv.imgproc.Imgproc.INTER_AREA;
import static org.opencv.imgproc.Imgproc.resize;

public class ImagenUtil {
    
    private ImagenUtil() {
        
    }
        
    static
    {
        System.loadLibrary(Core.NATIVE_LIBRARY_NAME);
    }
    
    public static BufferedImage mat2BufferedImage(Mat m)
    {
        int type = BufferedImage.TYPE_BYTE_GRAY;
        if (m.channels() > 1)
        {
            type = BufferedImage.TYPE_3BYTE_BGR;
        }
        int bufferSize = m.channels()*m.cols()*m.rows();
        byte[] b = new byte[bufferSize];
        m.get(0, 0, b); // get all the pixels
        BufferedImage image = new BufferedImage(m.cols(), m.rows(), type);
        final byte[] targetPixels = ((DataBufferByte) image.getRaster().getDataBuffer()).getData();
        System.arraycopy(b, 0, targetPixels, 0, b.length);  
        return image;
    }
    
    public static javafx.scene.image.Image mat2ImageFX(Mat m)
    {
        return new javafx.scene.image.Image(new ByteArrayInputStream(convertMatToByteArray(m)));
    }
    
    private static byte[] convertMatToByteArray(Mat m) {
        MatOfByte byteMat = new MatOfByte();
        Imgcodecs.imencode(".bmp", m, byteMat);
        return byteMat.toArray();
    }
    
    public static List<Mat> cargarImagenMultiPageOCV(String rutaImagen)
    {
        List<Mat> listMat;
        listMat = new ArrayList<>();
                
        boolean bRead = imreadmulti(rutaImagen, listMat);
        if(!bRead)
            return Collections.emptyList();
        
        return listMat;
    }
    
    public static List<Mat> cargarImagenesOCV(String... rutasImagenes) {
    List<Mat> listMat = new ArrayList<>();
    
    for (String ruta : rutasImagenes) {
        if (ruta != null && !ruta.isEmpty()) {
            Mat mat = cargarImagenOCV(ruta);
            if (mat != null) {
                listMat.add(mat);
            }
        }
    }
    
    return listMat.isEmpty() ? null : listMat;
}
        
    public static Mat resizeImagenOCV(Mat m, int nWidth, int nHeight){
        
        Mat resizeimage = new Mat();
        Size scaleSize = new Size(nWidth, nHeight);
        
        resize(m, resizeimage, scaleSize , 0, 0, INTER_AREA);
        
        return resizeimage;
    }
    
    public static void rotateImagenOCV(Mat m, int anguloRotacion){
        
        if(anguloRotacion!=0){
            switch(anguloRotacion){
                case 90:  Core.rotate(m, m, Core.ROTATE_90_CLOCKWISE); break;
                case 180: Core.rotate(m, m, Core.ROTATE_180); break;
                case -90, 270: Core.rotate(m, m, Core.ROTATE_90_COUNTERCLOCKWISE); break;
                default:  break;
            }
        }
    }
    
    public static Mat cargarImagenOCV(String rutaImagen){
        
        Mat m = imread(rutaImagen);
        if(m.empty()){
            return null;
        }
        
        return m;
    }
        
    public static BufferedImage cargarImagenOCVBufferedImage(String rutaImagen){
        
        Mat m = imread(rutaImagen);
        if(m.empty()){
            return null;
        }
        
        return mat2BufferedImage(m);
    }
    
    public static BufferedImage cargarImagenRecortadaOCV(ImageCropParams params){   
        
        Mat m = imread(params.getRutaImagen());
        if(m.empty()){
            return null;
        }
        
        Rect rec = new Rect(params.getLeft(), params.getTop(), params.getWidth(), params.getHeight());
        Mat subMat = m.submat(rec);
        
        if(subMat.empty()){
            return null;
        }
        
        rotateImagenOCV(subMat, params.getRotate());
        
        Mat resizeimage = resizeImagenOCV(subMat, params.getWidthControl(), params.getHeightControl());
        
        BufferedImage bi = mat2BufferedImage(resizeimage);
        
        resizeimage.release();
        
        return bi;
    }
    
}
