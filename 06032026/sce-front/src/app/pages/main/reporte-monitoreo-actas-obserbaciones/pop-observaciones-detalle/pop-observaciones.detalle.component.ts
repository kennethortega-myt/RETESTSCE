import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PopObservacionesActaDetalleData} from "../../../../interface/popObservacionesActaDetalleData.interface";
import {ObservacionBean} from "../../../../model/observacionBean";

@Component({
  selector: 'app-pop-observaciones-detalle',
  templateUrl: './pop-observaciones-detalle.component.html',
})
export class PopObservacionesDetalleComponent implements OnInit{

  displayedColumns: string[] = ['codigo','descripcion'];
  dataSource: Array<ObservacionBean>;

  public observacionesData: Array<ObservacionBean>;

  constructor(public dialogRef: MatDialogRef<PopObservacionesDetalleComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PopObservacionesActaDetalleData) {
    this.observacionesData = [];
    this.dataSource = [];
  }

  ngOnInit() {
    this.dataSource = this.data.observaciones_acta_detalle;
  }

  aceptar(){
    this.dialogRef.close();
  }
}
