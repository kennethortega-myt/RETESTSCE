import { Component,Inject  } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-modal-img',
  templateUrl: './modal-img.component.html',
  styleUrls: ['./modal-img.component.scss']
})

export class ModalImgComponent {

  constructor(
    public dialogRef: MatDialogRef<ModalImgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.steps = data.steps;
    this.currentIndex = data.currentIndex || 0; // Asigna currentIndex desde los datos o usa 0 por defecto
  }

  steps: any[];
  currentIndex: number;

  nextStep(): void {
    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
    }
  }

  previousStep(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  showNextButton(): boolean {
    return this.currentIndex < this.steps.length - 1;
  }

  showPreviousButton(): boolean {
    return this.currentIndex > 0;
  }

  isLastStep(): boolean {
    return this.currentIndex === this.steps.length - 1;
  }

  close(): void {
    this.dialogRef.close();
  }
}

