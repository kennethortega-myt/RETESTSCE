import { Component, Input } from '@angular/core';
import { ResultadosActasContabilizadasCPR } from 'src/app/model/reportes/resultados-actas-contabilizadas';

@Component({
  selector: 'app-tabla-detalle-resultados-cpr',
  templateUrl: './tabla-detalle-resultados-cpr.component.html'
})
export class TablaDetalleResultadosCprComponent {

  displayedResultados: string[] = ['op', 'votosSi', 'votosNo', 'votosBlancos', 'votosNulos', 'ciudadanosVotaron', 'votosSiNo2'];

  @Input() resultadosActasContabilizadas: ResultadosActasContabilizadasCPR;

}
