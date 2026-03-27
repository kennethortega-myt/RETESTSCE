import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {PopMensajeData} from "../../../../interface/popMensajeData.interface";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit{
  mensaje: string;

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopMensajeData
  ) {
    this.mensaje = "";
  }

  ngOnInit() {
    this.mensaje = this.data.mensaje;
  }

  onCloseClick(): void {
    this.dialogRef.close(true);
  }

}
