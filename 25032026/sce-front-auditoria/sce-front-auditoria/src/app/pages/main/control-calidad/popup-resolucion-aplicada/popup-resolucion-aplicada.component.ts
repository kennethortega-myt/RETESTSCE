import { AfterViewInit, Component, DestroyRef, ElementRef, HostListener, inject, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataPopupVerResolucion } from 'src/app/model/control-calidad/DataPopupVerResolucion';

import { MessageControlCalidadService } from 'src/app/message/message-control-calidad.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataPaso3, DetalleActa, VotosResolucionAplicada } from 'src/app/model/control-calidad/DataPaso3';
import { ControlCalidadService } from 'src/app/service/control-calidad.service';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { Constantes } from 'src/app/helper/constantes';

@Component({
  selector: 'app-popup-resolucion-aplicada',  
  templateUrl: './popup-resolucion-aplicada.component.html',
})
export class PopupResolucionAplicadaComponent implements AfterViewInit{

  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;
  datosResolucion: DataPopupVerResolucion;  

  dataPaso3: DataPaso3;
  srcImgAgrupol: string = '';
  srcImgVotos1: string = '';
  srcImgPreferenciales: string[];
  revisoTodoPreferenciales: boolean = false;
  votosResolucionAplicada: VotosResolucionAplicada;
  
  readonly tituloMenu = 'Control de Calidad';
  destroyRef: DestroyRef = inject(DestroyRef);

  constructor(@Inject(MAT_DIALOG_DATA) public data: DataPopupVerResolucion,
              public dialogRef: MatDialogRef<PopupResolucionAplicadaComponent>,              
              private readonly controlCalidadService: ControlCalidadService,
              private readonly messageControlCalidadService: MessageControlCalidadService,
              private readonly utilityService: UtilityService,
            ) {
    this.datosResolucion = data;
  }

  ngAfterViewInit(): void {
    this.loadResolucionPdf();
    this.loadImages(); 
    this.obtenerVotosAntesDespues(); 
  }

  private loadResolucionPdf(){    
    this.midivReporte.nativeElement.innerHTML = '';
    if(this.datosResolucion.archivoResolucion){
      const blobUrl = URL.createObjectURL(this.datosResolucion.archivoResolucion);
      let object = document.createElement("object");
      object.setAttribute("width", "100%");
      object.setAttribute("height", "590px");
      object.setAttribute("data", blobUrl);
      this.midivReporte.nativeElement.insertAdjacentElement('afterbegin', object);  
    }      
  }

  private loadImages() {
    this.messageControlCalidadService.dataPaso3
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (data) => {
            if(data) {
              this.dataPaso3 = data;              
            }
          }
        }
      );
    this.messageControlCalidadService.srcImagenesAgrupolPaso3
      .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(
          {
            next: (srcImages) => {
              if(srcImages) {
                this.srcImgAgrupol = srcImages.srcImgAgrupol;
                this.srcImgVotos1 = srcImages.srcImgVotos1;
              }            
            }
          }
        );
      this.messageControlCalidadService.srcImagenesPrefPaso3
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(
          {
            next: (srcImages) => {
              if(srcImages) {
                this.srcImgPreferenciales = srcImages;
              }
            }
          }
        );
  }

  public descargarPdf(){
    const blobUrl = URL.createObjectURL(this.datosResolucion.archivoResolucion);
    let a = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    a.download = `Resolucion-${this.datosResolucion.nombreResolucion}`;
    document.body.appendChild(a);
    a.click();
  }

  public get isPreferencial() {
    return this.dataPaso3?.imagenesPreferencial && this.dataPaso3?.numeroColumnasPref > 0;
  }

  public revisoTodosPreferenciales(reviso: boolean) {
    this.revisoTodoPreferenciales = reviso;
  }

  private obtenerVotosAntesDespues() {    
    this.controlCalidadService.obtenerHistorialAntesDespues(this.datosResolucion.idActa, this.datosResolucion.idResolucion)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      {
        next: (response) => {
          sessionStorage.setItem('loading', 'false');
          this.construirVotos(response.data);
        },
        error: () => {        
          sessionStorage.setItem('loading', 'false');
          this.utilityService.mensajePopup(this.tituloMenu, 
                          'Ocurrió un error al obtener el historial de los votos de la resolución', 
                          IconPopType.ERROR);
        }
      }
    );
  }
  
  private construirVotos(dataVotos: any) {    
    this.votosResolucionAplicada = {
      votosAntes: this.votosAgrupol(dataVotos?.actaAntes?.agrupacionesPoliticas),
      votosAntesPreferenciales: this.votosPreferenciales(dataVotos?.actaAntes?.agrupacionesPoliticas),
      votosDespues: this.votosAgrupol(dataVotos?.actaDespues?.agrupacionesPoliticas),
      votosDespuesPreferenciales: this.votosPreferenciales(dataVotos?.actaDespues?.agrupacionesPoliticas),
      cvasAntes: dataVotos?.actaAntes?.cvas,
      cvasDespues: dataVotos?.actaDespues?.cvas,
      solicitudNulidadAntes: dataVotos?.actaAntes?.solicitudNulidad,
      solicitudNulidadDespues: dataVotos?.actaDespues?.solicitudNulidad,
      actaSinFirmaAntes: dataVotos?.actaAntes?.sinFirma,
      actaSinFirmaDespues: dataVotos?.actaDespues?.sinFirma,
    };

    if(!this.showTabResolAplicada) { 
      //Si el tab de votos no se habilita, marcamos la resol como revisado
      this.messageControlCalidadService.revisoResoluciones.next(this.datosResolucion.idResolucion);
    }
  }

  get showTabResolAplicada() {
    return (this.votosResolucionAplicada?.votosAntes && this.votosResolucionAplicada?.votosAntes.length > 0) ||
            (this.votosResolucionAplicada?.votosDespues && this.votosResolucionAplicada?.votosDespues.length > 0)    
  }

  private votosAgrupol(agrupaciones: any): DetalleActa[] {

    if(!agrupaciones || agrupaciones.length == 0) return [];

    return agrupaciones?.map( agrupacion => {
        return {
          idAgrupacion: agrupacion.idAgrupol,
          posicion: agrupacion.posicion,
          votos: agrupacion?.ilegible === Constantes.VALUE_ILEGIBLE ? Constantes.VALUE_ILEGIBLE : agrupacion.votos,
          estado: agrupacion.estado
        }});
  }

  private votosPreferenciales(agrupaciones: any):  DetalleActa[][] {
    if(!agrupaciones || agrupaciones.length == 0) return [];

    let votosPreferencialesAntes: DetalleActa[][] = [];
    let columnaPreferencial: DetalleActa[];    

    for(let i = 1; i <= this.dataPaso3?.numeroColumnasPref; i++) {
      columnaPreferencial = [];
      let votoPreferencial;
      agrupaciones.forEach( agrupacion => {
        votoPreferencial = agrupacion.votosPreferenciales.find( preferencial => preferencial.lista === i );        
        columnaPreferencial.push({
          idAgrupacion: agrupacion.idAgrupol,
          posicion: agrupacion.posicion,
          votos: votoPreferencial?.ilegible === Constantes.VALUE_ILEGIBLE ? Constantes.VALUE_ILEGIBLE : votoPreferencial?.votos,
          estado: votoPreferencial?.estado,
        });
      });
      votosPreferencialesAntes.push(columnaPreferencial);
    }    
     return votosPreferencialesAntes;
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {     
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 1) {
      if(this.isPreferencial) {
        if(this.revisoTodoPreferenciales) {
          this.messageControlCalidadService.revisoResoluciones.next(this.datosResolucion.idResolucion);
        }        
      } else {
        this.messageControlCalidadService.revisoResoluciones.next(this.datosResolucion.idResolucion);
      }
    }
  }  
}


