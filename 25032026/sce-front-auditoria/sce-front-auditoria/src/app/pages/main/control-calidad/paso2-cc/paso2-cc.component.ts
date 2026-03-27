import { AfterViewInit, Component, DestroyRef, ElementRef, HostListener, inject, Input, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { Utility } from 'src/app/helper/utility';
import { MessageControlCalidadService } from 'src/app/message/message-control-calidad.service';
import { ActaPendienteControlCalidad } from 'src/app/model/control-calidad/ActaPendienteControlCalidad';
import { DataPaso2, SrcImagenesPaso2 } from 'src/app/model/control-calidad/DataPaso2';
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
            if(data){
              this.isActaConFirma = data.actaConFirma;
              this.obtenerImages(data);              
            } else {
              this.setSrcImages(null, null);
              this.rotateImages(); 
            }           
          }, 
          error: () => {    
            this.setSrcImages(null, null);  
            this.rotateImages();      
            sessionStorage.setItem('loading', 'false');            
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
            this.setSrcImages(blobs, data);
            this.rotateImages();
          },
          error: () => {
            this.setSrcImages(null, null);  
            this.rotateImages();  
            sessionStorage.setItem('loading', 'false');
          }
        }
      );
  }

  private getPromisesBlobImages(data: DataPaso2): Promise<Blob>[] {
    return [this.verificacionActaService.getFileV2(data.idImgFirmaPresidenteEsc).catch(() => null),
            this.verificacionActaService.getFileV2(data.idImgFirmaSecretarioEsc).catch(() => null),
            this.verificacionActaService.getFileV2(data.idImgFirmaTercerMiembroEsc).catch(() => null),
            this.verificacionActaService.getFileV2(data.idImgFirmaPresidenteIns).catch(() => null),
            this.verificacionActaService.getFileV2(data.idImgFirmaSecretarioIns).catch(() => null),
            this.verificacionActaService.getFileV2(data.idImgFirmaTercerMiembroIns).catch(() => null),
            this.verificacionActaService.getFileV2(data.idImgFirmaPresidenteSuf).catch(() => null),
            this.verificacionActaService.getFileV2(data.idImgFirmaSecretarioSuf).catch(() => null),
            this.verificacionActaService.getFileV2(data.idImgFirmaTercerMiembroSuf).catch(() => null),
            this.verificacionActaService.getFileV2(data.idImgObsEscrutinio).catch(() => null),
            this.verificacionActaService.getFileV2(data.idImgObsInstalacion).catch(() => null),
            this.verificacionActaService.getFileV2(data.idImgObsSufragio).catch(() => null),
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
      srcImgFirmaPresidenteEsc: blobs?.[0] ? Utility.getSrcImage(blobs[0]) : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso2-firma.png',
      srcImgFirmaSecretarioEsc: blobs?.[1] ? Utility.getSrcImage(blobs[1]) : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso2-firma.png',
      srcImgFirmaTercerMiembroEsc: blobs?.[2] ? Utility.getSrcImage(blobs[2]) : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso2-firma.png',

      srcImgFirmaPresidenteIns: blobs?.[3] ? Utility.getSrcImage(blobs[3]) : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso2-firma-giro.png',
      srcImgFirmaSecretarioIns: blobs?.[4] ? Utility.getSrcImage(blobs[4]) : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso2-firma-giro.png',
      srcImgFirmaTercerMiembroIns: blobs?.[5] ? Utility.getSrcImage(blobs[5]) : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso2-firma-giro.png',

      srcImgFirmaPresidenteSuf: blobs?.[6] ? Utility.getSrcImage(blobs[6]) : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso2-firma-giro.png',
      srcImgFirmaSecretarioSuf: blobs?.[7] ? Utility.getSrcImage(blobs[7]) : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso2-firma-giro.png',
      srcImgFirmaTercerMiembroSuf: blobs?.[8] ? Utility.getSrcImage(blobs[8]) : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso2-firma-giro.png',

      srcImgObsEscrutinio: blobs?.[9] ? Utility.getSrcImage(blobs[9]) : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso2-observaciones.png',
      srcImgObsInstalacion: blobs?.[10] ? Utility.getSrcImage(blobs[10]) : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso2-observaciones-giro.png',
      srcImgObsSufragio: blobs?.[11] ? Utility.getSrcImage(blobs[11]) : Constantes.SRC_CONTROL_CALIDAD_IMAGES + 'paso2-observaciones-giro.png',

      actaConFirma: data?.actaConFirma
    }

    this.messageControlCalidadService.srcImagenesPaso2.next(this.srcImagesPaso2);
  }  

  @HostListener('scroll', ['$event'])
    onScroll(event: any) {
      if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 1) {
        this.messageControlCalidadService.revisoPaso2.next(true);
      }
    }

}

