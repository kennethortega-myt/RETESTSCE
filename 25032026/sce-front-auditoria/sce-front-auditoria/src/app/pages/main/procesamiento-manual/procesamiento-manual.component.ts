import { Router } from '@angular/router';
import { Constantes } from 'src/app/helper/constantes';
import { UtilityService } from 'src/app/helper/utilityService';
import { MessageProcesamientoManualService } from 'src/app/message/message-procesamiento-manual.service';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import {debounceTime, distinctUntilChanged, finalize, of, switchMap, tap} from "rxjs";
import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from '../dialogo-confirmacion/dialogo-confirmacion.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PopMensajeData } from 'src/app/interface/popMensajeData.interface';
import { PopMensajeComponent } from '../../shared/pop-mensaje/pop-mensaje.component';
import { GeneralService } from 'src/app/service/general-service.service';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { VerificationActaResponseBean } from 'src/app/model/verificationActaResponseBean';
import { TokenActaVerificacionBean } from 'src/app/model/tokenActaVerificacionBean';
import { FormBuilder, FormGroup } from '@angular/forms';
import { VerificacionActaService } from 'src/app/service/verificacion-acta.service';
import { jwtDecode } from 'jwt-decode';
import { VentanaEmergenteService } from 'src/app/service/ventana-emergente.service';
import {FocusElementVeri} from '../../../message/message-verificacion-actas.service';

@Component({
  selector: 'app-procesamiento-manual',
  templateUrl: './procesamiento-manual.component.html',
  styleUrl: './procesamiento-manual.component.scss',
})
export class ProcesamientoManualComponent implements OnInit{
  public destroyRef:DestroyRef = inject(DestroyRef);
  @ViewChild('btnBuscar', { static: false }) btnBuscar: ElementRef<HTMLButtonElement>;

  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public acta: VerificationActaResponseBean;
  public tokenActa: TokenActaVerificacionBean;
  public isConsulta: boolean;
  public formGroupUbigeo: FormGroup;
  public numMesa: string;
  public idActa: number;

  isLoadingBtn = {
    buscar: false,
    grabar: false
  }

  public isShowInicio: boolean;
  public isVerActa: boolean;
  public nroMesaCompleto: string;
  public tituloComponente: string = "Procesamiento Manual";


  constructor(
    private readonly router: Router,
    public readonly dialog: MatDialog,
    private readonly formBuilder: FormBuilder,
    private readonly verificacionActaService: VerificacionActaService,
    private readonly generalService: GeneralService,
    private readonly ventanaEmergenteService: VentanaEmergenteService,
    private readonly utilityService: UtilityService,
    private readonly messageProcesamientoManualService: MessageProcesamientoManualService
  ) {
    this.initializarForm();
    this.initializarData();
  }

  private initializarForm(): void {
    this.formGroupUbigeo = this.formBuilder.group({
      procesoFormControl: [Constantes.OPCION_SELECCIONE],
      eleccionFormControl: [Constantes.OPCION_SELECCIONE],
      departamentoFormControl: [{value:'',disabled: true}],
      provinciaFormControl: [{value:'',disabled: true}],
      distritoFormControl: [{value:'',disabled: true}],
      localVotacionFormControl: [{value:'',disabled: true}]
    });
  }

  private initializarData(): void {
    this.listEleccion = [];
    this.numMesa = "";
    this.idActa = null;
    this.acta = new VerificationActaResponseBean();
    this.tokenActa = new TokenActaVerificacionBean();
    this.isConsulta = true;
  }

  private manejarTokenActa(){
    this.tokenActa = jwtDecode( this.acta.token);
    this.formGroupUbigeo.get('departamentoFormControl').setValue(this.tokenActa.actaRandom?.departamento);
    this.formGroupUbigeo.get('provinciaFormControl').setValue(this.tokenActa.actaRandom?.provincia);
    this.formGroupUbigeo.get('distritoFormControl').setValue(this.tokenActa.actaRandom?.distrito);
    this.formGroupUbigeo.get('localVotacionFormControl').setValue(this.tokenActa.actaRandom?.localVotacion);
    this.numMesa = this.tokenActa.actaRandom?.numMesa;
    this.idActa = this.tokenActa.actaRandom?.idActa;
  }

  get procesoFormControl() {
    return this.formGroupUbigeo.get('procesoFormControl');
  }

  get eleccionFormControl() {
    return this.formGroupUbigeo.get('eleccionFormControl');
  }

  ngOnInit(): void {
    this.utilityService.setLoading(true);
    this.generalService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.obtenerProcesosCorrecto.bind(this),
        error: this.obtenerProcesosIncorrecto.bind(this)
      });

    //listeners para los combos
    this.onProcesoChanged();
    this.onEleccionChanged();
  }

  public verImagenActa(): void {
    if(!this.idActa){
      this.utilityService.mensajePopup(this.tituloComponente, "No se ha encontrado el acta", IconPopType.ALERT);
      return;
    }
    this.utilityService.abrirModalActaPorId(
      this.idActa,
      this.tituloComponente,
      this.destroyRef
    );
  }

  obtenerProcesosCorrecto(response:GenericResponseBean<Array<ProcesoElectoralResponseBean>>){
    this.utilityService.setLoading(false);
    this.listProceso = response.data;
    this.navegarAConsulta();
  }

  obtenerProcesosIncorrecto(error: any){
    this.utilityService.setLoading(false);
    this.utilityService.mensajePopup(this.tituloComponente, "Ocurrió un error para cargar los procesos", IconPopType.ALERT);
    this.navegarAConsulta();
  }

  onProcesoChanged():void{
    this.procesoFormControl.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        tap(() => {
          this.eleccionFormControl.setValue(Constantes.OPCION_SELECCIONE, { emitEvent: false });
          this.listEleccion = [];
          this.resetearActa();
        }),
        switchMap((idProceso) => {
          this.utilityService.setLoading(true);
          if(idProceso === Constantes.OPCION_SELECCIONE){
            this.utilityService.setLoading(false);
            return of({ data: [] } as GenericResponseBean<Array<EleccionResponseBean>>);
          }
          this.obtenerFechaProceso(idProceso);
          return this.generalService.obtenerElecciones(idProceso).pipe(
            finalize(() => {
              this.utilityService.setLoading(false);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response:GenericResponseBean<Array<EleccionResponseBean>>) => {
          this.listEleccion = response.data || [];
          this.navegarAConsulta();
        },
        error: (error) => {
          this.utilityService.mensajePopup(this.tituloComponente, "Ocurrió un error para cargar lista de elecciones", IconPopType.ALERT);
        }
      });
  }

  private obtenerFechaProceso(idProceso){
    const procesoSeleccionado = this.listProceso.find(p => p.id === idProceso);
    if (procesoSeleccionado?.dfechaConvocatoria) {
      const fecha = new Date(procesoSeleccionado.dfechaConvocatoria);
      this.messageProcesamientoManualService.setFechaProceso(fecha);
    }
  }

  onEleccionChanged():void{
    this.eleccionFormControl?.valueChanges
        .pipe(
          distinctUntilChanged(),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.navegarAConsulta();
        });
  }

  private navegarAConsulta(): void {
    this.isConsulta = true;
    this.router.navigate(['/main/procesamiento-manual/consulta']);
  }

  private resetearActa(): void {
    this.acta = new VerificationActaResponseBean();
    this.tokenActa = new TokenActaVerificacionBean();
    this.numMesa = "";
    this.idActa = null;
  }


  buscarActa(){
    if(this.isLoadingBtn.buscar) return;

    this.isLoadingBtn.buscar = true;

    let resultadoMensaje = this.requisitosMinimosParaBuscar()

    if(resultadoMensaje){
      this.utilityService.mensajePopupCallback(this.tituloComponente,resultadoMensaje,IconPopType.ALERT,
        (confirmado: boolean)=>{
          this.isLoadingBtn.buscar = false;
          this.focusBuscarButton();
        });
      return;
    }

    this.utilityService.setLoading(true);

    this.verificacionActaService.getRandomActaProcesamientoManual(this.formGroupUbigeo.get('eleccionFormControl').value)
      .pipe(
        finalize(()=> this.utilityService.setLoading(false)),
        takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getRandomActaManualCorrecto.bind(this),
        error: this.getRandomActaManualIncorrecto.bind(this)
      });

  }

  private getRandomActaManualCorrecto(response: GenericResponseBean<VerificationActaResponseBean>){
    if (!response.success){
      this.utilityService.mensajePopupCallback(this.tituloComponente, response.message, IconPopType.ALERT,
        (confirmado: boolean)=>{
          this.isLoadingBtn.buscar = false;
          this.navegarAConsulta();
          this.focusBuscarButton();
        });
        return;
    }

    this.isLoadingBtn.buscar = false;
    this.acta = response.data;
    this.messageProcesamientoManualService.setDataActaParaProcesamientoManualBean(this.acta);
    this.isConsulta = false;
    this.manejarTokenActa();
    this.verActa(this.eleccionFormControl.value);
  }

  private getRandomActaManualIncorrecto(error: any){
    this.isLoadingBtn.buscar = false;
    this.utilityService.mensajePopup(this.tituloComponente, error.error.message, IconPopType.ALERT);
    this.navegarAConsulta();
  }

  private verActa(codigoEleccion){
    let rutaDestino = '/main/procesamiento-manual/';
    switch (codigoEleccion) {
      case Constantes.COD_ELEC_PRE:
        rutaDestino += 'presidencial';
        break;
      case Constantes.COD_ELEC_PAR:
        rutaDestino += 'parlamento';
        break;
      case Constantes.COD_ELEC_DIPUTADOS:
        rutaDestino += 'diputados';
        break;
      case Constantes.COD_ELEC_SENADO_MULTIPLE:
        rutaDestino += 'senador-multiple';
        break;
      case Constantes.COD_ELEC_SENADO_UNICO:
        rutaDestino += 'senador-unico';
        break;
      default:
        rutaDestino += 'consulta';
        break;
    }
    this.router.navigate([rutaDestino]);
  }

  private requisitosMinimosParaBuscar(): string | null {
    if(this.procesoFormControl.value === Constantes.OPCION_SELECCIONE) {
      return "Seleccione un proceso";
    }
    if(this.eleccionFormControl.value === Constantes.OPCION_SELECCIONE){
      return "Seleccione una elección";
    }
    return null;
  }

  requisitosMinimosParaGrabar() :boolean{

    if(this.acta.dateSectionResponse.total.numberUserValue  === '' ||
      this.acta.dateSectionResponse.total.numberUserValue === null){
      this.utilityService.mensajePopup(this.tituloComponente, `Ingrese la cantidad de ciudadanos que votaron o la letra "N".`, IconPopType.ALERT);
      return false;
    }
    if(this.acta.dateSectionResponse.start.userValue  === '' ||
      this.acta.dateSectionResponse.start.userValue === null){
      this.utilityService.mensajePopup(this.tituloComponente, "Ingrese la hora de inicio en formato 'hh:mm' de lo contrario ingrese la letra 'N'", IconPopType.ALERT);
      return false;
    }
    if(this.acta.dateSectionResponse.end.userValue === '' ||
      this.acta.dateSectionResponse.end.userValue === null){
      this.utilityService.mensajePopup(this.tituloComponente, "Ingrese la hora de finalización en formato 'hh:mm' de lo contrario ingrese la letra 'N'", IconPopType.ALERT);
      return false;
    }
    const horaStr = this.acta.dateSectionResponse.start.userValue.split(' ')[1];
    if (horaStr !== Constantes.CO_VALOR_N){
      const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
      const formatoHoraInstalacion= timeRegex.test(horaStr)
      if ( !formatoHoraInstalacion){
        this.utilityService.mensajePopup(this.tituloComponente, "Solo se permite ingresar la hora de inicio de 00:00 a 23:59", IconPopType.ALERT);
        return false;
      }
    }

    const fechaHoraEnd = this.acta.dateSectionResponse.end.userValue;
    if (fechaHoraEnd !== Constantes.CO_VALOR_N){
      const horaEnd = this.acta.dateSectionResponse.end.userValue.split(' ')[1];
      const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
      const formatoHoraEscrutinio= timeRegex.test(horaEnd)
      if ( !formatoHoraEscrutinio){
        this.utilityService.mensajePopup(this.tituloComponente, "Solo se permite ingresar la hora de finalización de 00:00 a 23:59", IconPopType.ALERT);
        return false;
      }
    }

    return true;
  }

  confirmarRechazarActa(){
    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.rechazarActaProManual();
        }
      });
  }

  rechazarActaProManual(){
    this.utilityService.setLoading(true)
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
        title:this.tituloComponente,
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
            this.navegarAConsulta();
            this.buscarActa();
          }
        });
    }else{
      this.utilityService.mensajePopup(this.tituloComponente, "Ocurrió un error al rechazar acta.", IconPopType.ALERT);
    }
  }

  rechazarActaIncorrecto(reason: any){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup(this.tituloComponente, "Ocurrió un error para rechazar acta", IconPopType.ERROR);
  }

  validarActasParaProcesamientoManual(){
    if(!this.requisitosMinimosParaGrabar()) return;

    this.dialog
          .open(DialogoConfirmacionComponent, {
            disableClose: true,
            data: `¿Está seguro de continuar?`
          })
          .afterClosed()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((confirmado: boolean) => {
            if (confirmado) {
              this.grabarActaParaProcesamientoManual();
            }
          });
  }

  grabarActaParaProcesamientoManual(){
    this.utilityService.setLoading(true);
    this.verificacionActaService.saveActa( this.acta)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.saveActaCorrecto.bind(this),
        error: this.saveActaIncorrecto.bind(this)
      });
  }

  saveActaCorrecto(response: GenericResponseBean<boolean>){
    this.utilityService.setLoading(false);
    if(!response.success){
      this.utilityService.mensajePopup(this.tituloComponente, this.utilityService.manejarMensajeError(response), IconPopType.ALERT);
      return;
    }

    this.utilityService.cerrarModalesMoviblesAbiertos();

    let popMensaje :PopMensajeData= {
      title:this.tituloComponente,
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
          this.navegarAConsulta();
          this.buscarActa();
        }
      });
  }

  private focusBuscarButton(): void {
    setTimeout(() => {
      this.btnBuscar?.nativeElement.focus();
    }, 0);
  }

  saveActaIncorrecto(error){
    this.utilityService.setLoading(false);
    this.utilityService.mensajePopup(this.tituloComponente, "Ocurrió un error para registrar el acta.", IconPopType.ALERT);
  }

  protected readonly FocusElementVeri = FocusElementVeri;
}
