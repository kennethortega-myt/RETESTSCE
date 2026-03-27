import { Component, Input } from '@angular/core';
import { DataPopupVerResolucion } from 'src/app/model/control-calidad/DataPopupVerResolucion';

@Component({
  selector: 'app-data-resolucion',
  templateUrl: './data-resolucion.component.html',
  styleUrl: './data-resolucion.component.scss'
})
export class DataResolucionComponent {

  @Input() datosResolucion: DataPopupVerResolucion;

}
