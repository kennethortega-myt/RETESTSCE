import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PopMensajeDataGenerica} from "../../../interface/popMensajeDataGenerica.interface";
import {IconPopType} from '../../../model/enum/iconPopType';

@Component({
  selector: 'app-pop-mensaje-data-generica',
  templateUrl: './pop-mensaje-data-generica.component.html',
  styleUrls: ['./pop-mensaje-data-generica.component.scss']
})
export class PopMensajeDataGenericaComponent<T> implements OnInit{
  dataList: Array<string>;
  title: string;
  icon:string;
  questions: boolean = false;

  displayedColumns: string[] = ['index', 'value'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: PopMensajeDataGenerica<T>,
              public dialogRef: MatDialogRef<PopMensajeDataGenericaComponent<T>>) {
    this.title = "";
    this.dataList = [];
    this.icon = "";
  }

  ngOnInit() {
    this.dataList = Array.isArray(this.data.mensaje) ? this.data.mensaje : [];
    this.title = this.data.title;
    this.icon = this.data.icon;
    this.questions = this.data.isQuestion;
  }
  aceptar(){
    this.dialogRef.close(true);
  }
  protected readonly Array = Array;
  protected readonly IconPopType = IconPopType;
}
