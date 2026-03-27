import {
  Component, ElementRef, HostListener,
  Inject,
  OnDestroy, ViewChild,
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

export interface PdfViewerDialogData{
  pdfBlob: Blob;
}

@Component({
  selector: 'app-pdf-viewer-generico-movible',
  templateUrl: './pdf-viewer-generico-movible.component.html',
})
export class PdfViewerGenericoMovibleComponent implements OnDestroy{
  @ViewChild('iframeRef') iframeRef?: ElementRef<HTMLIFrameElement>;
  @ViewChild('iframeOverlay') iframeOverlay?: ElementRef<HTMLDivElement>;

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(e: MouseEvent): void {
    const iframe = this.iframeRef?.nativeElement;
    if (iframe && e.target instanceof Node && !iframe.contains(e.target)) {
      if (this.iframeOverlay?.nativeElement) {
        this.iframeOverlay.nativeElement.style.display = 'block';
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.iframeOverlay?.nativeElement) {
      this.iframeOverlay.nativeElement.style.display = 'none';
    }
  }

  pdfUrl: string = '';
  pdfUrlSafe: SafeResourceUrl | string = '';
  cargandoPdf: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: PdfViewerDialogData,
    private readonly dialogRef: MatDialogRef<PdfViewerGenericoMovibleComponent>,
    private readonly sanitizer: DomSanitizer
  ) {
    if (this.data?.pdfBlob) {
      this.cargandoPdf = true;
      this.pdfUrl = URL.createObjectURL(this.data.pdfBlob);
      if (this.pdfUrl.startsWith('blob:')) {
        this.pdfUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfUrl);
      }
    }
  }

  onPdfCargado(): void {
    this.cargandoPdf = false;
  }

  descargar(): void {
    if (!this.pdfUrl) return;
    const a = document.createElement('a');
    a.href = this.pdfUrl;
    a.download = 'resolucion.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
    }
  }

}
