import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PopMensajeData} from "../../../interface/popMensajeData.interface";
import {IconPopType} from '../../../model/enum/iconPopType';

@Component({
  selector: 'app-pop-mensaje',
  templateUrl: './pop-mensaje.component.html'
})
export class PopMensajeComponent implements OnInit{
  mensaje: string;
  title: string;
  icon:string;
  questions: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PopMensajeData,
              public dialogRef: MatDialogRef<PopMensajeComponent>) {
    this.title = "";
    this.mensaje = "";
    this.icon = "";
  }

  ngOnInit() {
    this.mensaje = this.data.mensaje;
    this.title = this.data.title;
    this.icon = this.data.icon;
    this.questions = this.data.isQuestion;
  }

  aceptar(){
    this.dialogRef.close(true);
  }

  protected readonly IconPopType = IconPopType;
}
