import { Component, DestroyRef, HostListener, inject, Input, OnChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { UtilityService } from 'src/app/helper/utilityService';
import { MessageControlCalidadService } from 'src/app/message/message-control-calidad.service';
import { ActaPendienteControlCalidad } from 'src/app/model/control-calidad/ActaPendienteControlCalidad';
import { DataPaso3 } from 'src/app/model/control-calidad/DataPaso3';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { ControlCalidadService } from 'src/app/service/control-calidad.service';
import { VerificacionActaService } from 'src/app/service/verificacion-acta.service';

@Component({
  selector: 'app-paso3-cc',
  templateUrl: './paso3-cc.component.html',
})
export class Paso3CcComponent implements OnChanges {
  
  @Input() acta: ActaPendienteControlCalidad;

  dataPaso3: DataPaso3;

  srcImgAgrupol: string = '';
  srcImgVotos1: string = '';
  srcImgPreferenciales: string[];

  indiceActualPref: number = 0;
  revisoTodoPreferenciales: boolean = false;

  readonly tituloMenu = 'Control de Calidad';  
  destroyRef: DestroyRef = inject(DestroyRef);

  constructor(    
        private readonly controlCalidadService: ControlCalidadService,
        private readonly utilityService: UtilityService,
        private readonly verificacionActaService: VerificacionActaService,
        private readonly messageControlCalidadService: MessageControlCalidadService,
      ){}

  ngOnChanges(): void {
    this.recoverData();
  }

  

  private recoverData() {
    this.messageControlCalidadService.dataPaso3
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (data) => {
            if(data) {
              this.dataPaso3 = data;
              this.recoverSrcImages();
            } else {
              this.obtenerDataInicial();
            }
          }
        }
      );
  }

  private recoverSrcImages() {
    this.messageControlCalidadService.srcImagenesAgrupolPaso3
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (srcImages) => {
            if(srcImages) {
              this.srcImgAgrupol = srcImages.srcImgAgrupol;
              this.srcImgVotos1 = srcImages.srcImgVotos1;
            } else {
              this.obtenerImagesAgrupol();
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
          } else {
            if(this.isPreferencial) {
              this.obtenerImagesPreferenciales();
            }            
          }
        }
      }
    );
  }

  private obtenerDataInicial() {
    sessionStorage.setItem('loading', 'true');
    this.controlCalidadService.obtenerDataPaso3(this.acta.idActa)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response) => {
            sessionStorage.setItem('loading', 'false');
            if(response.success){
              this.dataPaso3 = response.data;
              this.dataPaso3.idActa = this.acta.idActa;
              this.messageControlCalidadService.dataPaso3.next(this.dataPaso3);
              if(this.dataPaso3.imagenesAgrupol){
                this.obtenerImagesAgrupol();
              } else {
                this.loadImagesAgrupol(null);
              }
              
              if(this.isPreferencial && this.dataPaso3.imagenesPreferencial) {
                this.obtenerImagesPreferenciales();
              } else {
                this.loadImagesPreferenciales(null);
              }
            } else {
              this.utilityService.mensajePopup(this.tituloMenu, 
                            response.message, 
                            IconPopType.ERROR);
            }                      
          }, 
          error: () => {            
            sessionStorage.setItem('loading', 'false');
            this.utilityService.mensajePopup(this.tituloMenu, 
                            'Ocurrió un error al obtener los datos del paso 3', 
                            IconPopType.ERROR);
          }
        }
      );        
  }

  private obtenerImagesAgrupol() {
    sessionStorage.setItem('loading', 'true');
    forkJoin([this.verificacionActaService.getFileV2(this.dataPaso3.imagenesAgrupol?.votos_1?.file).catch(() => null),
            this.verificacionActaService.getFileV2(this.dataPaso3.imagenesAgrupol?.votos_2?.file).catch(() => null)])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (blobs) => {
            sessionStorage.setItem('loading', 'false');
            this.loadImagesAgrupol(blobs);       
          },
          error: () => {
            sessionStorage.setItem('loading', 'false');                         
          }
        }
      );
  }

  private loadImagesAgrupol(blobs: Blob[]) {
    this.srcImgAgrupol = blobs?.[0] ? this.getSrcImage(blobs[0]) : null;
    this.srcImgVotos1 = blobs?.[1] ? this.getSrcImage(blobs[1]) : this.isPreferencial ?  Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso3-total-votos-preferencial.png' 
                                                                        : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso3-total-votos-presidente.png'; 
    this.messageControlCalidadService.srcImagenesAgrupolPaso3.next(
      {
        srcImgAgrupol: this.srcImgAgrupol,
        srcImgVotos1: this.srcImgVotos1
      }
    );
  }

  private obtenerImagesPreferenciales() {
    let promisesPref: Promise<Blob>[] = [];
    let keyPref = 'votos_';
    let key;
    for(let i = 1; i <= this.dataPaso3.numeroColumnasPref; i++){
      key = `${keyPref}${i}`;
      promisesPref.push(this.verificacionActaService.getFileV2(this.dataPaso3.imagenesPreferencial[key].file).catch(() => null));
    }

    sessionStorage.setItem('loading', 'true');
    forkJoin(promisesPref)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (blobs) => {
            sessionStorage.setItem('loading', 'false');            
            this.loadImagesPreferenciales(blobs);       
          },
          error: () => {
            sessionStorage.setItem('loading', 'false');            
          }
        }
      );
  }

  private loadImagesPreferenciales(blobs: Blob[]) {
    if(blobs) {
      this.srcImgPreferenciales = blobs.map( blob => blob ? this.getSrcImage(blob) : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso3-voto-preferencial.png');
    } else {
      this.srcImgPreferenciales = Array(this.dataPaso3.numeroColumnasPref).fill(Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso3-voto-preferencial.png');
    }
    this.messageControlCalidadService.srcImagenesPrefPaso3.next(this.srcImgPreferenciales);
  }

  private getSrcImage(srcImage: Blob): string{
    if(!srcImage) return null;    
    return URL.createObjectURL(srcImage);      
  }  

  public get isPreferencial() {
    return this.dataPaso3?.numeroColumnasPref > 0;
  }

  public revisoTodosPreferenciales(reviso: boolean) {
    this.revisoTodoPreferenciales = reviso;
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 1) {
      if(this.isPreferencial) {
        if(this.revisoTodoPreferenciales) {
          this.messageControlCalidadService.revisoPaso3.next(true);
        }        
      } else {
        this.messageControlCalidadService.revisoPaso3.next(true);
      }
    }
  }

}
