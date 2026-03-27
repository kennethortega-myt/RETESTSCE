import {AfterViewInit, ChangeDetectorRef, Component, effect, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {
  FocusElementVeri,
  MessageVerificacionActasService
} from "../../../../message/message-verificacion-actas.service";
import {take} from "rxjs";
import {VerificationDatetimeSectionResponseBean} from "../../../../model/verificationDatetimeSectionResponseBean";
import { Constantes } from 'src/app/helper/constantes';

@Component({
  selector: 'app-paso3actas',
  templateUrl: './paso3actas.component.html',
  styleUrls: ['./paso3actas.component.scss']
})
export class Paso3actasComponent implements OnInit, OnDestroy, AfterViewInit{
  @ViewChild('imageCanvas1') imageCanvas1: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageCanvas11') imageCanvas11: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageCanvas2') imageCanvas2: ElementRef<HTMLCanvasElement>;
  @ViewChild('textCantidadCiudadanosVotaron') textCantidadCiudadanosVotaron: ElementRef<HTMLInputElement>;
  @ViewChild('textHoraInicio') textHoraInicio: ElementRef<HTMLInputElement>;
  @ViewChild('fechaInstalacion') fechaInstalacion: ElementRef<HTMLInputElement>;
  @ViewChild('fechaEscrutinio') fechaEscrutinio: ElementRef<HTMLInputElement>;
  @ViewChild('texthoraFinalizacion') texthoraFinalizacion: ElementRef<HTMLInputElement>;

  public formGroupSeccionHora: FormGroup;
  public seccionDate: VerificationDatetimeSectionResponseBean;

  public imgCantidadCiudadanosTexto : string;
  public imgCantidadCiudadanosNumero : string;
  public imgCantidadCiudadanosNumeroEscrutinio : string;
  public imgHoraInicio: string;
  public imgHoraFin: string;
  public tituloAcordeon:string= "Total de ciudadanos que votaron (Acta de Escrutinio)";
  public tituloAcordeonTemp:string;
  public isHoraEscrutinioN: boolean = false;
  private isInitializing: boolean = false;

  public fechaProcesoDate: Date | null = null;
  public minFechaInstalacion: Date | null = null;
  public maxFechaInstalacion: Date | null = null;
  public minFechaEscrutinio: Date | null = null;
  public maxFechaEscrutinio: Date | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly messageVerificacionActasService:MessageVerificacionActasService,
    private readonly cdr: ChangeDetectorRef
  ) {

    this.seccionDate = new VerificationDatetimeSectionResponseBean();
    this.imgCantidadCiudadanosTexto = "";
    this.imgCantidadCiudadanosNumero = "";
    this.imgCantidadCiudadanosNumeroEscrutinio = "";
    this.imgHoraInicio = "";
    this.imgHoraFin = "";
    this.tituloAcordeonTemp = this.tituloAcordeon;

    this.formGroupSeccionHora = this.formBuilder.group({
      cantidadCiudadanosNumeroFormControl:[''],
      fechaInstalacion:[{ value: null, disabled: true }],
      horaInicioFormControl:[''],
      fechaEscrutinio:[null],
      horaFinFormControl:[''],
    });

    effect(() => {
      const elementToFocus = this.messageVerificacionActasService.elementToFocus();

      if (!this.textCantidadCiudadanosVotaron || !this.fechaInstalacion || !this.textHoraInicio ||
         !this.fechaEscrutinio || !this.texthoraFinalizacion) {
        return; // Los elementos todavía no están disponibles
      }

      switch (elementToFocus) {
        case FocusElementVeri.CANTIDAD_CIUDADANOS:
          setTimeout(() => this.textCantidadCiudadanosVotaron.nativeElement.focus());
          break;
        case FocusElementVeri.FECHA_INSTALACION:
          setTimeout(() => this.fechaInstalacion.nativeElement.focus());
          break;
        case FocusElementVeri.HORA_INSTALACION:
          setTimeout(() => this.textHoraInicio.nativeElement.focus());
          break;
        case FocusElementVeri.FECHA_ESCRUTINIO:
          setTimeout(() => this.fechaEscrutinio.nativeElement.focus());
          break;
        case FocusElementVeri.HORA_ESCRUTINIO:
          setTimeout(() => this.texthoraFinalizacion.nativeElement.focus());
          break;
      }

    });

    this.formGroupSeccionHora.get('horaFinFormControl')?.valueChanges
      .subscribe(valor => this.onHoraEscrutinioChange(valor));
  }

  ngOnInit() {
    this.messageVerificacionActasService.getFechaProceso()
      .pipe(take(1))
      .subscribe((fecha: Date) => {
        if (fecha) {
          const year = fecha.getFullYear();
          const month = fecha.getMonth();
          const day = fecha.getDate();
          this.fechaProcesoDate = new Date(year, month, day);
          this.minFechaInstalacion = new Date(year, month, day - 1);
          this.maxFechaInstalacion = new Date(year, month, day);
          this.minFechaEscrutinio  = new Date(year, month, day);
          this.maxFechaEscrutinio  = new Date(year, month, day + 1);
        }
      });
    this.messageVerificacionActasService.getPaso3DataVerificacinBean().pipe(take(1))
      .subscribe(value => this.setDatosIniciales(value));
  }

  setDatosIniciales(data: VerificationDatetimeSectionResponseBean){
    this.isInitializing = true;
    this.seccionDate = data;

    this.formGroupSeccionHora.get("cantidadCiudadanosNumeroFormControl")?.setValue(this.seccionDate.total?.numberUserValue ?? "");

    this.formGroupSeccionHora.get('fechaInstalacion')?.setValue(this.fechaProcesoDate);

    const startValue = this.seccionDate.start?.userValue;
    if (startValue) {
      const [, horaStr] = startValue.split(' ');
      this.formGroupSeccionHora.get('horaInicioFormControl')?.setValue(horaStr ?? '');
    } else {
      this.formGroupSeccionHora.get('horaInicioFormControl')?.setValue('');
    }


    const endValue = this.seccionDate.end?.userValue;
    if (endValue === Constantes.CO_VALOR_N) {
      this.isHoraEscrutinioN = true;
      this.formGroupSeccionHora.get('fechaEscrutinio')?.disable();
      this.formGroupSeccionHora.get('horaFinFormControl')?.setValue(
        Constantes.CO_VALOR_N);
    } else if (endValue) {

      const [fechaEnd, horaEnd] = endValue.split(' ');
      this.isHoraEscrutinioN = false;

      const [day, month, year] = fechaEnd.split('-').map(Number);
        this.formGroupSeccionHora.get('fechaEscrutinio')?.setValue(
          new Date(year, month - 1, day)
        );

      this.formGroupSeccionHora.get('horaFinFormControl')?.setValue(
        horaEnd ?? ''
      );
    } else {
      this.isHoraEscrutinioN = false;
      this.formGroupSeccionHora.get('fechaEscrutinio')?.setValue(this.fechaProcesoDate);
      this.formGroupSeccionHora.get('horaFinFormControl')?.setValue('');
    }

    this.imgCantidadCiudadanosTexto = this.seccionDate.total?.filePngTextoUrl ?? '';
    this.imgCantidadCiudadanosNumero = this.seccionDate.total?.filePngNumberUrl ?? '';
    this.imgCantidadCiudadanosNumeroEscrutinio = this.seccionDate.total?.filePngNumberEscrutinioUrl ?? '';
    this.imgHoraFin = this.seccionDate.end?.filePngUrl ?? '';
    this.imgHoraInicio = this.seccionDate.start?.filePngUrl ?? '';

    this.isInitializing = false;

  }

  onHoraEscrutinioChange(valor: string): void {
    if (this.isInitializing) return;

    if (valor === Constantes.CO_VALOR_N) {
      this.isHoraEscrutinioN = true;
      this.formGroupSeccionHora.get('fechaEscrutinio')?.disable();
    } else {
      this.isHoraEscrutinioN = false;
      this.formGroupSeccionHora.get('fechaEscrutinio')?.enable();
    }
    this.cdr.detectChanges();
    this.changeHoraFin();
  }

  ngAfterViewInit() {
    this.rotateImage(this.imgCantidadCiudadanosTexto, this.imageCanvas1.nativeElement);
    this.rotateImage(this.imgCantidadCiudadanosNumero, this.imageCanvas11.nativeElement);
    this.rotateImage(this.imgHoraInicio, this.imageCanvas2.nativeElement);

  }



  rotateImage(imageSrc: string, canvas: HTMLCanvasElement) {
    if (!imageSrc || !canvas) return;
    const context = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      canvas.width = img.height;
      canvas.height = img.width;
      context.rotate(Math.PI / 2);
      context.drawImage(img, 0, -img.height);
    };
    img.src = imageSrc;
  }

  onFocusChange(element: FocusElementVeri) {
    this.messageVerificacionActasService.setFocus(element);
  }

  changeCantidadCiudadanos(){
    this.seccionDate.total.numberUserValue = this.formGroupSeccionHora.get("cantidadCiudadanosNumeroFormControl").value;
    this.messageVerificacionActasService.setPaso3DataVerificacinBean(this.seccionDate);
  }

  private formatDateToDDMMYYYY(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  changeHoraInicio(){
    const hora: string = this.formGroupSeccionHora.get('horaInicioFormControl')?.value;
    const fecha: Date = this.formGroupSeccionHora.get('fechaInstalacion')?.value;

    let fechaStr = this.formatDateToDDMMYYYY(fecha);

    this.seccionDate.start.userValue = `${fechaStr} ${hora}`;
    this.messageVerificacionActasService.setPaso3DataVerificacinBean(this.seccionDate);
  }

  changeHoraFin(){
    const hora: string = this.formGroupSeccionHora.get('horaFinFormControl')?.value || '';

    if (hora === Constantes.CO_VALOR_N) {
      this.seccionDate.end.userValue = Constantes.CO_VALOR_N;
    } else {
      const fecha: Date = this.formGroupSeccionHora.get('fechaEscrutinio')?.value;
      if (fecha) {
        const fechaStr = this.formatDateToDDMMYYYY(fecha);
        this.seccionDate.end.userValue = `${fechaStr} ${hora}`.trim();
      } else {
        this.seccionDate.end.userValue = '';
      }
    }

    this.messageVerificacionActasService.setPaso3DataVerificacinBean(this.seccionDate);
  }

  handleCiudadanosKeydown(event: Event){
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.messageVerificacionActasService.setFocus(FocusElementVeri.HORA_INSTALACION);
  }

  handleHoraInicioKeydown(event: Event){
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.messageVerificacionActasService.setFocus(FocusElementVeri.FECHA_ESCRUTINIO);
  }

  handleFechaEscrutinioKeydown(event: Event){
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.messageVerificacionActasService.setFocus(FocusElementVeri.HORA_ESCRUTINIO);
  }

  handleHoraFinalizacionKeydownEnter(event: Event){
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.messageVerificacionActasService.setFocus(FocusElementVeri.CONTINUAR);
  }

  handleHoraFinalizacionKeydownTab(event: Event){
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.messageVerificacionActasService.setFocus(FocusElementVeri.ANTERIOR);
  }



  ngOnDestroy() {
    this.messageVerificacionActasService.setPaso3DataVerificacinBean(new VerificationDatetimeSectionResponseBean);
  }

  protected readonly FocusElementVeri = FocusElementVeri;

  limpiarTitulo(number: number) {
    this.tituloAcordeonTemp = "";
  }

  restaurarTitulo(number: number) {
    this.tituloAcordeonTemp = this.tituloAcordeon;
  }
}
