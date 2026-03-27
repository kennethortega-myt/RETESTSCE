import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pm-panel-lateral',
  templateUrl: './procesamiento-manual-panel-lateral.component.html'
})
export class ProcesamientoManualPanelLateralComponent{
  @Input() checkSinDatosFC: FormControl;
  @Input() checkSinFirmasFC: FormControl;
  @Input() checkSolNulidadFC: FormControl;
  @Input() formGroupIntalacion: FormGroup;
  @Input() formGroupEscrutinio: FormGroup;
  @Input() minFechaInstalacion: Date | null;
  @Input() maxFechaInstalacion: Date | null;
  @Input() minFechaEscrutinio: Date | null;
  @Input() maxFechaEscrutinio: Date | null;
  @Input() isHoraEscrutinioN: boolean = false;

  @Output() changeHoraInicio = new EventEmitter<void>();
  @Output() changeHoraFin = new EventEmitter<void>();
  @Output() sinDatosChange = new EventEmitter<Event>();
  @Output() sinFirmasChange = new EventEmitter<Event>();
  @Output() solNulidadChange = new EventEmitter<Event>();
}
