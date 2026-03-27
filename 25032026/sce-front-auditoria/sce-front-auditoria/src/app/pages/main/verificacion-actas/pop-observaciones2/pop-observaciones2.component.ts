import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Pop2VerificacionData} from "../../../../interface/pop2VerificacionData.interface";

@Component({
  selector: 'app-pop-observaciones2',
  templateUrl: './pop-observaciones2.component.html',
})
export class PopObservaciones2Component implements OnInit{

  public pngImageUrlObservacionEscrutinio: string;
  public solicitudNulidad: boolean;
  constructor(public dialogRef: MatDialogRef<PopObservaciones2Component>,
              @Inject(MAT_DIALOG_DATA) public data: Pop2VerificacionData) {
    this.pngImageUrlObservacionEscrutinio = "";
    this.solicitudNulidad = false;
  }
  ngOnInit() {
    this.pngImageUrlObservacionEscrutinio = this.data.pngImageUrlObservacionEscrutinio;
    this.solicitudNulidad = this.data.solicitudNulidad;
  }
  changeSolicitudNulidad(){
    this.solicitudNulidad = !this.solicitudNulidad;
  }


  aceptarPop2(){
    this.dialogRef.close(this.solicitudNulidad);
  }

  onKeyDownSolNulidad(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
      this.changeSolicitudNulidad();
    }
  }


}
