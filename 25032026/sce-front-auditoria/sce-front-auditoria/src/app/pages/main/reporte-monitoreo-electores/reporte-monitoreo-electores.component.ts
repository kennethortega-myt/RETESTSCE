import {Component, Input} from '@angular/core';
import {ElectorCiudadanoBean} from "../../../model/electorCiudadanoBean";

@Component({
  selector: 'app-reporte-monitoreo-electores',
  templateUrl: './reporte-monitoreo-electores.component.html',
  styleUrls: ['./reporte-monitoreo-electores.component.scss']
})
export class ReporteMonitoreoElectoresComponent {

  @Input() ELECTORES_CIUDADANOS: Array<ElectorCiudadanoBean>;

  constructor() {

  }

}
