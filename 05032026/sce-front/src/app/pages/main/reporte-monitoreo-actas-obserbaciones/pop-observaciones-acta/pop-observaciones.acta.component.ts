import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PopObservacionesActaData} from "../../../../interface/popObservacionesActaData.interface";
import {ObservacionBean} from "../../../../model/observacionBean";

@Component({
  selector: 'app-pop-observaciones-acta',
  templateUrl: './pop-observaciones-acta.component.html',
  styleUrls: ['./pop-observaciones.acta.component.scss']
})
export class PopObservacionesActaComponent implements OnInit{

  displayedColumns: string[] = ['codigo','descripcion'];
  dataSource: Array<ObservacionBean>;

  public observacionesData: Array<ObservacionBean>;

  constructor(public dialogRef: MatDialogRef<PopObservacionesActaComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PopObservacionesActaData) {
    this.observacionesData = [];
    this.dataSource = [];
  }

  ngOnInit() {
    this.observacionesData = this.data.observaciones_acta;
    this.dataSource= this.observacionesData;
  }

  aceptar(){
    this.dialogRef.close();
  }
}

export interface PeriodicElement{
  idEleccion: string;
  eleccion: string;
  codigo: string;
  descripcion: string;
  tipo: string;
}

