import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
export interface DialogData {
  pdfBlob: string;
  titulo: string;
}
@Component({
  selector: 'app-modal-generico',
  templateUrl: './modal-generico.component.html'
})
export class ModalGenericoComponent {

  constructor(
    public dialogRef: MatDialogRef<ModalGenericoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
