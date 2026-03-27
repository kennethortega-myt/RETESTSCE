import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Utility } from "src/app/helper/utility";

@Component({
  selector: 'app-pdf-viewer-reporte',
  templateUrl: './pdf-viewer-reporte.component.html'
})
export class PdfViewerReporteComponent implements OnInit, OnDestroy, OnChanges {

  @Input() pdfBlob!: Blob;
  // Entrada para un Blob PDF
  pdfUrl!: string;
  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    if (this.pdfBlob) {
      //sessionStorage.setItem('loading', 'true');
      this.pdfUrl = URL.createObjectURL(this.pdfBlob);
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['pdfBlob'] && this.pdfBlob) {

      sessionStorage.setItem('loading', 'false');
      this.pdfBlob = Utility.base64toBlob(this.pdfBlob, 'application/pdf');
      this.pdfUrl = URL.createObjectURL(this.pdfBlob);
      this.showReport();
    }
  }

  showReport() {

    let e1 = document.getElementById("idDivImagen");      //e.firstElementChild can be used.

    if (e1 !== null) {
      let child = e1.lastElementChild;
      while (child) {
        e1.removeChild(child);
        child = e1.lastElementChild;
      }
    }

    const blobUrl = URL.createObjectURL(this.pdfBlob);
    let object = document.createElement("object");
    object.setAttribute("width", "100%");
    object.setAttribute("height", "580");
    object.setAttribute("data", blobUrl);
    document.getElementById("idDivImagen").appendChild(object);
  }

  onDocumentLoaded() {
    // Desactiva el indicador de carga
    setTimeout(() => {
      sessionStorage.setItem('loading', 'false');
    }, 300);
  }

  ngOnDestroy() {
    //vacio
  }


}
