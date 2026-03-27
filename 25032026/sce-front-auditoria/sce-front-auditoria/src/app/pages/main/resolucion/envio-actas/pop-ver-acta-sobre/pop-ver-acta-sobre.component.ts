import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { Constantes } from "src/app/helper/constantes";
import { Utility } from 'src/app/helper/utility';
import { PopActaOficioEnvioJEE } from "src/app/interface/popActaOficioEnvioJEE.interface";

@Component({
  selector: 'app-ver-acta-sobre',
  templateUrl: './pop-ver-acta-sobre.component.html'
})
export class PopVerActaSobreComponent implements OnInit {

  @ViewChild('divEscrutinio', { static: false }) divEscrutinio!: ElementRef;
  @ViewChild('divInstalacion', { static: false }) divInstalacion!: ElementRef;
  @ViewChild('divSufragio', { static: false }) divSufragio!: ElementRef;

  public nombreArchivo: string;
  public pdfSrcEscrutinio: string = '';
  public pdfSrcInstalacion: string = '';
  public pdfSrcSufragio: string = '';
  public mostrarSufragio: boolean = false;
  protected readonly Constantes = Constantes;
  public isPdf: boolean = false;

  tipoDocumentoView: string = Constantes.CE_TIPO_ACTA_ESCRUTINIO;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PopActaOficioEnvioJEE,
    private readonly renderer: Renderer2,
    public dialogRef: MatDialogRef<PopVerActaSobreComponent>) {
    this.nombreArchivo = "";
  }

  ngOnInit(): void {
    const mimeType = this.detectMimeType(this.data.dataBase64);
    
    this.isPdf = mimeType === 'application/pdf';
    if (!this.isPdf) return;
    
    this.nombreArchivo = this.data.nombreArchivoDescarga;

    const blobAE = Utility.base64toBlob(this.data.dataBase64, mimeType);
    const blobAIS = Utility.base64toBlob(this.data.dataBase642, mimeType);

    this.pdfSrcEscrutinio = URL.createObjectURL(blobAE);
    this.pdfSrcInstalacion = URL.createObjectURL(blobAIS);

    if (this.data.dataBase643) {
      const blobSuf = Utility.base64toBlob(this.data.dataBase643, mimeType);
      this.pdfSrcSufragio = URL.createObjectURL(blobSuf);
      this.mostrarSufragio = true;
    }

    setTimeout(() => {
      this.createPdfViewer(this.divEscrutinio, this.pdfSrcEscrutinio);
      this.createPdfViewer(this.divInstalacion, this.pdfSrcInstalacion);

      if (this.mostrarSufragio) {
        this.createPdfViewer(this.divSufragio, this.pdfSrcSufragio);
      }
    });  
  }

  private createPdfViewer(containerRef: ElementRef, pdfSrc: string): void {
    if (!containerRef || !pdfSrc) return;

    containerRef.nativeElement.innerHTML = '';
    const object = this.renderer.createElement('object');
    this.renderer.setAttribute(object, 'data', pdfSrc);
    this.renderer.setAttribute(object, 'type', 'application/pdf');
    this.renderer.setAttribute(object, 'width', '100%');
    this.renderer.setAttribute(object, 'height', '620px');
    this.renderer.appendChild(containerRef.nativeElement, object);
  }

  tabsIds = [
    this.Constantes.CE_TIPO_ACTA_ESCRUTINIO,
    this.Constantes.CE_TIPO_ACTA_INSTALACION_SUFRAGIO
  ];

  onTabChange(event: MatTabChangeEvent): void {
    this.tipoDocumentoView = this.tabsIds[event.index];
  }

  private detectMimeType(base64: string): string {
    if (base64.startsWith('iVBOR')) return 'image/png';
    if (base64.startsWith('/9j/')) return 'image/jpeg';
    if (base64.startsWith('JVBER')) return 'application/pdf';
    return 'application/octet-stream';
  }

  onCerrarModal(): void {
    this.dialogRef.close(false);
  }
}
