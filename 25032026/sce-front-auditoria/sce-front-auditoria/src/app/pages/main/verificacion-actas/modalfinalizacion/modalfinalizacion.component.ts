import { Component } from '@angular/core';
import {MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-modalfinalizacion',
  templateUrl: './modalfinalizacion.component.html',
  styleUrls: ['./modalfinalizacion.component.scss']
})
export class ModalfinalizacionComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalfinalizacionComponent>,
 
  ) {}
  onCloseClick(): void {
    this.dialogRef.close();
  }
}
