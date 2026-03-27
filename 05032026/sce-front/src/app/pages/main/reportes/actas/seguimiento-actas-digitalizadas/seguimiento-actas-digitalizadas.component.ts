import { Component } from '@angular/core';

@Component({
  selector: 'app-seguimiento-actas-digitalizadas',
  templateUrl: './seguimiento-actas-digitalizadas.component.html',
})
export class SeguimientoActasDigitalizadasComponent {
  selectedDate: Date | null = null;
  selectedTime: string | null = null; // Hora en formato 'HH:mm'
}
