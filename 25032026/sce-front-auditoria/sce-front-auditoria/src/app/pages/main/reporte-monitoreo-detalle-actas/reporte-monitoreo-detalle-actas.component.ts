import {Component, Input} from '@angular/core';
import {EstadosBean} from "../../../model/estadosBean";

@Component({
  selector: 'app-reporte-monitoreo-detalle-actas',
  templateUrl: './reporte-monitoreo-detalle-actas.component.html',
  styleUrls: ['./reporte-monitoreo-detalle-actas.component.scss']
})
export class ReporteMonitoreoDetalleActasComponent {

  @Input() GRUPO_ESCANEO: string;
  @Input() NUMERO_MESA: string;
  @Input() ESTADO_MESA: string;
  @Input() USUARIO_MODIFICADO: string;
  @Input() FECHA_MODIFICACION: string;
  @Input() ESTADOS_ACTA: Array<EstadosBean>;
  @Input() ESTADOS_PROCESO: Array<EstadosBean>;

  public aux : string = "hola";

  constructor() {

  }

}
