import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PopReportePuestaCeroData} from "../../../../interface/popReportePuestaCero.interface";
import { Utility } from 'src/app/helper/utility';

@Component({
  selector: 'app-pop-reporte-puesta-cero',
  templateUrl: './pop-reporte-puesta-cero.component.html'
})
export class PopReportePuestaCeroComponent implements OnInit{

  public pdfBlob: Blob;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PopReportePuestaCeroData,
              public dialogRef: MatDialogRef<PopReportePuestaCeroComponent>) {
  }
  ngOnInit(): void {

    let e1 = document.getElementById("idDivImagen");      //e.firstElementChild can be used.

    if(e1!==null){
      let child = e1.lastElementChild;
      while (child) {
        e1.removeChild(child);
        child = e1.lastElementChild;
      }
    }

    this.pdfBlob = Utility.base64toBlob(this.data.dataBase64,'application/pdf');

    const blobUrl = URL.createObjectURL(this.pdfBlob);
    let object = document.createElement("object");
    object.setAttribute("width", "100%");
    object.setAttribute("height", "580");
    object.setAttribute("data",blobUrl);

    document.getElementById("idDivImagen").appendChild(object);
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
