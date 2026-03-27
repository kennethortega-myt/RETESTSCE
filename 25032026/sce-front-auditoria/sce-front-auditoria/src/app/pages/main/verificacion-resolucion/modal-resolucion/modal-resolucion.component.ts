import { Component } from '@angular/core';
import {MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-modal-resolucion',
  templateUrl: './modal-resolucion.component.html',
  styleUrls: ['./modal-resolucion.component.scss']
})
export class ModalResolucionComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalResolucionComponent>,
 
  ) {}
  onCloseClick(): void {
    this.dialogRef.close();
  }


  dataSource2 = [
    { celda1: '000109', celda2: '' },
    { celda1: '000109 ', celda2: ''},
    { celda1: '000109', celda2: ''},
    { celda1: '000109', celda2: ''},
    { celda1: '000109', celda2: ''},
    
  ];

  displayedColumns2: string[] = ['celda1', 'celda2'];



}
