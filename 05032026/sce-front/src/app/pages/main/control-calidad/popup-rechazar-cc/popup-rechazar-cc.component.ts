import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilityService } from 'src/app/helper/utilityService';
import { DataPopupRechazarCC, DatosActaRechazar } from 'src/app/model/control-calidad/DataPopupRechazar';
import { IconPopType } from 'src/app/model/enum/iconPopType';

@Component({
  selector: 'app-popup-rechazar-cc',
  templateUrl: './popup-rechazar-cc.component.html',
  styleUrl: './popup-rechazar-cc.component.scss'
})
export class PopupRechazarCcComponent {

  datosRechazar: DataPopupRechazarCC;  
  listaResolucionesSeleccionadas: number[] = [];

  readonly tituloMenu = 'Control de Calidad';

  constructor(@Inject(MAT_DIALOG_DATA) public data: DataPopupRechazarCC,    
              public dialogRef: MatDialogRef<PopupRechazarCcComponent>,
              private readonly utilityService: UtilityService,
            ) {
    this.datosRechazar = data;    
  }

  aceptarRechazar() {
    if(this.listaResolucionesSeleccionadas.length === 0) {
      this.utilityService.mensajePopup(this.tituloMenu, 
                    'Debe seleccionar al menos una resolución.', 
                    IconPopType.ALERT);                          
    } else {
      const datosRechazar: DatosActaRechazar = {
        idActa: this.datosRechazar.acta.idActa,
        idsResoluciones: this.listaResolucionesSeleccionadas
      }
      this.dialogRef.close(datosRechazar);
    }
  }

  changeCheckResolucion(checked: boolean, idResolucion: number) {
    if(checked){
      this.listaResolucionesSeleccionadas.push(idResolucion);
    } else {
      this.listaResolucionesSeleccionadas = this.listaResolucionesSeleccionadas.filter(resol => resol !== idResolucion);
    }
  }

  cancelarRechazar() {
     this.dialogRef.close();
  }
}
