import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import { Constantes } from '../../../helper/constantes';
import {ProcesoElectoralResponseBean} from "../../../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../../../model/eleccionResponseBean";
import {FormBuilder, FormGroup} from "@angular/forms";
import {VerificacionActaService} from "../../../service/verificacion-acta.service";
import {VerificationActaResponseBean} from "../../../model/verificationActaResponseBean";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {jwtDecode} from "jwt-decode";
import {TokenActaVerificacionBean} from "../../../model/tokenActaVerificacionBean";
import {MatDialog} from '@angular/material/dialog';
import {switchMap, take, tap} from "rxjs";
import {ModalobservacionComponent} from '../verificacion-actas/modalobservacion/modalobservacion.component';
import {Router} from "@angular/router";
import {FocusElementVeri, MessageVerificacionActasService} from "../../../message/message-verificacion-actas.service";
import {PopMensajeData} from "../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../shared/pop-mensaje/pop-mensaje.component";
import {DialogoConfirmacionComponent} from "../dialogo-confirmacion/dialogo-confirmacion.component";
import {UtilityService} from "../../../helper/utilityService";
import {IconPopType} from "../../../model/enum/iconPopType";
import {MatCheckbox} from '@angular/material/checkbox';
import {GeneralService} from '../../../service/general-service.service';
import {Utility} from '../../../helper/utility';
import {AlineacionType} from '../../../model/enum/alineacionType';
import {AutorizacionCCRequestBean} from '../../../model/autorizacionCCRequestBean';

@Component({
  selector: 'app-verificacion-actas',
  templateUrl: './verificacion-actas.component.html'
})
export class VerificacionActasComponent implements OnInit, OnDestroy{

  @ViewChild('botonRechazar') botonRechazar: ElementRef;
  @ViewChild('botonObservaciones') botonObservaciones: ElementRef;
  @ViewChild('botonContinuar') botonContinuar!: ElementRef;
  @ViewChild('botonAnterior') botonAnterior!: ElementRef;
  @ViewChild('checkSolicitudNulidad') checkSolicitudNulidad!: MatCheckbox;
  @ViewChild('checkSinDatos') checkSinDatos!: MatCheckbox;
  @ViewChild('btnVerificar', { static: false }) btnVerificar: ElementRef<HTMLButtonElement>;

  destroyRef:DestroyRef = inject(DestroyRef);
  constantes = Constantes;
  tabs:string;
  isConsulta: boolean;
  listProceso: Array<ProcesoElectoralResponseBean>;
  listEleccion: Array<EleccionResponseBean>;
  acta: VerificationActaResponseBean;
  tokenActa: TokenActaVerificacionBean;
  numeroPaso: number;
  isVisibleBtnsAcciones: boolean;
  numMesa: string;
  isDisabledCheckboxSinDatos: boolean = false;
  isDisabledBtnGuardar: boolean = false;

  // Timer automático para verificación
  private timerVerificacion: any = null;
  private timerContador: any = null;
  private timerInicialEleccion: any = null;
  public mensajeEstadoVerificacion: string = '';
  public mostrarMensajeEstado: boolean = false;
  public contadorSegundos: number = 0;

  public formGroupUbigeo: FormGroup;
  public formGroupAcciones: FormGroup;
  public solicitudNulidad: boolean;
  public actaIncompleta: boolean;
  public sinDatos: boolean;
  public txtBtnGuardar: string;

  public tituloAlert="Digitación de actas";

  imagenesCargadasDate = false;
  imagenesCargadasObservacion = false;

  Constantes = Constantes;

  isLoadingBtn = {
    verificar: false,
    grabar: false
  }

  constructor(private readonly verificacionActaService: VerificacionActaService,
              private readonly messageVerificacionActasService:MessageVerificacionActasService,
              private readonly formBuilder: FormBuilder,
              public dialog: MatDialog,
              private readonly renderer: Renderer2,
              private readonly el: ElementRef,
              private readonly router: Router,
              private readonly utilityService:UtilityService,
              private readonly generalService:GeneralService,
              private readonly cdr: ChangeDetectorRef) {
    this.listEleccion = [];
    this.isConsulta = true;
    this.tokenActa = new TokenActaVerificacionBean();
    this.isVisibleBtnsAcciones = false;
    this.numeroPaso = 0;

    this.solicitudNulidad = false;
    this.actaIncompleta = false;
    this.sinDatos = false;
    this.txtBtnGuardar = "CONTINUAR"

    this.numMesa = "";

    this.formGroupUbigeo = this.formBuilder.group({
      procesoFormControl: ['0'],
      eleccionFormControl: ['0'],
      departamentoFormControl: [{value:'',disabled: true}],
      provinciaFormControl: [{value:'',disabled: true}],
      distritoFormControl: [{value:'',disabled: true}],
      localVotacionFormControl: [{value:'',disabled: true}]
    });

    this.formGroupAcciones = this.formBuilder.group({
      indCheckCumple: [false],
      txtBtnGuardar: [Constantes.CO_TXT_BTN_CONTINUAR_VERIFICACION]
    });

    effect(() => {
      const elementToFocus = this.messageVerificacionActasService.elementToFocus();

      if (!this.botonRechazar || !this.botonObservaciones || !this.botonContinuar) {
        return; // Los elementos todavía no están disponibles
      }

      switch (elementToFocus) {
        case FocusElementVeri.RECHAZAR:
          setTimeout(() => this.botonRechazar.nativeElement.focus());
          break;
        case FocusElementVeri.OBSERVACIONES:
          setTimeout(() => this.botonObservaciones.nativeElement.focus());
          break;
        case FocusElementVeri.CONTINUAR:
          setTimeout(() => this.botonContinuar.nativeElement.focus());
          break;
        case FocusElementVeri.SIN_DATOS:
          setTimeout(() => this.checkSinDatos.focus());
          break;
        case FocusElementVeri.SOLI_NULIDAD:
          setTimeout(() => this.checkSolicitudNulidad.focus());
          break;
        case FocusElementVeri.ANTERIOR:
          setTimeout(() => this.botonAnterior.nativeElement.focus());
          break;
      }
    });
  }

  async verObservaciones(): Promise<void> {
    this.messageVerificacionActasService.setVerObservaciones(true);

    if (!this.imagenesCargadasObservacion) {
      sessionStorage.setItem('loading', 'true');
      await this.loadObservationSectionImages();
      this.imagenesCargadasObservacion = true;
      sessionStorage.setItem('loading', 'false');
    }

    const dataSolicitudAutorizacion: AutorizacionCCRequestBean = {
      usuario: "",
      tipoAutorizacion: Constantes.TIPO_AUTORIZACION_VER_AGRUPACION_POLITICA,
      tipoDocumento: Constantes.CONTROL_CALIDAD_TIPO_DOCUMENTO_ACTA,
      idDocumento: this.tokenActa.actaRandom?.idActa
    }
    const dialogRef = this.dialog.open(ModalobservacionComponent, {
      backdropClass: 'modalBackdrop',
      panelClass: 'modalPanel',
      width: '1200px',
      maxWidth: '80vw',
      autoFocus: false,
      maxHeight: '90vh',
      disableClose: true,
      data: {
        pngImageUrlObservacionEscrutinio: this.acta.observationSection.count.filePngUrl,
        pngImageUrlObservacionInstalacion: this.acta.observationSection.install.filePngUrl,
        pngImageUrlObservacionSufragio: this.acta.observationSection.vote.filePngUrl,
        solicitudNulidad: this.acta.observationSection.nullityRequest,
        autorizado: this.acta.voteSection.autorizado,
        solicitudAutorizacion: dataSolicitudAutorizacion
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.solicitudNulidad = result;
      this.acta.observationSection.nullityRequest = this.solicitudNulidad;
    });
  }

  changeSolicitudNulidad(event:any){
    this.solicitudNulidad = event.checked;
    this.acta.observationSection.nullityRequest = this.solicitudNulidad;
  }

  changeSinDatos(event:any){
    const isChecked = event.checked;
    if (isChecked) {
      this.utilityService.popupConfirmacionConAcciones(
        event,
        'Usted eligió registrar el acta Sin Datos, se limpiarán los campos. ¿Está seguro de continuar?',
        ()=> this.confirmarSinDatos(),
        ()=> this.cancelarSinDatos(event)
      );
    }else{
      this.sinDatos = false;
      this.acta.observationSection.noData = this.sinDatos;
      this.messageVerificacionActasService.setSinDatos(this.sinDatos);
    }
  }

  private confirmarSinDatos(): void {
    this.sinDatos = true;
    this.acta.observationSection.noData = this.sinDatos;
    this.messageVerificacionActasService.setSinDatos(this.sinDatos);
  }

  private cancelarSinDatos(event: any): void {
    event.source.checked = false;
  }


  confirmarRechazarActa(): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.rechazarActa();
        }
      });
  }
  rechazarActa(){
    sessionStorage.setItem('loading','true');
    this.verificacionActaService.rechazarActa( this.numMesa,this.formGroupUbigeo.get('eleccionFormControl').value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.rechazarActaCorrecto.bind(this),
        error: this.rechazarActaIncorrecto.bind(this)
      });
  }

  rechazarActaCorrecto(response: GenericResponseBean<boolean>){
    sessionStorage.setItem('loading','false');
    if (response.success){
      let popMensaje :PopMensajeData= {
        title:this.tituloAlert,
        mensaje:"Se ejecutó correctamente.",
        icon:IconPopType.CONFIRM,
        success:true
      }
      this.dialog.open(PopMensajeComponent, {
        disableClose: true,
        data: popMensaje
      })
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {
            this.isConsulta=true;
            this.router.navigate(['/main/verificacion-actas/consulta']);
            this.verificarActa();
          }
        });
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, "Ocurrió un error al rechazar acta.", IconPopType.ALERT);
    }
  }

  rechazarActaIncorrecto(reason: any){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup(this.tituloAlert, "Ocurrió un error para rechazar acta", IconPopType.ERROR);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async guardarContinuar(){
    this.messageVerificacionActasService.setFocus(FocusElementVeri.CONTINUAR);
    switch (this.numeroPaso) {
      case 1:{
        if(!this.messageVerificacionActasService.verObservaciones()){
          this.utilityService.mensajePopup(this.tituloAlert, "Haga clic en \"Ver Observaciones\" para continuar con el proceso.", IconPopType.ALERT);
          return;
        }
        sessionStorage.setItem('loading', 'true');
        await this.delay(50);
        this.messageVerificacionActasService.getPaso1VerificacionBean().pipe(take(1))
          .subscribe(
            value => {
              this.acta.signSection = value;
              if (this.acta.observationSection && !this.acta.observationSection.noData){
                this.messageVerificacionActasService.setFocus(FocusElementVeri.INPUT_VOTO_FIRST)
              }
              this.goToPaso2();
            }
          );
        break;
      }
      case 2:{
        sessionStorage.setItem('loading','true');
        this.sinDatos = this.messageVerificacionActasService.sinDatos();
        this.messageVerificacionActasService.getPaso2DataVerificacionBean().pipe(take(1))
          .subscribe(value => {
            this.utilityService.setLoading(false);
            this.acta.voteSection = value.voteSection;
            if(!this.sinDatos && this.isMostrarMensajeSinDatos()){
              this.mostrarConfirmacionSinDatos();
              return;
            }

            if(!this.sinDatos && this.tieneSystemValuesSinUserValue()){
              this.mostrarAlertaCamposSinDigitar();
              return;
            }
            this.goToPaso3();
          });
        break;
      }
      case 3:{
        this.txtBtnGuardar = "GRABAR";
        if(!this.requisitosMinimosParaGrabar()) return;
        this.confirmarGrabarActa();
      }
    }
  }

  confirmarGrabarActa(): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        disableClose: true,
        data: `¿Está seguro de continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.grabarActa();
        }
      });
  }

  isMostrarMensajeSinDatos(): boolean {
    const eleccion = this.formGroupUbigeo.get('eleccionFormControl').value.toString();
    const items = this.acta?.voteSection?.items || [];

    // Si no hay items, no hay datos que mostrar
    if (!items.length) return false;

    // Definir qué tipo de validación aplicar según el tipo de elección
    if (eleccion === Constantes.COD_ELEC_REVOCATORIA) {
      return this.todosVotosRevocatoriaVacios(items);
    } else if (eleccion === Constantes.COD_ELEC_PRE) {
      return this.todosUserValueVacios(items);
    } else {
      return this.todosVotosPreferencialesVacios(items);
    }
  }

  private tieneSystemValuesSinUserValue(): boolean {
    const items = this.acta?.voteSection?.items || [];
    if(!items.length) return false;

    return items.some(item => {
      const tieneSystemValueTotalSinDigitar = this.verificarSystemValueSinUserValue(
        item.systemValue,
        item.userValue
      );
      if(tieneSystemValueTotalSinDigitar) return true;

      //para preferenciales
      if (item.votoPreferencial && Array.isArray(item.votoPreferencial)) {
        const tieneVotoPreferencialSinDigitar = item.votoPreferencial.some(votoPreferencial => {
          return this.verificarSystemValueSinUserValue(
            votoPreferencial.systemValue,
            votoPreferencial.userValue
          );
        });

        if (tieneVotoPreferencialSinDigitar) {
          return true;
        }
      }

      return false;
    });
  }

  private verificarSystemValueSinUserValue(systemValue: any, userValue: any): boolean {
    const tieneSystemValueValido = this.esSistemValueValido(systemValue);
    const userValueVacio = this.esValorVacio(userValue);
    return tieneSystemValueValido && userValueVacio;
  }

  private esSistemValueValido(systemValue: any): boolean {
    if(systemValue === null || systemValue === undefined) return false;
    if(systemValue === -1) return false;
    if(systemValue === '' || systemValue === '-1' || systemValue === '0') return false;
    return true;
  }

  private mostrarAlertaCamposSinDigitar(): void{
    const primerInputPendiente = this.encontrarPrimerCasilleroSinDigitar();
    if(!primerInputPendiente){
      this.goToPaso3();
      return;
    }

    const mensaje = `Se ha detectado un campo donde podría haber votos, pero no se han digitado. ¿Desea continuar con el siguiente paso?

    Haga clic en Sí para pasar al siguiente paso de la digitación.
    Haga clic en No para revisar el campo.`;

    this.utilityService.popupConfirmacion(null, mensaje, (confirmado: boolean) => {
      if (confirmado) {
        this.goToPaso3();
      }else{
        this.messageVerificacionActasService.setInputIdToFocus(primerInputPendiente.inputId);
        this.messageVerificacionActasService.setFocus(FocusElementVeri.INPUT_VOTO);
      }
    },
      {alineacion: AlineacionType.LEFT}
    );
  }

  private encontrarPrimerCasilleroSinDigitar():{inputId: string, rowIndex: number, colIndex?: number} | null {
    const items = this.acta?.voteSection?.items || [];
    for(let i = 0; i < items.length; i++){
      const item = items[i];
      if(this.verificarSystemValueSinUserValue(item.systemValue,item.userValue)){
        return {
          inputId: `mat-input-total-${i}`,
          rowIndex: i
        };
      }
      //verificar votos preferenciales
      if(item.votoPreferencial && Array.isArray(item.votoPreferencial)){
        for(let j = 0; j < item.votoPreferencial.length; j++){
          const votoPreferencial = item.votoPreferencial[j];
          if(this.verificarSystemValueSinUserValue(votoPreferencial.systemValue, votoPreferencial.userValue)){
            return {
              inputId: `mat-input-pref-${i}-${j}`,
              rowIndex: i,
              colIndex: j
            };
          }
        }
      }
    }
    return null;
  }

  private esValorVacio(valor: any): boolean {
    return valor === '' || valor === null;
  }

  private todosVotosRevocatoriaVacios(items: any[]): boolean {
    return items.every(item => {
      return !item.votoRevocatoria ||
        item.votoRevocatoria.every((voto: any) => this.esValorVacio(voto.userValue));
    });
  }

  private todosUserValueVacios(items: any[]): boolean {
    return items.every(item => this.esValorVacio(item.userValue));
  }

  private todosVotosPreferencialesVacios(items: any[]): boolean {
    return items.every(item => {
      const isUserValueEmpty = this.esValorVacio(item.userValue);
      const areVotoPreferencialValuesEmpty =
        !item.votoPreferencial ||
        item.votoPreferencial.every((voto: any) => this.esValorVacio(voto.userValue));

      return isUserValueEmpty && areVotoPreferencialValuesEmpty;
    });
  }

  eliminarPngUrl(){
    const eleccionValue = this.formGroupUbigeo.get('eleccionFormControl').value.toString();
    let dataGuardar = JSON.parse(JSON.stringify(this.acta));
    if (eleccionValue === Constantes.COD_ELEC_REVOCATORIA){
      this.procesarVotosRevocatoria(dataGuardar);
    }else{
      this.procesarVotosRegulares(dataGuardar);
    }

    // Limpiar secciones comunes para ambos tipos de elección
    this.limpiarSeccionFirmas(dataGuardar);
    this.limpiarSeccionFechas(dataGuardar);
    this.limpiarSeccionObservaciones(dataGuardar);

    return dataGuardar;
  }

  // Procesa votos específicos para revocatoria
  private procesarVotosRevocatoria(data: any): void {
    data.voteSection.items.forEach(voto => {
      this.limpiarObjeto(voto);
      if (voto.votoRevocatoria && Array.isArray(voto.votoRevocatoria)) {
        voto.votoRevocatoria.forEach(votoRevo => this.limpiarObjeto(votoRevo));
      }
    });
  }

// Procesa votos para elecciones regulares
  private procesarVotosRegulares(data: any): void {
    data.voteSection.items.forEach(voto => {
      this.limpiarObjeto(voto);
      if (voto.votoPreferencial) {
        voto.votoPreferencial.forEach(votoPrefItem => this.limpiarObjeto(votoPrefItem));
      }
    });
  }

  // Limpia todas las URLs de PNG en la sección de firmas
  private limpiarSeccionFirmas(data: any): void {
    const secciones = ['countPresident', 'countSecretary', 'countThirdMember',
      'installPresident', 'installSecretary', 'installThirdMember',
      'votePresident', 'voteSecretary', 'voteThirdMember'];

    secciones.forEach(seccion => {
      if (data.signSection[seccion]) {
        delete data.signSection[seccion].filePngUrl;
      }
    });
  }

// Limpia URLs de PNG en la sección de fechas
  private limpiarSeccionFechas(data: any): void {
    if (data.dateSectionResponse) {
      if (data.dateSectionResponse.start) delete data.dateSectionResponse.start.filePngUrl;
      if (data.dateSectionResponse.end) delete data.dateSectionResponse.end.filePngUrl;
      if (data.dateSectionResponse.total) {
        delete data.dateSectionResponse.total.filePngNumberUrl;
        delete data.dateSectionResponse.total.filePngNumberEscrutinioUrl;
        delete data.dateSectionResponse.total.filePngTextoUrl;
      }
    }
  }

// Limpia URLs de PNG en la sección de observaciones
  private limpiarSeccionObservaciones(data: any): void {
    const observacionSecciones = ['count', 'install', 'vote'];
    observacionSecciones.forEach(seccion => {
      const seccionData = data?.observationSection?.[seccion];
      if (seccionData) {
        delete seccionData.filePngUrl;
      }
    });
  }

  limpiarObjeto(obj: any): void {
    if (obj.hasOwnProperty('filePngUrl')) delete obj.filePngUrl;
    if (obj.hasOwnProperty('isEditable')) delete obj.isEditable;
  }

  onFocusChange(element: FocusElementVeri) {
    this.messageVerificacionActasService.setFocus(element);
  }

  grabarActa(){
    this.isDisabledBtnGuardar = true;
    sessionStorage.setItem('loading','true');
    let dataGuardar = this.eliminarPngUrl();
    this.verificacionActaService.saveActa( dataGuardar)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.saveActaCorrecto.bind(this),
        error: this.saveActaIncorrecto.bind(this)
      });
  }

  async pasoAnterior(){
    this.messageVerificacionActasService.setFocus(FocusElementVeri.ANTERIOR);
    switch (this.numeroPaso) {
      case 2:{
        sessionStorage.setItem('loading', 'true');
        this.messageVerificacionActasService.getPaso2DataVerificacionBean().pipe(take(1))
          .subscribe(value => {
            this.acta.voteSection = value.voteSection;
            this.messageVerificacionActasService.setFocus(FocusElementVeri.TOGGLE);
            this.goToPaso1();
          });
        break;
      }
      case 3:{
        sessionStorage.setItem('loading', 'true');
        await this.delay(50);
        this.messageVerificacionActasService.getPaso3DataVerificacinBean().pipe(take(1))
          .subscribe( value => {
            this.acta.dateSectionResponse = value;
            if (this.acta.observationSection && !this.acta.observationSection.noData){
              this.messageVerificacionActasService.setFocus(FocusElementVeri.INPUT_VOTO_FIRST)
            }
            this.goToPaso2();
          });
        break;
      }
    }
  }

  ngOnDestroy() {
    // Limpiar el timer al destruir el componente
    this.detenerTimerVerificacion();
    this.detenerTimerContador();
    if (this.timerInicialEleccion) {
      clearTimeout(this.timerInicialEleccion);
      this.timerInicialEleccion = null;
    }
  }


  ngOnInit() {
    this.generalService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.obtenerProcesosCorrecto.bind(this),
        error: this.obtenerProcesosIncorrecto.bind(this)
      });

    this.messageVerificacionActasService.setFocus(null);
    this.messageVerificacionActasService.getRecargarObservaciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.imagenesCargadasObservacion = false;
      });
    //listeners para los combos
    this.onProcesoChanged();
    this.onEleccionChanged();
  }

  onProcesoChanged():void{
    const ctrlProceso = this.formGroupUbigeo.get('procesoFormControl');
    if (ctrlProceso){
      ctrlProceso.valueChanges
        .pipe(
          tap((idProceso) => {
            this.detenerTimerVerificacion();
            this.mostrarMensajeEstado = false;
            this.mensajeEstadoVerificacion = '';

            if (!idProceso || idProceso === '0') {
              // Limpiar la fecha del proceso
              this.messageVerificacionActasService.setFechaProceso(null);
              this.formGroupUbigeo.get('eleccionFormControl').setValue('0');
            } else {
              // Buscar el proceso seleccionado
              const procesoSeleccionado = this.listProceso.find(
                p => p.id === idProceso
              );

              if (procesoSeleccionado?.dfechaConvocatoria) {
                this.messageVerificacionActasService.setFechaProceso(
                  new Date(procesoSeleccionado.dfechaConvocatoria)
                );
              } else {
                // Si el proceso no tiene fecha, también limpiar
                this.messageVerificacionActasService.setFechaProceso(null);
              }
              this.formGroupUbigeo.get('eleccionFormControl').setValue('0');
            }
            this.isConsulta = true;
            this.router.navigate(['/main/verificacion-actas/consulta']);
          }),
          switchMap(idProceso => this.generalService.obtenerElecciones(idProceso)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: this.obtenerEleccionesCorrecto.bind(this),
          error: this.obtenerEleccionesIncorrecto.bind(this),
          complete: () => console.info("completo en obtenerElecciones")
        });
    }
  }

  onEleccionChanged():void{
    const eleccionControl = this.formGroupUbigeo.get('eleccionFormControl');
    if (eleccionControl){
      eleccionControl.valueChanges
        .pipe(
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(value => {

          this.isConsulta= true;
          this.router.navigate(['/main/verificacion-actas/consulta']);

          if (value && value !== '0') {
            // Detener el timer actual
            this.detenerTimerVerificacion();
            this.mostrarMensajeEstado = false;
            this.mensajeEstadoVerificacion = '';

            this.imagenesCargadasDate = false;

            if (this.timerInicialEleccion) {
              clearTimeout(this.timerInicialEleccion);
            }
            this.timerInicialEleccion = setTimeout(() => {
              this.timerInicialEleccion = null;
              this.verificarActaAutomatico();
              this.iniciarTimerVerificacion();
            }, 500);
          } else {
            // Si se selecciona '0', detener el timer
            this.detenerTimerVerificacion();
            this.mostrarMensajeEstado = false;
            this.mensajeEstadoVerificacion = '';
          }
        });
    }

  }

  obtenerProcesosCorrecto(response:GenericResponseBean<Array<ProcesoElectoralResponseBean>>){
    this.listProceso = response.data;
    this.isConsulta=true;
    this.router.navigate(['/main/verificacion-actas/consulta']);

    // Si hay procesos disponibles, seleccionar el primero automáticamente
    if (this.listProceso && this.listProceso.length > 0) {
      const primerProceso = this.listProceso[0];
      // Usar setValue con emitEvent: true para que dispare la carga de elecciones
      this.formGroupUbigeo.get('procesoFormControl').setValue(primerProceso.id, { emitEvent: true });
    }
  }

  obtenerProcesosIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "Ocurrió un error para cargar los procesos", IconPopType.ALERT);
    this.goToConsulta();
  }

  sonValidosLosDatos() :string | null{
    if(!this.formGroupUbigeo.get('procesoFormControl').value ||
      this.formGroupUbigeo.get('procesoFormControl').value === '0'){
      return "Seleccione un proceso";
    }
    if(!this.formGroupUbigeo.get('eleccionFormControl').value ||
      this.formGroupUbigeo.get('eleccionFormControl').value === '0'){
      return "Seleccione una elección";
    }
    return null;
  }

  requisitosMinimosParaGrabar() :boolean{

    if(this.acta.dateSectionResponse.total.numberUserValue  === '' ||
      this.acta.dateSectionResponse.total.numberUserValue === null){//ZOE
      this.utilityService.mensajePopup(this.tituloAlert, `Ingrese la cantidad de ciudadanos que votaron o la letra "N".`, IconPopType.ALERT);
      return false;
    }
    if(this.acta.dateSectionResponse.start.userValue  === '' ||
      this.acta.dateSectionResponse.start.userValue === null){
      this.utilityService.mensajePopup(this.tituloAlert, "Ingrese la hora de inicio en formato 'hh:mm' de lo contrario ingrese la letra 'N'", IconPopType.ALERT);
      return false;
    }
    if(this.acta.dateSectionResponse.end.userValue === '' ||
      this.acta.dateSectionResponse.end.userValue === null){
      this.utilityService.mensajePopup(this.tituloAlert, "Ingrese la hora de finalización en formato 'hh:mm' de lo contrario ingrese la letra 'N'", IconPopType.ALERT);
      return false;
    }
    const horaStr = this.acta.dateSectionResponse.start.userValue.split(' ')[1];
    if (horaStr !== Constantes.CO_VALOR_N){
      const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
      const formatoHoraInstalacion= timeRegex.test(horaStr)
      if ( !formatoHoraInstalacion){
        this.utilityService.mensajePopup(this.tituloAlert, "Solo se permite ingresar la hora de inicio de 00:00 a 23:59", IconPopType.ALERT);
        return false;
      }
    }

    const fechaHoraEnd = this.acta.dateSectionResponse.end.userValue;
    if (fechaHoraEnd !== Constantes.CO_VALOR_N){
      const horaEnd = this.acta.dateSectionResponse.end.userValue.split(' ')[1];
      const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
      const formatoHoraEscrutinio= timeRegex.test(horaEnd)
      if ( !formatoHoraEscrutinio){
        this.utilityService.mensajePopup(this.tituloAlert, "Solo se permite ingresar la hora de finalización de 00:00 a 23:59", IconPopType.ALERT);
        return false;
      }
    }

    return true;
  }

  saveActaCorrecto(response: GenericResponseBean<boolean>){
    sessionStorage.setItem('loading','false');
    if(response.success){
      let popMensaje :PopMensajeData= {
        title:this.tituloAlert,
        mensaje:response.message,
        icon:IconPopType.CONFIRM,
        success:true
      }
      this.dialog.open(PopMensajeComponent, {
        disableClose: true,
        data: popMensaje
      })
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {
            this.isDisabledBtnGuardar = false
            this.isConsulta=true;
            this.router.navigate(['/main/verificacion-actas/consulta']);

            this.imagenesCargadasDate = false;

            // Buscar inmediatamente la siguiente acta
            setTimeout(() => {
              this.verificarActaAutomatico();
            }, 500);
          }
        });
    }else{
      this.isDisabledBtnGuardar = false
      this.utilityService.mensajePopup(this.tituloAlert, this.utilityService.manejarMensajeError(response), IconPopType.ALERT);
    }
  }

  saveActaIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.isDisabledBtnGuardar = false;
    this.utilityService.mensajePopup(this.tituloAlert, this.utilityService.manejarMensajeError(error), IconPopType.ALERT);
  }

  reiniciarValores(){
    this.txtBtnGuardar="CONTINUAR"
    this.isConsulta = true;
    this.numeroPaso=0;
    this.imagenesCargadasDate = false;
    this.imagenesCargadasObservacion = false;
    this.sinDatos = false;
    this.messageVerificacionActasService.setVerObservaciones(false);
    this.messageVerificacionActasService.setSinDatos(false);
    this.messageVerificacionActasService.setFocus(null);
    this.solicitudNulidad = false;
  }
  public verificarActa(){
    if (this.isLoadingBtn.verificar) return;

    this.isLoadingBtn.verificar = true;
    this.mostrarMensajeEstado = false;
    this.mensajeEstadoVerificacion = '';

    // Detener el timer actual
    this.detenerTimerVerificacion();
    if (this.timerInicialEleccion) {
      clearTimeout(this.timerInicialEleccion);
      this.timerInicialEleccion = null;
    }

    let resultadoMensaje = this.sonValidosLosDatos();

    if(resultadoMensaje) {
      this.utilityService.mensajePopupCallback(this.tituloAlert,resultadoMensaje,IconPopType.ALERT,
        (confirmado: boolean)=>{
          this.isLoadingBtn.verificar = false;
          setTimeout(() => {
            this.btnVerificar?.nativeElement.focus();
          }, 0);
        });
      return;
    }

    this.utilityService.setLoading(true);

    this.reiniciarValores();

    this.verificacionActaService.getRandomActa(this.formGroupUbigeo.get('eleccionFormControl').value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getRandomActaCorrecto.bind(this),
        error: this.getRandomActaIncorrecto.bind(this)
      });
  }

  private iniciarTimerVerificacion(): void {
    this.detenerTimerVerificacion();

    this.timerVerificacion = setTimeout(() => {
      this.verificarActaAutomatico();
    }, Constantes.TIMER_VERIFICACION_ACTAS_MS);

    this.iniciarContadorRegresivo();
  }

  private detenerTimerVerificacion(): void {
    if (this.timerVerificacion) {
      clearTimeout(this.timerVerificacion);
      this.timerVerificacion = null;
    }
    this.detenerTimerContador();
  }


  private iniciarContadorRegresivo(): void {
    this.detenerTimerContador();
    this.contadorSegundos = Math.floor(Constantes.TIMER_VERIFICACION_ACTAS_MS / 1000);

    this.timerContador = setInterval(() => {
      this.contadorSegundos--;
      if (this.contadorSegundos <= 0) {
        this.contadorSegundos = Math.floor(Constantes.TIMER_VERIFICACION_ACTAS_MS / 1000);
      }
      this.actualizarMensajeConContador();
    }, 1000);
  }

  private detenerTimerContador(): void {
    if (this.timerContador) {
      clearInterval(this.timerContador);
      this.timerContador = null;
    }
  }

  private actualizarMensajeConContador(): void {
    if (this.mostrarMensajeEstado) {
      this.mensajeEstadoVerificacion = `No existen actas para digitación, volviendo a buscar en ${this.contadorSegundos} segundo${this.contadorSegundos !== 1 ? 's' : ''}...`;
    }
  }

  // Verificación automática (sin popups)
  private verificarActaAutomatico(): void {
    let resultadoMensaje = this.sonValidosLosDatos();
    if(resultadoMensaje) {
      this.mostrarMensajeEstado = true;
      this.actualizarMensajeConContador();
      return;
    }

    sessionStorage.setItem('loading','true');

    this.reiniciarValores();

    this.verificacionActaService.getRandomActa(this.formGroupUbigeo.get('eleccionFormControl').value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getRandomActaCorrectoAutomatico.bind(this),
        error: this.getRandomActaIncorrectoAutomatico.bind(this)
      });
  }

  private getRandomActaCorrectoAutomatico(response: GenericResponseBean<VerificationActaResponseBean>): void {
    sessionStorage.setItem('loading','false');

    if (!response.success){
      this.mostrarMensajeEstado = true;
      this.actualizarMensajeConContador();

      this.iniciarTimerVerificacion();
    } else {
      this.detenerTimerVerificacion();
      this.mostrarMensajeEstado = false;
      this.mensajeEstadoVerificacion = '';

      this.isLoadingBtn.verificar = false;
      this.acta = response.data;
      this.manejarTokenActa();
      this.goToPaso1();
    }
  }

  private getRandomActaIncorrectoAutomatico(error: any): void {
    sessionStorage.setItem('loading','false');

    this.mostrarMensajeEstado = true;
    this.actualizarMensajeConContador();
    console.error('Verificación automática - Error:', error);

    // Reiniciar el timer después de recibir el error
    this.iniciarTimerVerificacion();
  }

  goToConsulta(){
    this.isConsulta= true;
    this.router.navigate(['/main/verificacion-actas/consulta']);
  }

  getRandomActaCorrecto(response: GenericResponseBean<VerificationActaResponseBean>){
    this.acta = new VerificationActaResponseBean();
    if (!response.success){
      sessionStorage.setItem('loading','false');
      this.utilityService.mensajePopupCallback(this.tituloAlert, response.message, IconPopType.ALERT,
        (confirmado: boolean)=>{
          this.isLoadingBtn.verificar = false;
          this.goToConsulta();
          // Reiniciar timer automático cuando no hay actas disponibles
          this.iniciarTimerVerificacion();
          setTimeout(() => {
            this.btnVerificar?.nativeElement.focus();
          }, 0);
        });
    }else{
      this.isLoadingBtn.verificar = false;
      this.acta = response.data;
      this.manejarTokenActa();
      this.goToPaso1();
      // No reiniciar el timer aquí porque encontró un acta
    }

  }

  goToPaso1(): void {
    this.messageVerificacionActasService.setPaso1VerificacionBean(this.acta.signSection);
    this.txtBtnGuardar = "CONTINUAR";
    this.numeroPaso = 1;
    sessionStorage.setItem('loading', 'false');
    this.isConsulta = false;
    this.router.navigate(['/main/verificacion-actas/paso1']);
  }

  goToPaso2(): void{
    if (this.acta.voteSection !== null){
      const eleccionValue = this.formGroupUbigeo.get('eleccionFormControl').value.toString();
      const descripcionTipoEleccion = Utility.getCodEleccionToDescripcion(eleccionValue)
      this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.acta.voteSection,this.acta.solucionTecnologica, descripcionTipoEleccion);
      this.txtBtnGuardar = "CONTINUAR";
      this.numeroPaso = 2;
      if (this.acta.solucionTecnologica === Constantes.TIPO_SOLU_TECNO_STAE){
        this.isDisabledCheckboxSinDatos = true;
      }

      switch (eleccionValue) {
        case Constantes.COD_ELEC_PRE:
          this.router.navigate(['/main/verificacion-actas/presidencial']);
          break;
        case Constantes.COD_ELEC_DIST:
          this.router.navigate(['/main/verificacion-actas/paso2Distrital']);
          break;
        case Constantes.COD_ELEC_REVOCATORIA:
          this.router.navigate(['/main/verificacion-actas/revocatoria']);
          break;
        case Constantes.COD_ELEC_DIPUTADOS:
          this.router.navigate(['/main/verificacion-actas/diputados']);
          break;
        case Constantes.COD_ELEC_PAR:
          this.router.navigate(['/main/verificacion-actas/parlamento-andino']);
          break;
        case Constantes.COD_ELEC_SENADO_UNICO:
          this.router.navigate(['/main/verificacion-actas/senador-unico']);
          break;
        case Constantes.COD_ELEC_SENADO_MULTIPLE:
          this.router.navigate(['/main/verificacion-actas/senador-multiple']);
          break;
        default:
          // Votos preferenciales
          this.router.navigate(['/main/verificacion-actas/paso2Congre']);
          break;
      }
    }else{
      this.utilityService.mensajePopup(this.tituloAlert,"No hay datos en la sección de votos.",IconPopType.ALERT);
    }
  }

  async goToPaso3(): Promise<void>{
    this.messageVerificacionActasService.setFocus(FocusElementVeri.CANTIDAD_CIUDADANOS);
    if (!this.imagenesCargadasDate){
      sessionStorage.setItem('loading','true');
      await this.loadDateSectionImages();
      sessionStorage.setItem('loading','false');
      this.imagenesCargadasDate = true;
    }

    this.txtBtnGuardar = "GRABAR";
    this.messageVerificacionActasService.setPaso3DataVerificacinBean(this.acta.dateSectionResponse);
    this.numeroPaso = 3;
    this.router.navigate(['/main/verificacion-actas/paso3']);
  }

  private mostrarConfirmacionSinDatos(): void {
    const mensaje = "No ingresó ningun valor en la sección de votos. ¿Está seguro de continuar?";

    this.utilityService.popupConfirmacion(null, mensaje, (confirmado: boolean) => {
      if (confirmado) {
        this.goToPaso3();
      }
    });
  }


  async loadObservationSectionImages() {
    const observationItems = [
      this.acta.observationSection.count,
      this.acta.observationSection.install,
      this.acta.observationSection.vote
    ];
    await this.loadImages(observationItems);
  }

  async loadDateSectionImages() {
    const dateItems = [
      this.acta.dateSectionResponse.start,
      this.acta.dateSectionResponse.end,
      this.acta.dateSectionResponse.total
    ];

    const imagePromises = dateItems.map(async (item) => {
      if (!item) return;

      try {
        if ('fileIdNumber' in item) {
          // VerificationDatetimeTotalBean
          item.filePngTextoUrl = item.fileId !== null
            ? URL.createObjectURL(await this.verificacionActaService.getFileV2(item.fileId))
            : "";

          item.filePngNumberUrl = item.fileIdNumber !== null
            ? URL.createObjectURL(await this.verificacionActaService.getFileV2(item.fileIdNumber))
            : "";

          if(item.fileIdNumberEscrutinio==-1){
            const noImageBlob = await this.fetchImagen('../../../../../assets/img/doc/no_imagen_voto.png');
            item.filePngNumberEscrutinioUrl = URL.createObjectURL(noImageBlob);
          }else{
            item.filePngNumberEscrutinioUrl = item.fileIdNumberEscrutinio !== null
              ? URL.createObjectURL(await this.verificacionActaService.getFileV2(item.fileIdNumberEscrutinio))
              : "";
          }
        } else {
          // VerificationDatetimeItemBean
          item.filePngUrl = item.fileId !== null
            ? URL.createObjectURL(await this.verificacionActaService.getFileV2(item.fileId))
            : "";
        }
      } catch (error) {
        console.error(`Error al cargar imagen para fileId ${item.fileId}`, error);
      }
    });

    await Promise.all(imagePromises);
  }

  private async fetchImagen(url: string): Promise<Blob> {
    try {
      const response = await fetch(url);
      return await response.blob();
    } catch (error) {
      console.error(`Error fetching image at ${url}`, error);
      return new Blob(); // Devuelve un Blob vacío en caso de error
    }
  }

  async loadImages(items: { fileId: number | string | null, filePngUrl?: string }[]) {
    const noImageFirmaBlob = await this.fetchImagen('../../../../../assets/img/doc/no_imagen_firma.png');

    const imagePromises = items.map(async (item) => {
      if (item) {
        try {
          let blob: Blob | null = null;

          // Para otras secciones, asigna cadena vacía si fileId es null
          if (item.fileId === null) {
            blob = noImageFirmaBlob; // No hacer solicitud, solo asignar cadena vacía
            //return;
          } else {
            // Obtener la imagen del servicio para un fileId válido
            blob = await this.verificacionActaService.getFileV2(item.fileId as number);
          }
          item.filePngUrl = URL.createObjectURL(blob);
        } catch (error) {
          console.error(`Error al cargar imagen para fileId ${item.fileId}`, error);
        }
      }
    });

    await Promise.all(imagePromises);
  }

  manejarTokenActa(){
    this.tokenActa = jwtDecode( this.acta.token);
    this.formGroupUbigeo.get('departamentoFormControl').setValue(this.tokenActa.actaRandom?.departamento);
    this.formGroupUbigeo.get('provinciaFormControl').setValue(this.tokenActa.actaRandom?.provincia);
    this.formGroupUbigeo.get('distritoFormControl').setValue(this.tokenActa.actaRandom?.distrito);
    this.formGroupUbigeo.get('localVotacionFormControl').setValue(this.tokenActa.actaRandom?.localVotacion);
    this.numMesa = this.tokenActa.actaRandom?.numMesa;
  }


  getRandomActaIncorrecto(error: any){
    this.utilityService.setLoading(false);
    this.isLoadingBtn.verificar = false;
    this.utilityService.mensajePopup(this.tituloAlert, error.error.message, IconPopType.ALERT);
    this.goToConsulta();
    // Reiniciar timer automático en caso de error
    this.iniciarTimerVerificacion();
  }


  obtenerEleccionesCorrecto(response:GenericResponseBean<Array<EleccionResponseBean>>){
    this.listEleccion = response.data;

    if (this.listEleccion && this.listEleccion.length > 0) {
      const primeraEleccion = this.listEleccion[0];

      setTimeout(() => {
        // Convertir a string explícitamente
        const valorEleccion = String(primeraEleccion.id);

        this.formGroupUbigeo.get('eleccionFormControl').setValue(valorEleccion);
      }, 300);
    }
  }
  obtenerEleccionesIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "Ocurrió un error para cargar lista de elecciones", IconPopType.ALERT);
  }

  handleTabSolicitudNulidad(event: Event){
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.messageVerificacionActasService.setFocus(FocusElementVeri.ANTERIOR);
  }

  handleTabSinDatos(event: Event){
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.messageVerificacionActasService.setFocus(FocusElementVeri.ANTERIOR)
  }

  handleTabAnterior(event: Event){
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.messageVerificacionActasService.setFocus(FocusElementVeri.RECHAZAR);
  }

  handleTabRechazar(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.messageVerificacionActasService.setFocus(FocusElementVeri.OBSERVACIONES);
  }

  handleTabObservaciones(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.messageVerificacionActasService.setFocus(FocusElementVeri.CONTINUAR);
  }

  handleTabContinuar(event:Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    if (this.numeroPaso === 1){
      this.messageVerificacionActasService.setFocus(FocusElementVeri.RELOAD);
    } else if(this.numeroPaso == 2 ){
      this.messageVerificacionActasService.setFocus(FocusElementVeri.INPUT_VOTO_FIRST);
    } else if (this.numeroPaso ===3){
      this.messageVerificacionActasService.setFocus(FocusElementVeri.CANTIDAD_CIUDADANOS);
    }

  }


  protected readonly FocusElementVeri = FocusElementVeri;
}
