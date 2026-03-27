
import {Component, Inject, OnInit, ViewChild, AfterViewInit, ElementRef, inject, DestroyRef} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopObservacionesVerificacionDataInterface } from "../../../../interface/popObservacionesVerificacionData.interface";
import { UtilityService } from 'src/app/helper/utilityService';
import {AutorizacionService} from '../../../../service/autorizacion.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {GenericResponseBean} from '../../../../model/genericResponseBean';
import {AutorizacionCCResponseBean} from '../../../../model/autorizacionCCResponseBean';
import {IconPopType} from '../../../../model/enum/iconPopType';
import {AutorizacionCCRequestBean} from '../../../../model/autorizacionCCRequestBean';

@Component({
  selector: 'app-modalobservacion',
  templateUrl: './modalobservacion.component.html',
  styleUrls: ['./modalobservacion.component.scss']
})
export class ModalobservacionComponent implements OnInit, AfterViewInit {

  protected utilityService = inject(UtilityService);

  destroyRef:DestroyRef = inject(DestroyRef);

  @ViewChild('botonAceptar') botonAceptar!: ElementRef;
  @ViewChild('imageCanvas1') imageCanvas1: ElementRef<HTMLCanvasElement>;

  @ViewChild('imageCanvas2') imageCanvas2: ElementRef<HTMLCanvasElement>;
  public imgObservacionesEscrutinio;
  public imgObservacionesInstalacion;
  public imgObservacionesSufragio;
  public solicitudNulidad: boolean;
  public autorizado: boolean

  public tituloAlert: string = "Digitación de actas";
  public solicitudAutorizacion: AutorizacionCCRequestBean;

  constructor(
    public dialogRef: MatDialogRef<ModalobservacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopObservacionesVerificacionDataInterface,
    private readonly autorizacionService: AutorizacionService
  ) {
    this.imgObservacionesEscrutinio="";
    this.imgObservacionesInstalacion="";
    this.imgObservacionesSufragio = "";
    this.solicitudNulidad = false;
    this.autorizado = false;
    this.solicitudAutorizacion = new AutorizacionCCRequestBean();
  }

  ngOnInit() {
    this.imgObservacionesEscrutinio = this.data.pngImageUrlObservacionEscrutinio? this.data.pngImageUrlObservacionEscrutinio : '';
    this.imgObservacionesInstalacion = this.data.pngImageUrlObservacionInstalacion ? this.data.pngImageUrlObservacionInstalacion : '';
    this.imgObservacionesSufragio = this.data.pngImageUrlObservacionSufragio ? this.data.pngImageUrlObservacionSufragio : '';
    this.solicitudNulidad = this.data.solicitudNulidad ? this.data.solicitudNulidad : false;
    this.autorizado = this.data.autorizado ? this.data.autorizado : false;
    this.solicitudAutorizacion = this.data.solicitudAutorizacion ? this.data.solicitudAutorizacion : null;
  }

  ngAfterViewInit() {
    this.rotateImage();
    if (this.botonAceptar){
      setTimeout(() => {
        this.botonAceptar.nativeElement.focus(); // Establece el foco después de la inicialización del componente
      }, 0);
    }
  }

  rotateImage() {
    const canvas: HTMLCanvasElement = this.imageCanvas1.nativeElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.height;
      canvas.height = img.width;
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, 0, -img.height);
    };
    img.src = this.imgObservacionesInstalacion;

    const canvas2: HTMLCanvasElement = this.imageCanvas2.nativeElement;
    const ctx2: CanvasRenderingContext2D = canvas2.getContext('2d');
    const img2 = new Image();
    img2.onload = () => {
      canvas2.width = img2.height;
      canvas2.height = img2.width;
      ctx2.rotate(Math.PI / 2);
      ctx2.drawImage(img2, 0, -img2.height);
    };
    img2.src = this.imgObservacionesSufragio;
  }

  onCloseClick(): void {
    this.dialogRef.close(this.solicitudNulidad);
  }

  changeSolicitudNulidad(event:any){
    const isChecked = event.checked;
    if(isChecked){
      const mensaje='¿Confirma que desea marcar esta opción como Solicitud de Nulidad?';
      this.utilityService.popupConfirmacionConAcciones(
        event,
        mensaje,
        ()=> this.confirmarSolicitudNulidad(),
        ()=> this.cancelarSolicitudNulidad(event)
      );

    }else{
      this.solicitudNulidad = false;
    }
  }

  confirmarSolicitudNulidad(){
    this.solicitudNulidad = true;
  }

  cancelarSolicitudNulidad(event: any){
    this.solicitudNulidad = false;
    event.source.checked = false;
  }

  confirmarSolicitarAutorizacionCC(){

    this.utilityService.popupConfirmacionConAccion(
      null,
      `¿Desea solicitar autorización para visualizar las organizaciones políticas?`,
      ()=> this.solicitarAutorizacionCc()
    );

  }

  solicitarAutorizacionCc(){
    this.utilityService.setLoading(true);
    this.autorizacionService.crearSolicitudAutorizacion(this.solicitudAutorizacion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.crearSolicitudAutorizacionCorrecto.bind(this),
        error: this.crearSolicitudAutorizacionIncorrecto.bind(this)
      });
  }

  crearSolicitudAutorizacionCorrecto(response:GenericResponseBean<boolean>){
    this.utilityService.setLoading(false);
    if(!response.success){
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      return;
    }

    if (!response.data){
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      return;
    }

    this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.CONFIRM);
    this.onCloseClick();
  }

  crearSolicitudAutorizacionIncorrecto(error: any){
    this.utilityService.setLoading(false);
    this.utilityService.mensajePopup(this.tituloAlert,"Error al solicitar autorización", IconPopType.ERROR);
  }
}
