import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataPopupVerResolucion } from 'src/app/model/control-calidad/DataPopupVerResolucion';

@Component({
  selector: 'app-popup-ver-resolucion',
  templateUrl: './popup-ver-resolucion.component.html',
})
export class PopupVerResolucionComponent implements AfterViewInit{

  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;
  datosResolucion: DataPopupVerResolucion;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DataPopupVerResolucion,
              public dialogRef: MatDialogRef<PopupVerResolucionComponent>,              
            ) {
    this.datosResolucion = data;    
  }

  ngAfterViewInit(): void {
    this.loadResolucionPdf();
  }

  loadResolucionPdf(){ 
    this.midivReporte.nativeElement.innerHTML = '';
    if(this.datosResolucion.archivoResolucion) {
      const blobUrl = URL.createObjectURL(this.datosResolucion.archivoResolucion);
      let object = document.createElement("object");
      object.setAttribute("width", "100%");
      object.setAttribute("height", "590px");
      object.setAttribute("data", blobUrl);
      
      this.midivReporte.nativeElement.insertAdjacentElement('afterbegin', object);   
    }          
  }

  descargarPdf(){
    const blobUrl = URL.createObjectURL(this.datosResolucion.archivoResolucion);
    let a = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    a.download = `Resolucion-${this.datosResolucion.nombreResolucion}`;
    document.body.appendChild(a);
    a.click();
  }
}
