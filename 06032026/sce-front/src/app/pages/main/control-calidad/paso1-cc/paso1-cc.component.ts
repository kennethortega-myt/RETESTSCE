import { AfterViewInit, Component, DestroyRef, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActaPendienteControlCalidad } from 'src/app/model/control-calidad/ActaPendienteControlCalidad';
import { ResolucionActa } from 'src/app/model/control-calidad/ResolucionActa';
import { ControlCalidadService } from 'src/app/service/control-calidad.service';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VentanaEmergenteService } from 'src/app/service/ventana-emergente.service';
import { VerificacionActaService } from 'src/app/service/verificacion-acta.service';
import { Utility } from 'src/app/helper/utility';
import { ImagenesPaso1, SrcImagenesPaso1 } from 'src/app/model/control-calidad/ImagenesPaso1';
import { forkJoin } from 'rxjs';
import { MessageControlCalidadService } from 'src/app/message/message-control-calidad.service';

@Component({
  selector: 'app-paso1-cc',
  templateUrl: './paso1-cc.component.html',
  styleUrl: './paso1-cc.component.scss'
})
export class Paso1CcComponent implements AfterViewInit {  

  @ViewChild('canvasCvasLetrasSufragio') canvasCvasLetrasSufragio: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasCvasNumSufragio') canvasCvasNumSufragio: ElementRef<HTMLCanvasElement>;
  @Input() acta: ActaPendienteControlCalidad;

  
  totalCiudadanosVotaron: number;
  listaResoluciones: ResolucionActa[] = [];
  readonly tituloMenu = 'Control de Calidad';
  srcImagenesPaso1: SrcImagenesPaso1;  

  readonly dialog = inject(MatDialog);  
  destroyRef: DestroyRef = inject(DestroyRef);

  constructor(    
    private readonly controlCalidadService: ControlCalidadService,
    private readonly utilityService: UtilityService,
    protected readonly ventanaEmergenteService: VentanaEmergenteService,
    private readonly verificacionActaService: VerificacionActaService,
    private readonly messageControlCalidadService: MessageControlCalidadService,
  ){}

  ngAfterViewInit(): void { 
    this.loadDataInput();
    this.recoverImages();
  }  

  private loadDataInput() {
    if(this.acta) {
      this.totalCiudadanosVotaron = this.acta.cvas;
    }
  }

  private recoverImages() {
    this.messageControlCalidadService.srcImagenesPaso1
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response) => {
            if(response) {
              if(!this.srcImagenesPaso1) {
                this.srcImagenesPaso1 = response;
                this.rotateImages(this.srcImagenesPaso1);
              }              
            } else {
              this.loadImages();
            }
          }
        }
      ); 
  }

  private loadImages() {
    sessionStorage.setItem('loading', 'true');
    this.controlCalidadService.obtenerIdsImagenesPaso1(this.acta.idActa)
    .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (imagenes) => {
            sessionStorage.setItem('loading', 'false');            
            if(!Utility.objectHasNullAttribute(imagenes)){
              this.loadImagesCanvas(imagenes);
            } else {
              this.messageControlCalidadService.hayErrorImagenes.next(true);
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

  private loadImagesCanvas( imagePaso1: ImagenesPaso1) {
    sessionStorage.setItem('loading', 'true');
    forkJoin([this.verificacionActaService.getFileV2(imagePaso1.idArchivoCvasLetrasSufragio),
            this.verificacionActaService.getFileV2(imagePaso1.idArchivoCvasNumSufragio),            
            this.verificacionActaService.getFileV2(imagePaso1.idArchivoCvasNumEscrutinio),
          ])
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(
            {
              next: (blobList) => {
                this.messageControlCalidadService.hayErrorImagenes.next(false);
                sessionStorage.setItem('loading', 'false');                
                this.setSrcImagenes(blobList);
                this.rotateImages(this.srcImagenesPaso1);
              },
              error: () => {                                
                sessionStorage.setItem('loading', 'false');
                this.messageControlCalidadService.hayErrorImagenes.next(true);
                this.errorLoadImages();                
              }
            }
          );
  }

  private setSrcImagenes(blobList: Blob[]) {
    this.srcImagenesPaso1 = {
      srcCvasLetrasSufragio: Utility.getSrcImage(blobList[0]),
      srcCvasNumSufragio: Utility.getSrcImage(blobList[1]),      
      srcCvasNumEscrutinio: Utility.getSrcImage(blobList[2])
    }

    this.messageControlCalidadService.srcImagenesPaso1.next(this.srcImagenesPaso1);
  }

  private rotateImages(srcImagenesPaso1: SrcImagenesPaso1) {
    Utility.rotateImage(srcImagenesPaso1.srcCvasLetrasSufragio, this.canvasCvasLetrasSufragio.nativeElement);                
    Utility.rotateImage(srcImagenesPaso1.srcCvasNumSufragio, this.canvasCvasNumSufragio.nativeElement);    
  }

  private errorLoadImages(): void {
    this.utilityService.mensajePopup(this.tituloMenu, 
              'No se pudo obtener todas las imágenes del acta.', 
              IconPopType.ERROR);
  }

}
