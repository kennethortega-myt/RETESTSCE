import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PopVerificacionData} from "../../../../interface/popVerificacionData.interface";

@Component({
  selector: 'app-pop-observaciones',
  templateUrl: './pop-observaciones.component.html',
})
export class PopObservacionesComponent implements OnInit{
  public pngImageUrlObservacionEscrutinio: string;
  public pngImageUrlObservacionInstalacion: string;
  public pngImageUrlObservacionSufragio: string;

  constructor(public dialogRef: MatDialogRef<PopObservacionesComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PopVerificacionData) {
    this.pngImageUrlObservacionEscrutinio = "";
    this.pngImageUrlObservacionInstalacion = "";
    this.pngImageUrlObservacionSufragio = "";
  }

  ngOnInit() {
    this.pngImageUrlObservacionEscrutinio = this.data.pngImageUrlObservacionEscrutinio;
    this.pngImageUrlObservacionInstalacion = this.data.pngImageUrlObservacionInstalacion;
    this.pngImageUrlObservacionSufragio = this.data.pngImageUrlObservacionSufragio;
  }

}
