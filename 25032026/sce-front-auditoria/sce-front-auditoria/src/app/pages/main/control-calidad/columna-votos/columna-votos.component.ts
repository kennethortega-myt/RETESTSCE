import { Component, Input } from '@angular/core';
import { Constantes } from 'src/app/helper/constantes';
import { DetalleActa } from 'src/app/model/control-calidad/DataPaso3';

@Component({
  selector: 'app-columna-votos',
  templateUrl: './columna-votos.component.html',
  styleUrl: './columna-votos.component.scss'
})
export class ColumnaVotosComponent {

  @Input() isPreferencial: boolean;
  @Input() detalleVotos: DetalleActa[];
  @Input() indiceActualPref: number;
  @Input() isResolucionAplicada: boolean = false;
  @Input() cvas: string;
  @Input() titulo: string;
  @Input() isSolicitudNulidad: boolean = false;
  @Input() isNotEqualCvas: boolean = false;
  @Input() isActaSinFirma: boolean = false;

  public get codigoAchurado() {
    return Constantes.CODIGO_ESTADO_ACHURADO;
  }

  public showVoto(idAgrupacion: number) {
    return !this.isPreferencial || this.indiceActualPref === 0 || 
          (idAgrupacion !== Constantes.CODI_VOTOS_BLANCOS && 
          idAgrupacion !== Constantes.CODI_VOTOS_IMPUGNADOS && 
          idAgrupacion !== Constantes.CODI_VOTOS_NULOS);
  }

  public classVoto(detalleVoto: DetalleActa): string {    
    if(detalleVoto.estado === this.codigoAchurado) {      
      return 'achurado';
    } else if(detalleVoto.hayDiferencia) {
      return 'diferencias';
    }
    
    return '';
  }
}
