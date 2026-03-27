/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pe.gob.onpe.scescanner.domain;

/**
 *
 * @author LRestan
 */
public class DocumentoElectoral {
    
    //Datos del documento
    private Integer iddoc;    
    private String descDocumento;   //"ACTA DE ESCRUTINIO", "ACTA DE INSTALACION Y SUFRAGIO"
    private String descDocCorto;    //"AE", "AIS"
    private Integer habilitado;     //0, 1
    
    //Datos de la imagen
    private Integer tipoImagen;       //1:IMCOLOR, 2:GRAYSCALE, 3:IMBLACKWHITE
    private Integer sizeHojaSel;      //0:AUTO, 1:A4, 2:LEGAL, 3:TABLOID, 4:A3, 
    private Integer imgfileMultiPage; //1:FILE_MULTIPAGE, 0:FILE_SINGLEPAGE
    private Integer scanBothPages;    //1:SCAN_BOTHPAGES, 0:SCAN_ONEPAGE
    
    //Orientracion y coordenadas para lectura del codigo de barras
    private Integer cbOrienta;        //1:LR, 2:BT, 3:TB, 4:RL
    private Integer cbLeft;
    private Integer cbTop;
    private Integer cbWidth;
    private Integer cbHeight;

    public DocumentoElectoral() {
        super();
    }
    
    public Integer getIddoc() {
        return iddoc;
    }

    public void setIddoc(Integer iddoc) {
        this.iddoc = iddoc;
    }

    public String getDescDocumento() {
        return descDocumento;
    }

    public void setDescDocumento(String descDocumento) {
        this.descDocumento = descDocumento;
    }

    public String getDescDocCorto() {
        return descDocCorto;
    }

    public void setDescDocCorto(String descDocCorto) {
        this.descDocCorto = descDocCorto;
    }

    public Integer getHabilitado() {
        return habilitado;
    }

    public void setHabilitado(Integer habilitado) {
        this.habilitado = habilitado;
    }

    public Integer getTipoImagen() {
        return tipoImagen;
    }

    public void setTipoImagen(Integer tipoImagen) {
        this.tipoImagen = tipoImagen;
    }

    public Integer getSizeHojaSel() {
        return sizeHojaSel;
    }

    public void setSizeHojaSel(Integer sizeHojaSel) {
        this.sizeHojaSel = sizeHojaSel;
    }

    public Integer getImgfileMultiPage() {
        return imgfileMultiPage;
    }

    public void setImgfileMultiPage(Integer imgfileMultiPage) {
        this.imgfileMultiPage = imgfileMultiPage;
    }

    public Integer getScanBothPages() {
        return scanBothPages;
    }

    public void setScanBothPages(Integer scanBothPages) {
        this.scanBothPages = scanBothPages;
    }

    public Integer getCbOrienta() {
        return cbOrienta;
    }

    public void setCbOrienta(Integer cbOrienta) {
        this.cbOrienta = cbOrienta;
    }

    public Integer getCbLeft() {
        return cbLeft;
    }

    public void setCbLeft(Integer cbLeft) {
        this.cbLeft = cbLeft;
    }

    public Integer getCbTop() {
        return cbTop;
    }

    public void setCbTop(Integer cbTop) {
        this.cbTop = cbTop;
    }

    public Integer getCbWidth() {
        return cbWidth;
    }

    public void setCbWidth(Integer cbWidth) {
        this.cbWidth = cbWidth;
    }

    public Integer getCbHeight() {
        return cbHeight;
    }

    public void setCbHeight(Integer cbHeight) {
        this.cbHeight = cbHeight;
    }
    
    
    
}
