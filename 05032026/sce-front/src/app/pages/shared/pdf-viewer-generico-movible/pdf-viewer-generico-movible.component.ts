import {
  Component,
  Inject,
  OnDestroy,
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

export interface PdfViewerDialogData{
  pdfBlob: Blob;
}

@Component({
  selector: 'app-pdf-viewer-generico-movible',
  templateUrl: './pdf-viewer-generico-movible.component.html',
  styleUrls: ['./pdf-viewer-generico-movible.component.scss']
})
export class PdfViewerGenericoMovibleComponent implements OnDestroy{
  pdfUrl: string = '';
  pdfUrlSafe: SafeResourceUrl | string = '';
  cargandoPdf: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: PdfViewerDialogData,
    private readonly dialogRef: MatDialogRef<PdfViewerGenericoMovibleComponent>,
    private readonly sanitizer: DomSanitizer
  ) {
    if (this.data?.pdfBlob) {
      this.cargandoPdf = true;
      this.pdfUrl = URL.createObjectURL(this.data.pdfBlob);
      this.pdfUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfUrl);
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
