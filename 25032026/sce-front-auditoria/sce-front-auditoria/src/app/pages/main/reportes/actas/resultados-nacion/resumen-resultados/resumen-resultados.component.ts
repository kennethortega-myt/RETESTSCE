import { Component, Input } from '@angular/core';
import { ResumenActasContabilizadas } from 'src/app/model/reportes/resultados-actas-contabilizadas';

@Component({
  selector: 'app-resumen-resultados',
  templateUrl: './resumen-resultados.component.html'
})
export class ResumenResultadosComponent {

@Input() resumenActas: ResumenActasContabilizadas;

}
