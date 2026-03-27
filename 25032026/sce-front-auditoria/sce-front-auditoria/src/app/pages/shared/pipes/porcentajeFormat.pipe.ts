import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'porcentajeFormat'
})
export class PorcentajeFormatPipe implements PipeTransform{
  constructor() {
  }
  transform(valor: number): string {
    if (valor !== null && valor !== undefined) {
      // Multiplicamos por 100 y agregamos el símbolo de porcentaje
      //return (valor * 100).toFixed(2) + '%';
      return valor + ' %';
    } else {
      return ''; // Manejo de valores nulos o indefinidos
    }
  }
}
