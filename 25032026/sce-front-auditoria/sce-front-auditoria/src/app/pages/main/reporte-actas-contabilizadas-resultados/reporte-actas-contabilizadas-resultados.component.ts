import {Component, Input} from '@angular/core';
import {ActaContabilizadaReporteBean} from "../../../model/actaContabilizadaReporteBean";


export interface PeriodicElement {
  OPolitica: string;
  Cantidad: number;
  VValidados: string;
  Vemitidos: string;
}



@Component({
  selector: 'app-reporte-actas-contabilizadas-resultados',
  templateUrl: './reporte-actas-contabilizadas-resultados.component.html',
})
export class ReporteActasContabilizadasResultadosComponent {

  @Input() ELEMENT_DATA: ActaContabilizadaReporteBean[];
  @Input() ELEMENT_DATA2: ActaContabilizadaReporteBean[];

  public dataSource: PeriodicElement[];
  public dataSource2: PeriodicElement[];

  displayedColumns: string[] = ['OPolitica',
    'Cantidad',
    'VValidados',
    'Vemitidos'
  ];

  constructor() {
    this.dataSource = [];
    this.dataSource2 = [];
  }

}
