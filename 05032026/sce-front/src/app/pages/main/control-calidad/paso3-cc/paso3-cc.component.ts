import { Component, DestroyRef, HostListener, inject, Input, OnChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
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
  styleUrl: './paso3-cc.component.scss'
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
              this.messageControlCalidadService.dataPaso3.next(this.dataPaso3);
              this.obtenerImagesAgrupol();
              if(this.isPreferencial) {
                this.obtenerImagesPreferenciales();
              }
            } else {
              this.utilityService.mensajePopup(this.tituloMenu, 
                            response.message, 
                            IconPopType.ERROR);
            }                      
          }, 
          error: () => {
            this.messageControlCalidadService.hayErrorImagenes.next(true);
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
    forkJoin([this.verificacionActaService.getFileV2(this.dataPaso3.imagenesAgrupol?.votos_1?.file),
            this.verificacionActaService.getFileV2(this.dataPaso3.imagenesAgrupol?.votos_2?.file)])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (blobs) => {
            sessionStorage.setItem('loading', 'false');
            this.messageControlCalidadService.hayErrorImagenes.next(false);
            this.loadImagesAgrupol(blobs);       
          },
          error: () => {
            sessionStorage.setItem('loading', 'false');
            this.messageControlCalidadService.hayErrorImagenes.next(true);
            this.utilityService.mensajePopup(this.tituloMenu, 
                            'Ocurrió un error al obtener las imágenes del paso 3', 
                            IconPopType.ERROR);                
          }
        }
      );
  }

  private loadImagesAgrupol(blobs: Blob[]) {
    this.srcImgAgrupol = this.getSrcImage(blobs[0]);
    this.srcImgVotos1 = this.getSrcImage(blobs[1]); 
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
      promisesPref.push(this.verificacionActaService.getFileV2(this.dataPaso3.imagenesPreferencial[key].file));
    }

    sessionStorage.setItem('loading', 'true');
    forkJoin(promisesPref)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (blobs) => {
            sessionStorage.setItem('loading', 'false');
            this.messageControlCalidadService.hayErrorImagenes.next(false);
            this.loadImagesPreferenciales(blobs);       
          },
          error: () => {
            sessionStorage.setItem('loading', 'false');
            this.messageControlCalidadService.hayErrorImagenes.next(true);
            this.utilityService.mensajePopup(this.tituloMenu, 
                            'Ocurrió un error al obtener las imágenes preferenciales.', 
                            IconPopType.ERROR);                
          }
        }
      );
  }

  private loadImagesPreferenciales(blobs: Blob[]) {
    this.srcImgPreferenciales = blobs.map( blob => this.getSrcImage(blob));
    this.messageControlCalidadService.srcImagenesPrefPaso3.next(this.srcImgPreferenciales);
  }

  private getSrcImage(srcImage: Blob): string{
    if(!srcImage) return null;    
    return URL.createObjectURL(srcImage);      
  }  

  public get isPreferencial() {
    return this.dataPaso3?.imagenesPreferencial && this.dataPaso3?.numeroColumnasPref > 0;
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
