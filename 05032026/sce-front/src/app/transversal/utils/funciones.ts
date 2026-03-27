import { ElementRef } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Utility } from "src/app/helper/utility";

export function generarPdf(data: string, midivReporte: ElementRef<HTMLElement>) {
    //pdfBlob: Blob  = Utility.base64toBlob(data, 'application/pdf');
    const blobUrl = URL.createObjectURL(Utility.base64toBlob(data, 'application/pdf'));
    const object = document.createElement("object");
    object.setAttribute("width", "100%");
    object.setAttribute("height", "620");
    object.setAttribute("data", blobUrl);

    midivReporte.nativeElement.innerHTML = '';
    midivReporte.nativeElement.insertAdjacentElement('afterbegin', object);
}

export function getUbigeo(form: FormGroup) :string {
    const departamento: string = form.get('nivelUbigeoUno').value == "0" ? null : ''+ form.get('nivelUbigeoUno').value;
    const provincia: string = form.get('nivelUbigeoDos').value == "0" ? null : ''+ form.get('nivelUbigeoDos').value;
    const distrito: string = form.get('nivelUbigeoTres').value == "0" ? null : ''+ form.get('nivelUbigeoTres').value;
    let ubigeo = '000000';

    if(distrito) {
      ubigeo = distrito.padStart(6, '0');
    } else if(provincia){
      ubigeo = provincia.padStart(6, '0');
    } else if(departamento) {
      ubigeo = departamento.padStart(6, '0');
    }
    return ubigeo;
}

export function descargarPdf(pdfBlob: Blob, nombre: string){
  const blobUrl = URL.createObjectURL(pdfBlob);
  let a = document.createElement('a');
  a.href = blobUrl;
  a.target = '_blank';
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
}