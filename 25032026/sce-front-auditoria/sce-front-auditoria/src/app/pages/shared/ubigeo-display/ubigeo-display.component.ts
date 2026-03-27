import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-ubigeo-display',
  templateUrl: './ubigeo-display.component.html'
})
export class UbigeoDisplayComponent {
  @Input() departamento: string = '';
  @Input() provincia: string = '';
  @Input() distrito: string = '';
  @Input() localVotacion: string = '';
  @Input() numMesa: string = '';
  @Input() mostrarVerActa: boolean = false;
  @Output() verActaClick = new EventEmitter<void>();
}
