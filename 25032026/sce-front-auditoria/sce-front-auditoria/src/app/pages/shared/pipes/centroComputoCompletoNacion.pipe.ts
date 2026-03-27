import { Pipe, PipeTransform } from "@angular/core";
import { Constantes } from "src/app/helper/constantes";
import { AutorizacionNacionBean } from "src/app/model/autorizacionNacionBean";

@Pipe({
  name: 'centroComputoCompletoNacion',
  pure: true // Se ejecuta solo cuando cambian los inputs
})
export class CentroComputoCompletoNacionPipe implements PipeTransform {
  transform(element: AutorizacionNacionBean): string {
    if (!element?.codigoCentroComputo) {
      return '';
    }

    if (element.codigoCentroComputo === Constantes.NOMBRE_NACION_DISTRITO_ELECTORAL) {
      return element.codigoCentroComputo;
    }

    if (!element.nombreCentroComputo) {
      return element.codigoCentroComputo;
    }

    return `${element.codigoCentroComputo} - ${element.nombreCentroComputo}`;
  }
}
