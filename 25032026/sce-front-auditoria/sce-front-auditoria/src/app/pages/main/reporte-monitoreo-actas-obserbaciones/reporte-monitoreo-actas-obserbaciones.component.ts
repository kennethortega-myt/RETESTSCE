import {Component, Input, OnInit} from '@angular/core';
import {ObservacionBean} from "../../../model/observacionBean";
import {MatDialog} from "@angular/material/dialog";
import {PopObservacionesActaComponent} from "./pop-observaciones-acta/pop-observaciones.acta.component";
import {PopObservacionesDetalleComponent} from "./pop-observaciones-detalle/pop-observaciones.detalle.component";

@Component({
  selector: 'app-reporte-monitoreo-actas-obserbaciones',
  templateUrl: './reporte-monitoreo-actas-obserbaciones.component.html',
  styleUrls: ['./reporte-monitoreo-actas-obserbaciones.component.scss']
})
export class ReporteMonitoreoActasObserbacionesComponent  implements OnInit {

  @Input() OBSERVACIONES: Array<ObservacionBean>;
  @Input() OBSERVACIONES_ACTA: Array<ObservacionBean>;
  @Input() OBSERVACIONES_ACTA_DETALLE: Array<ObservacionBean>;

  public observacionesActaLocal: Array<ObservacionBean>;
  public observacionesActaDetalleLocal: Array<ObservacionBean>;

  constructor(
    public dialog: MatDialog
  ) {
    this.observacionesActaLocal = [];
    this.observacionesActaDetalleLocal = [];
  }

  ngOnInit() {
    this.observacionesActaLocal = this.OBSERVACIONES_ACTA;
    this.observacionesActaDetalleLocal = this.OBSERVACIONES_ACTA_DETALLE;
  }

  observacionesActa(){
    const dialogRef = this.dialog.open(PopObservacionesActaComponent,{
      data : {
        observaciones_acta: this.observacionesActaLocal
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  observacionesDetalle(){
    const dialogRef = this.dialog.open(PopObservacionesDetalleComponent,{
      data : {
        observaciones_acta_detalle: this.observacionesActaDetalleLocal
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}
