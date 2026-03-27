import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-pm-footer-cvas',
  templateUrl: './procesamiento-manual-footer-cvas.component.html'
})
export class ProcesamientoManualFooterCvasComponent {
  @Input() cvasFC: FormControl;
  @Output() cvasChange = new EventEmitter<void>();
}
