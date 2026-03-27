package pe.gob.onpe.scescanner.common.util;

public class ImageCropParams {
    private String rutaImagen;
    private int left;
    private int top;
    private int width;
    private int height;
    private int rotate;
    private int widthControl;
    private int heightControl;

    public ImageCropParams() {
        super();
    }

    public String getRutaImagen() {
        return rutaImagen;
    }

    public void setRutaImagen(String rutaImagen) {
        this.rutaImagen = rutaImagen;
    }

    public int getLeft() {
        return left;
    }

    public void setLeft(int left) {
        this.left = left;
    }

    public int getTop() {
        return top;
    }

    public void setTop(int top) {
        this.top = top;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public int getRotate() {
        return rotate;
    }

    public void setRotate(int rotate) {
        this.rotate = rotate;
    }

    public int getWidthControl() {
        return widthControl;
    }

    public void setWidthControl(int widthControl) {
        this.widthControl = widthControl;
    }

    public int getHeightControl() {
        return heightControl;
    }

    public void setHeightControl(int heightControl) {
        this.heightControl = heightControl;
    }
}
