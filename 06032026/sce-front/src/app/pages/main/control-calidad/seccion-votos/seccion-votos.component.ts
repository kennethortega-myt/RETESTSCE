import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Constantes } from 'src/app/helper/constantes';
import { DataPaso3, DetalleActa, VotosResolucionAplicada } from 'src/app/model/control-calidad/DataPaso3';

@Component({
  selector: 'app-seccion-votos',
  templateUrl: './seccion-votos.component.html',
  styleUrl: './seccion-votos.component.scss'
})
export class SeccionVotosComponent implements OnChanges{
  
  
  @Input() dataPaso3: DataPaso3;
  @Input() srcImgAgrupol: string = '';
  @Input() srcImgVotos1: string = '';
  @Input() srcImgPreferenciales: string[];
  @Input() isResolucionAplicada: boolean = false;
  @Input() votosResolucionAplicada: VotosResolucionAplicada;
  @Output() revisoTodosPreferenciales = new EventEmitter<boolean>();

  indiceActualPref: number = 0;  

  ngOnChanges(): void {    
    //Buscamos diferencias entre los votos antes y después para resaltarlos
    if(this.isResolucionAplicada && this.votosResolucionAplicada && this.votosResolucionAplicada.votosAntes && this.votosResolucionAplicada.votosAntes.length > 0
      && this.votosResolucionAplicada.votosDespues && this.votosResolucionAplicada.votosDespues.length > 0
    ) {      
      this.votosResolucionAplicada.votosAntes.forEach( (voto, index) => {
          if(this.isNotEqualvotes(voto.votos, this.votosResolucionAplicada.votosDespues[index].votos) ) {
            this.votosResolucionAplicada.votosAntes[index].hayDiferencia = true;
            this.votosResolucionAplicada.votosDespues[index].hayDiferencia = true;
          }
      });
      
      if(this.isPreferencial) {
        this.votosResolucionAplicada.votosAntesPreferenciales.forEach( (votosPreferenciales, indexPref) => {
            votosPreferenciales.forEach( (voto, index) => {
                if(this.isNotEqualvotes(voto?.votos, this.votosResolucionAplicada?.votosDespuesPreferenciales[indexPref][index]?.votos)) {
                    this.votosResolucionAplicada.votosAntesPreferenciales[indexPref][index].hayDiferencia = true;
                    this.votosResolucionAplicada.votosDespuesPreferenciales[indexPref][index].hayDiferencia = true;
                }
            } );
        })
      }      
    }
    
  }

  private isNotEqualvotes(voto1: string, voto2: string) {
    if((!voto1 || voto1.trim() === '' || voto1.trim() === '0') && (!voto2 || voto2.trim() === '' || voto2.trim() === '0')) return false;

    if(voto1 === voto2) return false;

    return true;
  }
  
  public isNotEqualsCvas() {
    return this.isNotEqualvotes(this.votosResolucionAplicada?.cvasAntes, this.votosResolucionAplicada?.cvasDespues);
  }

  public previousPreferencial() {
    this.indiceActualPref--;
  }

  public nextPreferencial() {
    this.indiceActualPref ++;
    if(this.indiceActualPref === this.dataPaso3?.numeroColumnasPref) {
      this.revisoTodosPreferenciales.emit(true);
    }
  }

  public get isPreferencial(): boolean {
    return this.dataPaso3?.imagenesPreferencial && this.dataPaso3?.numeroColumnasPref > 0;
  }

  public get codigoAchurado() {
    return Constantes.CODIGO_ESTADO_ACHURADO;
  }

  public get srcImagePreferencialActual(): string {
    if(this.indiceActualPref === 0) {
      return this.srcImgVotos1;
    } else {
      return this.srcImgPreferenciales[this.indiceActualPref - 1];
    }
  }

  public get showNextPreferencial(): boolean {
    return this.isPreferencial && this.indiceActualPref < this.dataPaso3?.numeroColumnasPref;
  }

  public get showPreviousPreferencial(): boolean {
    return this.isPreferencial && this.indiceActualPref > 0;
  }

  public get detalleVotosPaso3(): DetalleActa[] {
    if(this.indiceActualPref === 0) {
      return this.dataPaso3?.detActaAgrupol;
    } else {
      return this.dataPaso3?.detActaPreferenciales[this.indiceActualPref - 1];
    }
  }

  public get detalleVotosAntes(): DetalleActa[] {
    if(this.isResolucionAplicada) {
      if(this.indiceActualPref === 0) {
        return this.votosResolucionAplicada?.votosAntes;
      } else {
        return this.votosResolucionAplicada?.votosAntesPreferenciales[this.indiceActualPref - 1];
      }
    }
    return null;
  }

  public get detalleVotosDespues(): DetalleActa[] {
    if(this.isResolucionAplicada) {
      if(this.indiceActualPref === 0) {
        return this.votosResolucionAplicada?.votosDespues;
      } else {
        return this.votosResolucionAplicada?.votosDespuesPreferenciales[this.indiceActualPref - 1];
      }
    }
    return null;
  }  

  public get classImgVotoCol(): string {
    if(this.isPreferencial) {
      if(this.indiceActualPref === 0) {
        return 'img-agrupol-pref';
      } else {
        return 'img-pref-col';
      }
    } else {
      return 'img-agrupol-pres';
    }
  }

  public showVoto(idAgrupacion: number) {
    return !this.isPreferencial || this.indiceActualPref === 0 || 
          (idAgrupacion !== Constantes.CODI_VOTOS_BLANCOS && 
          idAgrupacion !== Constantes.CODI_VOTOS_IMPUGNADOS && 
          idAgrupacion !== Constantes.CODI_VOTOS_NULOS);
  }

}
