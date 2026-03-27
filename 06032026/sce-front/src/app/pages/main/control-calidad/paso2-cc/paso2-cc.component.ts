import { AfterViewInit, Component, DestroyRef, ElementRef, HostListener, inject, Input, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { Utility } from 'src/app/helper/utility';
import { UtilityService } from 'src/app/helper/utilityService';
import { MessageControlCalidadService } from 'src/app/message/message-control-calidad.service';
import { ActaPendienteControlCalidad } from 'src/app/model/control-calidad/ActaPendienteControlCalidad';
import { DataPaso2, SrcImagenesPaso2 } from 'src/app/model/control-calidad/DataPaso2';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { ControlCalidadService } from 'src/app/service/control-calidad.service';
import { VerificacionActaService } from 'src/app/service/verificacion-acta.service';

@Component({
  selector: 'app-paso2-cc',
  templateUrl: './paso2-cc.component.html',
  styleUrl: './paso2-cc.component.scss'
})
export class Paso2CcComponent implements AfterViewInit {
  
  @Input() acta: ActaPendienteControlCalidad;

  @ViewChild('canvasFirmaPresInst') canvasFirmaPresInst: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasFirmaSecreInst') canvasFirmaSecreInst: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasFirmaTercerInst') canvasFirmaTercerInst: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasObsInst') canvasObsInst: ElementRef<HTMLCanvasElement>;

  @ViewChild('canvasFirmaPresSuf') canvasFirmaPresSuf: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasFirmaSecreSuf') canvasFirmaSecreSuf: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasFirmaTercerSuf') canvasFirmaTercerSuf: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasObsSuf') canvasObsSuf: ElementRef<HTMLCanvasElement>;    

  srcImagesPaso2: SrcImagenesPaso2;
  isActaConFirma: boolean = false;

  readonly tituloMenu = 'Control de Calidad';  
  destroyRef: DestroyRef = inject(DestroyRef);


  constructor(    
      private readonly controlCalidadService: ControlCalidadService,
      private readonly utilityService: UtilityService,
      private readonly verificacionActaService: VerificacionActaService,
      private readonly messageControlCalidadService: MessageControlCalidadService,
    ){}

  ngAfterViewInit(): void {     
    this.recoverImages();
  }  

  private recoverImages() {
    this.messageControlCalidadService.srcImagenesPaso2
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response) => {
            if(response) {
              if(!this.srcImagesPaso2) {
                this.srcImagesPaso2 = response;
                this.isActaConFirma = this.srcImagesPaso2.actaConFirma;                
                this.rotateImages();
              }
            } else {
              this.obtenerDataInicial();
            }
          }
        }
      );
  }

  private obtenerDataInicial() {
    sessionStorage.setItem('loading', 'true');
    this.controlCalidadService.obtenerDataPaso2(this.acta.idActa)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (data) => {
            sessionStorage.setItem('loading', 'false');
            this.isActaConFirma = data.actaConFirma;
            if(!Utility.objectHasNullAttribute(data)){
              this.obtenerImages(data);
            } else {
              this.errorLoadImages();
            }            
          }, 
          error: () => {
            this.messageControlCalidadService.hayErrorImagenes.next(true);
            sessionStorage.setItem('loading', 'false');
            this.errorLoadImages();
          }
        }
      );        
  }

  private obtenerImages(data: DataPaso2) {
    sessionStorage.setItem('loading', 'true');
    forkJoin(this.getPromisesBlobImages(data))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (blobs) => {
            sessionStorage.setItem('loading', 'false');
            this.messageControlCalidadService.hayErrorImagenes.next(false);
            this.setSrcImages(blobs, data);
            this.rotateImages();
          },
          error: () => {
            sessionStorage.setItem('loading', 'false');
            this.errorLoadImages();                
          }
        }
      );
  }

  private getPromisesBlobImages(data: DataPaso2): Promise<Blob>[] {
    return [this.verificacionActaService.getFileV2(data.idImgFirmaPresidenteEsc),
            this.verificacionActaService.getFileV2(data.idImgFirmaSecretarioEsc),
            this.verificacionActaService.getFileV2(data.idImgFirmaTercerMiembroEsc),
            this.verificacionActaService.getFileV2(data.idImgFirmaPresidenteIns),
            this.verificacionActaService.getFileV2(data.idImgFirmaSecretarioIns),
            this.verificacionActaService.getFileV2(data.idImgFirmaTercerMiembroIns),
            this.verificacionActaService.getFileV2(data.idImgFirmaPresidenteSuf),
            this.verificacionActaService.getFileV2(data.idImgFirmaSecretarioSuf),
            this.verificacionActaService.getFileV2(data.idImgFirmaTercerMiembroSuf),
            this.verificacionActaService.getFileV2(data.idImgObsEscrutinio),
            this.verificacionActaService.getFileV2(data.idImgObsInstalacion),
            this.verificacionActaService.getFileV2(data.idImgObsSufragio),
          ];
  }

  private rotateImages() {    
    Utility.rotateImage(this.srcImagesPaso2.srcImgFirmaPresidenteIns, this.canvasFirmaPresInst.nativeElement);
    Utility.rotateImage(this.srcImagesPaso2.srcImgFirmaSecretarioIns, this.canvasFirmaSecreInst.nativeElement);
    Utility.rotateImage(this.srcImagesPaso2.srcImgFirmaTercerMiembroIns, this.canvasFirmaTercerInst.nativeElement);

    Utility.rotateImage(this.srcImagesPaso2.srcImgFirmaPresidenteSuf, this.canvasFirmaPresSuf.nativeElement);
    Utility.rotateImage(this.srcImagesPaso2.srcImgFirmaSecretarioSuf, this.canvasFirmaSecreSuf.nativeElement);
    Utility.rotateImage(this.srcImagesPaso2.srcImgFirmaTercerMiembroSuf, this.canvasFirmaTercerSuf.nativeElement);
    
    Utility.rotateImage(this.srcImagesPaso2.srcImgObsInstalacion, this.canvasObsInst.nativeElement);
    Utility.rotateImage(this.srcImagesPaso2.srcImgObsSufragio, this.canvasObsSuf.nativeElement);
  }  

  private setSrcImages(blobs: Blob[], data: DataPaso2) {
    this.srcImagesPaso2 = {
      srcImgFirmaPresidenteEsc: Utility.getSrcImage(blobs[0]),
      srcImgFirmaSecretarioEsc: Utility.getSrcImage(blobs[1]),
      srcImgFirmaTercerMiembroEsc: Utility.getSrcImage(blobs[2]),

      srcImgFirmaPresidenteIns: Utility.getSrcImage(blobs[3]),
      srcImgFirmaSecretarioIns: Utility.getSrcImage(blobs[4]),
      srcImgFirmaTercerMiembroIns: Utility.getSrcImage(blobs[5]),
      
      srcImgFirmaPresidenteSuf: Utility.getSrcImage(blobs[6]),
      srcImgFirmaSecretarioSuf: Utility.getSrcImage(blobs[7]),
      srcImgFirmaTercerMiembroSuf: Utility.getSrcImage(blobs[8]),
      
      srcImgObsEscrutinio: Utility.getSrcImage(blobs[9]),
      srcImgObsInstalacion: Utility.getSrcImage(blobs[10]),
      srcImgObsSufragio: Utility.getSrcImage(blobs[11]),
      
      actaConFirma: data.actaConFirma
    }
    this.messageControlCalidadService.srcImagenesPaso2.next(this.srcImagesPaso2);
  }

  private errorLoadImages(): void {
    this.utilityService.mensajePopup(this.tituloMenu, 
              'No se pudo obtener todas las imágenes del paso 2.', 
              IconPopType.ERROR);
  }

  @HostListener('scroll', ['$event'])
    onScroll(event: any) {
      if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 1) {
        this.messageControlCalidadService.revisoPaso2.next(true);
      }
    }

}

