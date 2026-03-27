import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatListModule} from '@angular/material/list';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent, MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {RequiereAutorizacionModalResult} from '../../../../interface/requiereAutorizacionModalResult.interface';

@Component({
  selector: 'app-popup-requiere-autorizacion',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatListModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
  templateUrl: './popup-requiere-autorizacion.component.html',
})
export class PopupRequiereAutorizacionComponent implements OnInit, OnDestroy{

  constructor(
    private readonly dialogRef: MatDialogRef<PopupRequiereAutorizacionComponent>
  ) {
  }

  ngOnInit() {
    //vacio
  }

  salirModal(): void {
    const result: RequiereAutorizacionModalResult = {
      action: 'salir'
    };
    this.dialogRef.close(result);
  }

  solicitarAutorizacion(): void {
    const result: RequiereAutorizacionModalResult = {
      action: 'solicitar'
    };
    this.dialogRef.close(result);
  }

  ngOnDestroy() {
    //vacio
  }

}

