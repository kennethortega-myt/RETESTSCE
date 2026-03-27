import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mensaje-personaje',
  templateUrl: './mensaje-personaje.component.html',
})
export class MensajePersonajeComponent {
  @Input() mensaje: string = 'Por favor, seleccione el ámbito para realizar la búsqueda.';
}
