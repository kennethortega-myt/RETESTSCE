import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Utility} from '../../../helper/utility';
import {ModalGenericoResult} from '../../../interface/ModalGenericoResult.interface';
export interface DialogData {
  pdfBlob: Blob;
  nombreArchivoDescarga: string;
  success: boolean;
  isCerrarSesion?: boolean
}
@Component({
  selector: 'app-modal-generico-reporte',
  templateUrl: './modal-generico-reporte.component.html'
})
export class ModalGenericoReporteComponent {
  public pdfBlob: Blob;
  constructor(
    public dialogRef: MatDialogRef<ModalGenericoReporteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  ngOnInit() {
    this.pdfBlob = Utility.base64toBlob(this.data.pdfBlob,'application/pdf');
  }

  cerrar(): void {
    const isCerrarSesion = !!this.data.isCerrarSesion;
    const action: ModalGenericoResult['action'] = isCerrarSesion ? 'cerrar_sesion' : 'salir';
    this.dialogRef.close({ action });
  }

  descargarPdf(){
    const blobUrl = URL.createObjectURL(this.pdfBlob);
    let a = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = this.data.nombreArchivoDescarga ? this.data.nombreArchivoDescarga :  `reporte_${timestamp}.pdf`;
    document.body.appendChild(a);
    a.click();
  }

}
