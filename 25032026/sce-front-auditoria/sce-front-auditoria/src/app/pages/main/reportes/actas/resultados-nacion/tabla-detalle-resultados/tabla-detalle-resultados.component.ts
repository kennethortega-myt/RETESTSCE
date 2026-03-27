import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DetalleResultados, ResultadosActasContabilizadas } from 'src/app/model/reportes/resultados-actas-contabilizadas';

@Component({
  selector: 'app-tabla-detalle-resultados',
  templateUrl: './tabla-detalle-resultados.component.html',
  styleUrls: ['./tabla-detalle-resultados.component.scss']
})
export class TablaDetalleResultadosComponent implements OnChanges{
  
   
  displayedResultados: string[] = ['numero', 'op', 'cantidadvotos', 'porVotos', 'porVotosEmitidos'];
  displayedTotales: string[] = ['dato', 'cantidadvotos', 'porVotos', 'porVotosEmitidos'];

  displayedResultadosPref: string[] = [];
  displayedTotalesPref: string[] = [];

  @Input() resultadosActasContabilizadas: ResultadosActasContabilizadas;

  indexVotosPref: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {    
    this.displayedResultadosPref = ['numero', 'op', 'cantidadvotos'];
    this.displayedTotalesPref = ['dato', 'cantidadvotos'];
    for(let i = 0; i < this.resultadosActasContabilizadas.cantidadVotosPref; i++){
      this.indexVotosPref[i] = i;
      this.displayedResultadosPref[i+3] = '' + (i+1);
      this.displayedTotalesPref[i+2] = '' + (i+1);
    }
  }

  colorRow(row: DetalleResultados): string {
    if(row.codigoAp === '80' || row.codigoAp === '81'){
      return 'bg_white';
    } else {
      return 'bg_celeste';
    }
  }

  get classOrgPol(): string {
    if(this.resultadosActasContabilizadas.cantidadVotosPref > 10) {
      return 'header-op-pref-10';
    } else {
      return 'header-op';
    }
  }

  classOrgPolTotal(row: DetalleResultados): string {
    let classCss = '';
    if(row.codigoAp === '80' || row.codigoAp === '81'){
      classCss = 'bg_white';
    } else {
      classCss = 'bg_celeste';
    }

    if(this.resultadosActasContabilizadas.cantidadVotosPref > 10) {
      classCss = classCss + ' col-dato-total-pref-10';
    } else {
      classCss = classCss + ' col-dato-total';
    }

    return classCss;
  }

}
