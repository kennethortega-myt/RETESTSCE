import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {UtilityService} from '../../../../helper/utilityService';
import {MessageActasCorregirService} from '../../../../message/message-actas-corregir.service';
import {Component, DestroyRef, ElementRef, inject, OnInit, QueryList, Renderer2, ViewChildren} from '@angular/core';
import {MatCheckbox} from '@angular/material/checkbox';
import {ActaPorCorregirBean} from '../../../../model/actaPorCorregirBean';
import {take} from 'rxjs';
import {IFormGroupStrategy} from '../../../../interface/formGroupStrategy.interface';
import {IAgrupacionPolitica} from '../../../../interface/agrupacionPolitica.interface';
import {IVotoData} from '../../../../interface/votoData.interface';
import {IScrollSyncronizer} from '../../../../interface/scrollSyncronizer.interface';
import {IObservacionHandler} from '../../../../interface/observableHandler.interface';

@Component({
  template: '' // Componente abstracto
})
export abstract class ActasCorregirBaseComponent
  implements OnInit, IScrollSyncronizer, IObservacionHandler{

  destroyRef:DestroyRef = inject(DestroyRef);

  // ===== COMPONENTES HIJOS =====

  @ViewChildren('votoInput') votoInputs: QueryList<ElementRef>;
  @ViewChildren('observaciones') obsControl!: QueryList<MatCheckbox>;

  focusInputId: string | null = null;
  public formGroupInfoActa: FormGroup;
  actaPorCorregirBean: ActaPorCorregirBean;
  public formGroupSeccionVoto: FormGroup;
  public formGroupSeccionVotoPref: FormGroup;
  public formGroupSeccionCvas: FormGroup;
  public tituloComponente = "Actas por corregir";

  times: number[] = [];
  public cantVotosPrefe: number;

  isSyncingLeft: boolean = false;
  isSyncingRight: boolean = false;

  protected formStrategy: IFormGroupStrategy;

  protected constructor(
    protected readonly formBuilder: FormBuilder,
    public dialog: MatDialog,
    protected readonly messageActasCorregirService: MessageActasCorregirService,
    protected readonly renderer: Renderer2,
    protected readonly utilityService: UtilityService,
    protected readonly el: ElementRef

  ) {

    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.actaPorCorregirBean = new ActaPorCorregirBean();
    this.cantVotosPrefe = 0;

    this.formGroupInfoActa = this.formBuilder.group({
      numMesaFormControl: [{value:'', disabled: true}],
      ubigeoFormControl: [{value:'', disabled: true}],
      electoresHabilesFormControl: [{value:'', disabled: true}]
    });

    this.formGroupSeccionVoto = this.formBuilder.group({
      params: this.formBuilder.group({}),
    });

    this.formGroupSeccionVotoPref = this.formBuilder.group({
      params: this.formBuilder.group({}),
    });

    this.formGroupSeccionCvas = this.formBuilder.group({
      ciudadanosControl: [{value:'', disabled: false}],
    });
  }

  ngOnInit(): void {
    this.messageActasCorregirService.getDataActaPorCorregirBean()
      .pipe(take(1))
      .subscribe(value => this.setDatosIniciales(value));
  }

  setDatosIniciales(actaPorCorregirBean: ActaPorCorregirBean): void {
    this.actaPorCorregirBean = actaPorCorregirBean;
    this.validar3DigitacionYSetear();
    this.inicializarConfiguracion();
    this.configurarFormControls();
    this.establecerInformacionActa();
  }

  protected abstract inicializarConfiguracion(): void;
  protected abstract createFormStrategy(): IFormGroupStrategy;

  private configurarFormControls(): void {
    this.formStrategy = this.createFormStrategy();
    this.formStrategy.configurarFormControls(this.actaPorCorregirBean.agrupacionesPoliticas, this.cantVotosPrefe);
  }

  private establecerInformacionActa(): void {
    const acta = this.actaPorCorregirBean.acta;

    this.formGroupInfoActa.get('numMesaFormControl')?.setValue(
      `${acta.mesa} - ${acta.copia}${acta.digitoChequeo}`
    );
    this.formGroupInfoActa.get('ubigeoFormControl')?.setValue(acta.ubigeo);
    this.formGroupInfoActa.get('electoresHabilesFormControl')?.setValue(acta.electoresHabiles);
  }

  validar3DigitacionYSetear(): void {
    this.procesarAgrupacionesPoliticas();
    this.procesarCvas();
    this.procesarObservaciones();
    this.sincronizarCvasConObservaciones();
  }

  private procesarAgrupacionesPoliticas(): void {
    for(const agrPol of this.actaPorCorregirBean.agrupacionesPoliticas){
      this.establecerTerceraDigitacion(agrPol);
      this.procesarVotosEspecificos(agrPol);
    }
  }

  protected abstract procesarVotosEspecificos(agrPol: IAgrupacionPolitica): void;

  protected establecerTerceraDigitacion(item: IVotoData): void {
    if (this.tieneDigitacionesValidas(item)) {
      item.terceraDigitacion = item.primeraDigitacion === item.segundaDigitacion
        ? item.primeraDigitacion
        : "";
    }
  }

  // Método helper común
  protected establecerTerceraDigitacionSimple(item: IVotoData): void {
    if (item.primeraDigitacion !== "null" && item.segundaDigitacion !== "null") {
      item.terceraDigitacion = item.primeraDigitacion === item.segundaDigitacion
        ? item.primeraDigitacion
        : "";
    }
  }

  private procesarCvas(): void {
    const cvas = this.actaPorCorregirBean.cvas;

    if (this.tieneDigitacionesValidas(cvas)) {
      if (cvas.primeraDigitacion === cvas.segundaDigitacion) {
        cvas.terceraDigitacion = cvas.primeraDigitacion;
        this.formGroupSeccionCvas.get('ciudadanosControl')?.setValue(cvas.terceraDigitacion);
      } else {
        cvas.terceraDigitacion = "";
      }
    }
  }

  private procesarObservaciones(): void {
    for(const obs of this. actaPorCorregirBean.observaciones) {
      if (this.tieneDigitacionesValidas(obs)) {
        obs.terceraDigitacion = obs.primeraDigitacion === obs.segundaDigitacion
          ? obs.primeraDigitacion
          : "NO";
      }
    }
  }

  private sincronizarCvasConObservaciones(): void {
    const cvasTerceraDigitacion = this.actaPorCorregirBean.cvas.terceraDigitacion;
    const esCvasIncompleto = cvasTerceraDigitacion === "" || cvasTerceraDigitacion === "N";
    this.actaPorCorregirBean.observaciones[0].terceraDigitacion = esCvasIncompleto ? "SI" : "NO";
  }

  private tieneDigitacionesValidas(item: IVotoData): boolean {
    return item.primeraDigitacion !== "null" && item.segundaDigitacion !== "null";
  }

  // Implementación de IScrollSyncronizer
  onScroll(container: string): void {
    const leftContainer = document.getElementById('left-container');
    const rightContainer = document.getElementById('right-container');

    if (container === 'left' && !this.isSyncingRight) {
      this.isSyncingLeft = true;
      if (rightContainer) rightContainer.scrollTop = leftContainer?.scrollTop || 0;
    } else if (container === 'right' && !this.isSyncingLeft) {
      this.isSyncingRight = true;
      if (leftContainer) leftContainer.scrollTop = rightContainer?.scrollTop || 0;
    }

    this.isSyncingLeft = false;
    this.isSyncingRight = false;
  }

  verImagenActa() {
    this.utilityService.abrirModalActaPorId(
      this.actaPorCorregirBean.acta.actaId,
      this.tituloComponente,
      this.destroyRef
    );
  }

  // Implementación de IObservacionHandler
  changeObservacion(i: number, event: any): void {
    const isChecked = event.checked;

    switch (i) {
      case 0:
        this.manejarObservacionIncompleta(i, isChecked);
        break;
      case 1:
        this.manejarObservacionSinFirma(i, isChecked);
        break;
      case 2:
        if (isChecked) {
          this.activarObservacionSinDatos(event);
        } else {
          this.desactivarObservacionSinDatos(i);
        }
        break;
      case 3:
        this.manejarObservacionSolicitudNulidad(i, isChecked);
        break;
    }

    this.messageActasCorregirService.setDataActaPorCorregirBean(this.actaPorCorregirBean);
  }

  private manejarObservacionIncompleta(i: number, isChecked: boolean): void {
    const checkboxIncompleta = this.obsControl.toArray()[i];
    this.actaPorCorregirBean.observaciones[i].terceraDigitacion = isChecked ? "SI" : "NO";
    this.formGroupSeccionCvas.get('ciudadanosControl')?.setValue("N");
    this.actaPorCorregirBean.cvas.terceraDigitacion = this.formGroupSeccionCvas.get('ciudadanosControl')?.value;
    checkboxIncompleta.disabled = true;
  }

  private manejarObservacionSinFirma(i: number, isChecked: boolean): void {
    this.actaPorCorregirBean.observaciones[i].terceraDigitacion = isChecked ? "SI" : "NO";
  }

  private activarObservacionSinDatos(event: any): void {
    this.utilityService.popupConfirmacionConAcciones(
      event,
      'Se pasarán los votos a nulos. ¿Está seguro de continuar?',
      () => this.confirmarSinDatos(),
      () => this.cancelarSinDatos(event)
    );
  }

  private desactivarObservacionSinDatos(i: number): void {
    this.formStrategy.pasarVotosNulos(false);
    this.actaPorCorregirBean.observaciones[i].terceraDigitacion = "NO";
  }

  private manejarObservacionSolicitudNulidad(i: number, isChecked: boolean): void {
    this.actaPorCorregirBean.observaciones[i].terceraDigitacion = isChecked ? "SI" : "NO";
  }

  confirmarSinDatos(): void {
    this.formStrategy.pasarVotosNulos(true);
    this.actaPorCorregirBean.observaciones[2].terceraDigitacion = "SI";
  }

  cancelarSinDatos(event: any): void {
    event.source.checked = false;
  }

  changeCvas(): void {
    const checkboxIncompleta = this.obsControl.toArray()[0];
    this.actaPorCorregirBean.cvas.terceraDigitacion = this.formGroupSeccionCvas.get('ciudadanosControl')?.value;

    if (this.formGroupSeccionCvas.get('ciudadanosControl')?.value === '' ||
      this.formGroupSeccionCvas.get('ciudadanosControl')?.value === 'N') {
      this.activateCheckbox(0);
      checkboxIncompleta.disabled = true;
    } else {
      this.desactivarCheckbox(0);
      checkboxIncompleta.disabled = false;
    }

    this.messageActasCorregirService.setDataActaPorCorregirBean(this.actaPorCorregirBean);
  }

  activateCheckbox(index: number): void {
    const checkbox = this.obsControl.toArray()[index];
    if (checkbox) {
      checkbox.checked = true;
      this.actaPorCorregirBean.observaciones[index].terceraDigitacion = 'SI';
    }
  }

  desactivarCheckbox(index: number): void {
    const checkbox = this.obsControl.toArray()[index];
    if (checkbox) {
      checkbox.checked = false;
      this.actaPorCorregirBean.observaciones[index].terceraDigitacion = 'NO';
    }
  }

  setFocusOnInput(): void {
    const inputElement = this.el.nativeElement.querySelector(`#${this.focusInputId}`);
    if (inputElement) {
      this.renderer.selectRootElement(inputElement).focus();
    }
    this.focusInputId = null;
  }


}
