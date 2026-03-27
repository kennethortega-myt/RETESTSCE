import {Component, ElementRef, Inject, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PopReportePuestaCeroData} from "../../../../interface/popReportePuestaCero.interface";
import { Utility } from 'src/app/helper/utility';

@Component({
  selector: 'app-pop-reporte-puesta-cero',
  templateUrl: './pop-reporte-puesta-cero.component.html'
})
export class PopReportePuestaCeroComponent implements OnInit{

  @ViewChild('idDivImagen', { static: true }) midivReporte: ElementRef<HTMLDivElement>;
  public pdfBlob: Blob;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PopReportePuestaCeroData,
              public dialogRef: MatDialogRef<PopReportePuestaCeroComponent>) {
  }
  ngOnInit(): void {

    this.midivReporte.nativeElement.innerHTML = '';

    this.pdfBlob = Utility.base64toBlob(this.data.dataBase64,'application/pdf');

    const blobUrl = URL.createObjectURL(this.pdfBlob);
    let object = document.createElement("object");
    object.setAttribute("width", "100%");
    object.setAttribute("height", "580");
    object.setAttribute("data",blobUrl);

    this.midivReporte.nativeElement.insertAdjacentElement('afterbegin', object);
  }

  descargarPdf(){
    const blobUrl = URL.createObjectURL(this.pdfBlob);
    let a = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    a.download = this.data.nombreArchivoDescarga || 'reporte_puesta_cero.pdf';
    document.body.appendChild(a);
    a.click();
  }
  onCerrarModal(){
    this.dialogRef.close(false);
  }

}
