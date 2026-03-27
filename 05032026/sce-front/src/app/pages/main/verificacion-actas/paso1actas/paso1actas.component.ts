import {
  AfterViewInit,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FocusElementVeri,
  MessageVerificacionActasService
} from "../../../../message/message-verificacion-actas.service";
import {VerificationSignSectionResponseBean} from "../../../../model/verificationSignSectionResponseBean";
import {filter, Observable, Subject, take} from "rxjs";
import {VerificacionActaService} from "../../../../service/verificacion-acta.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Constantes} from "../../../../helper/constantes";
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {UtilityService} from '../../../../helper/utilityService';
import {IconPopType} from '../../../../model/enum/iconPopType';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-paso1actas',
  templateUrl: './paso1actas.component.html',
  styleUrls: ['./paso1actas.component.scss']
})
export class Paso1actasComponent implements OnInit, OnDestroy, AfterViewInit{
  //sufragio
  @ViewChild('imageCanvassufragio1') imageCanvassufragio1: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageCanvassufragio2') imageCanvassufragio2: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageCanvassufragio3') imageCanvassufragio3: ElementRef<HTMLCanvasElement>;

  //instalacion
  @ViewChild('imageCanvasinstalacion1') imageCanvasinstalacion1: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageCanvasinstalacion2') imageCanvasinstalacion2: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageCanvasinstalacion3') imageCanvasinstalacion3: ElementRef<HTMLCanvasElement>;

  //escrutinio
  @ViewChild('imageCanvasescrutinio1') imageCanvasescrutinio1: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageCanvasescrutinio2') imageCanvasescrutinio2: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageCanvasescrutinio3') imageCanvasescrutinio3: ElementRef<HTMLCanvasElement>;

  @ViewChild('toggleFirma') toggleFirma!: MatSlideToggle;

  signSection$: Observable<VerificationSignSectionResponseBean>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  destroyRef:DestroyRef = inject(DestroyRef);
  signSection : VerificationSignSectionResponseBean;

  public formGroupAcciones: FormGroup;
  public isVisibleSeccionFirma: boolean;

  public imgFirmaCountPresidente : string;
  public imgFirmaCountSecretario : string;
  public imgFirmaCountThirdMember : string;
  public imgFirmaInstallPresidente : string;
  public imgFirmaInstallSecretario : string;
  public imgFirmaInstallThirdMember : string;
  public imgFirmaVotePresidente : string;
  public imgFirmaVoteSecretario : string;
  public imgFirmaVoteThirdMember : string;

  public flagObservaciones : boolean = false;
  private isViewInitialized = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly verificacionActaService: VerificacionActaService,
    private readonly utilityService:UtilityService,
    private readonly messageVerificacionActasService:MessageVerificacionActasService
  ) {
    this.signSection = new VerificationSignSectionResponseBean();
    this.isVisibleSeccionFirma = false;

    this.imgFirmaCountPresidente = '';
    this.imgFirmaCountSecretario = '';
    this.imgFirmaCountThirdMember = '';
    this.imgFirmaInstallPresidente = '';
    this.imgFirmaInstallSecretario = '';
    this.imgFirmaInstallThirdMember = '';
    this.imgFirmaVotePresidente = '';
    this.imgFirmaVoteSecretario = '';
    this.imgFirmaVoteThirdMember = '';

    this.formGroupAcciones = this.formBuilder.group({
      indCheckCumple: [false],
      txtBtnGuardar: [Constantes.CO_TXT_BTN_CONTINUAR_VERIFICACION]
    });

    effect(() => {
      const elementToFocus = this.messageVerificacionActasService.elementToFocus();
      this.flagObservaciones = this.messageVerificacionActasService.verObservaciones();
      if (elementToFocus === 'toggle' && this.toggleFirma) {
        setTimeout(() => this.toggleFirma.focus());
      }
    });

  }

  ngOnInit() {
    this.messageVerificacionActasService.getPaso1VerificacionBean()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(data => !!data?.systemStatus)
      )
      .subscribe(value => {
        this.setDatosIniciales(value)
        if (this.isViewInitialized) {
          this.dibujarImagenes();
        }
      });

    this.onCumpleChanged();

  }

  onCumpleChanged(){
    const control = this.formGroupAcciones.get('indCheckCumple');

    control.valueChanges.subscribe(value => {
      if (!value && !this.flagObservaciones) {
        this.utilityService.mensajePopup(
          "Digitación de actas",
          "Revise las observaciones antes de marcar el acta como sin firma.",
          IconPopType.ALERT
        );

        // Revertir el valor del control (sin emitir evento)
        control.setValue(true, { emitEvent: false }); // true es el valor anterior esperado
        return;
      }

      this.messageVerificacionActasService.setFocus(FocusElementVeri.TOGGLE);
      this.signSection.userStatus = value ? "true" : "false";
      this.signSection.status = value ? 1 : 0;
    });
  }

  setDatosIniciales(data: VerificationSignSectionResponseBean){

    this.signSection= data;
    let variable: boolean;
    if (this.signSection.userStatus){
      variable = this.signSection.userStatus =='true';
    }else{
      variable = this.signSection.systemStatus == 'true'
    }

    this.formGroupAcciones.get("indCheckCumple").setValue(variable);

    //escrutinio
    this.imgFirmaCountPresidente = this.signSection.countPresident ? this.signSection.countPresident.filePngUrl : '';
    this.imgFirmaCountSecretario = this.signSection.countSecretary ? this.signSection.countSecretary.filePngUrl : '';
    this.imgFirmaCountThirdMember = this.signSection.countThirdMember ? this.signSection.countThirdMember.filePngUrl : '';

    //instalación
    this.imgFirmaInstallPresidente = this.signSection.installPresident ? this.signSection.installPresident.filePngUrl : '';
    this.imgFirmaInstallSecretario = this.signSection.installSecretary ? this.signSection.installSecretary.filePngUrl : '';
    this.imgFirmaInstallThirdMember = this.signSection.installThirdMember ? this.signSection.installThirdMember.filePngUrl : '';

    //sufragio
    this.imgFirmaVotePresidente = this.signSection.votePresident ? this.signSection.votePresident.filePngUrl : '';
    this.imgFirmaVoteSecretario = this.signSection.voteSecretary ? this.signSection.voteSecretary.filePngUrl : '';
    this.imgFirmaVoteThirdMember = this.signSection.voteThirdMember ? this.signSection.voteThirdMember.filePngUrl : '';


    this.isVisibleSeccionFirma = true;


  }

  ngAfterViewInit() {
    this.isViewInitialized = true;
    this.dibujarImagenes();

    if (this.toggleFirma) {
      setTimeout(() => this.toggleFirma.focus(), 0);
    }

  }

  private dibujarImagenes(): void {
    this.drawImageOnCanvas(this.imgFirmaCountPresidente, this.imageCanvasescrutinio1?.nativeElement);
    this.drawImageOnCanvas(this.imgFirmaCountSecretario, this.imageCanvasescrutinio2?.nativeElement);
    this.drawImageOnCanvas(this.imgFirmaCountThirdMember, this.imageCanvasescrutinio3?.nativeElement);
    this.rotateImage(this.imgFirmaInstallPresidente, this.imageCanvasinstalacion1?.nativeElement);
    this.rotateImage(this.imgFirmaInstallSecretario, this.imageCanvasinstalacion2?.nativeElement);
    this.rotateImage(this.imgFirmaInstallThirdMember, this.imageCanvasinstalacion3?.nativeElement);
    this.rotateImage(this.imgFirmaVotePresidente, this.imageCanvassufragio1?.nativeElement);
    this.rotateImage(this.imgFirmaVoteSecretario, this.imageCanvassufragio2?.nativeElement);
    this.rotateImage(this.imgFirmaVoteThirdMember, this.imageCanvassufragio3?.nativeElement);
  }

  drawImageOnCanvas(imageSrc: string, canvas: HTMLCanvasElement): void {
    if (!imageSrc || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const img = new Image();
    img.onload = () => {
      // Establecer dimensiones del canvas según la imagen
      canvas.width = img.width;
      canvas.height = img.height;

      // Dibujar la imagen sin transformaciones
      context.drawImage(img, 0, 0);
    };

    img.onerror = () => {
      console.error('Error al cargar la imagen:', imageSrc);
    };

    img.src = imageSrc;
  }

  handleEnterKey(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.messageVerificacionActasService.setFocus(FocusElementVeri.OBSERVACIONES);
  }

  handleTabKey(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.messageVerificacionActasService.setFocus(FocusElementVeri.RECHAZAR);
  }

  rotateImage(imageSrc: string, canvas: HTMLCanvasElement) {
    if (!imageSrc || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.height;
      canvas.height = img.width;
      context.rotate(Math.PI / 2);
      context.drawImage(img, 0, -img.height);
    };

    img.onerror = () => {
      console.error('Error al cargar la imagen:', imageSrc);
    };

    img.src = imageSrc;
  }

  ngOnDestroy() {
    this.messageVerificacionActasService.setPaso1VerificacionBean(new VerificationSignSectionResponseBean);
  }

  protected readonly FocusElementVeri = FocusElementVeri;
}
