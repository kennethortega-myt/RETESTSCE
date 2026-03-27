import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-pm-celda-achurada',
  styles: [':host { display: contents; }'],
  template: `
      <mat-form-field class="acta-corregir-pref black cant-input" appearance="outline">
        <input matInput
               sceFocusVeriResolucionEnter
               sceFocusVeriResolucionFlecha
               [rowIndex]="rowIndex"
               [colIndex]="colIndex"
               [flagPresi]="flagPresi"
               type="text" placeholder="" value="" [readonly]="true" />
      </mat-form-field>
    `
})
export class ProcesamientoManualCeldaAchuradaComponent {
  @Input() rowIndex: number;
  @Input() colIndex: number = 0;
  @Input() flagPresi: boolean = false;
}
