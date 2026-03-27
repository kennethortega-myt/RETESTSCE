import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { PopReportePuestaCeroData } from "../../../../../interface/popReportePuestaCero.interface";
import { Utility } from 'src/app/helper/utility';

@Component({
  selector: 'app-pop-reporte-cargo-entrega',
  templateUrl: './pop-reporte-cargo-entrega.component.html'
})
export class PopReporteCargoEntregaComponent implements OnInit {
  public pdfBlob: Blob;
  public nombreArchivo: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PopReportePuestaCeroData,
              public dialogRef: MatDialogRef<PopReporteCargoEntregaComponent>) {
    this.nombreArchivo = "";
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
    this.nombreArchivo = this.data.nombreArchivoDescarga;

    const blobUrl = URL.createObjectURL(this.pdfBlob);
    let object = document.createElement("object");
    object.setAttribute("width", "100%");
    object.setAttribute("height", "620");
    object.setAttribute("data",blobUrl);

    document.getElementById("idDivImagen").appendChild(object);
  }

  descargarPdf(){
    const blobUrl = URL.createObjectURL(this.pdfBlob);
    let a = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    a.download = this.nombreArchivo;
    document.body.appendChild(a);
    a.click();
  }
  
  onCerrarModal(){
    this.dialogRef.close(false);
  }

}
