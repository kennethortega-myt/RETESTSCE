import {
  ChangeDetectorRef,
  Component, DestroyRef,
  ElementRef,
  HostListener, inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {ModalResolucionComponent } from './modal-resolucion/modal-resolucion.component';
import {MatDialog } from '@angular/material/dialog';
import {ActaBean, AgrupolBean, AplicarActaBean} from "../../../model/resoluciones/acta-jee-bean";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {finalize, takeUntil} from "rxjs/operators";
import {ResolucionService} from "../../../service/resolucion.service";
import {GeneralService} from "../../../service/general-service.service";
import {AuthComponent} from "../../../helper/auth-component";
import {Usuario} from "../../../model/usuario-bean";
import {distinctUntilChanged, Subject} from "rxjs";
import {Constantes} from "../../../helper/constantes";
import {DialogoConfirmacionComponent} from "../dialogo-confirmacion/dialogo-confirmacion.component";
import {PopListActasAsocComponent} from "../resolucion/pop-list-actas/pop-list-actas-asoc.component";
import {ResolucionAsociadosRequest} from "../../../model/resoluciones/resolucion-bean";
import {PopMensajeData} from "../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../shared/pop-mensaje/pop-mensaje.component";
import {
  DialogoConfirmacionExtsinComponent
} from "../dialogo-confirmacion-extraviadas/dialogo-confirmacion-extsin.component";
import {PopMensajeDataGenerica} from '../../../interface/popMensajeDataGenerica.interface';
import {
  PopMensajeDataGenericaComponent
} from '../../shared/pop-mensaje-data-generica/pop-mensaje-data-generica.component';
import {UtilityService} from '../../../helper/utilityService';
import {VentanaEmergenteService} from '../../../service/ventana-emergente.service';
import { ResolverResolucionType } from 'src/app/model/enum/resolverResolucionType.enum';
import {IconPopType} from '../../../model/enum/iconPopType';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Utility} from '../../../helper/utility';
@Component({
  selector: 'app-verificacion-resolucion',
  templateUrl: './verificacion-resolucion.component.html',
  styleUrls: ['./verificacion-resolucion.component.scss']
})

export class VerificacionResolucionComponent extends AuthComponent implements OnInit, OnDestroy {

  @ViewChild('btnPasarNulos') btnPasarNulos!: ElementRef<HTMLButtonElement>;

  titlePopupMensaje:string="Aplicación de Resoluciones";
  dataSourceAgrupacionesPoliticas:Array<AgrupolBean>;
  cantVotosPrefe: number;
  tipoResolverExtraviadaSiniestradaReconteo:string;

  cvasFC = new FormControl({value:"0", disabled:true});

  tipoNulosFC = new FormControl({value:"", disabled:true});
  accionPasarAnulos :string="0";
  tipoEleccionNulosFC = new FormControl();
  checkSinDatosFC = new FormControl({value:false, disabled:true});
  checkSinFirmasFC = new FormControl({value:false, disabled:true});
  checkIncompletaFC = new FormControl({value:false, disabled:true});
  checkSolNulidadFC = new FormControl({value:false, disabled:true});


  codigoEleccion: string = '';
  isArchivoResolucion: number;
  actaFCApli= new FormControl({value:"", disabled:true});
  ejemploForm= new FormControl("jaja");
  copiaFCApli= new FormControl({value:"", disabled:true});
  electHabilFCApli= new FormControl({value:0, disabled:true});
  estadoDigitacionFCApli= new FormControl({value:"", disabled:true});
  tipoEleccionFCApli= new FormControl({value:"", disabled:true});
  ubigeoFCApli= new FormControl({value:"", disabled:true});
  localVotacionFCApli= new FormControl({value:"", disabled:true});
  horaEscrutinioFCApli= new FormControl({value:"", disabled:true});
  horaInstalacionFCApli= new FormControl({value:"", disabled:true});
  isSiniestradaExtraviada: boolean = false;
  public usuario: Usuario;
  destroy$: Subject<boolean> = new Subject<boolean>();
  destroyRef:DestroyRef = inject(DestroyRef);
  idResolucionAplicada:number;
  numeroResolucionAplicada:string;
  idActaAplicada:number;
  eleccionFormControlTab2 = new FormControl("0");
  procesoFormControlTab2 = new FormControl("0");
  isDisabled:boolean = true;
  resultadoPrevio:string = Constantes.TEXT_RESULT_PREVIO_SIN_MODIFICAR;
  isVisible:boolean = false;
  actaIdArchivoEscrutinio:string="";
  actaIdArchivoInstalacionSufragio:string="";
  @ViewChild('idObservacionesJurado') refAreaObs;

  public formGroupSeccionVoto: FormGroup;
  public formGroupSeccionVotoPref: FormGroup;
  times= [];
  isSyncingLeft: boolean = false;
  isSyncingRight: boolean = false;

  private readonly editingInputsRevo: Map<string, boolean> = new Map();
  private readonly editingInputsTotal: Map<string, boolean> = new Map();
  public readonly editingInputsPref: Map<string, boolean> = new Map();
  flagVerResolucion: boolean = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly resolucionService: ResolucionService,
    private readonly generalService : GeneralService,
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef,
    private readonly utilityService:UtilityService,
    private readonly ventanaEmergenteService: VentanaEmergenteService
  ) {
    super();
    this.dataSourceAgrupacionesPoliticas = [];
    this.cantVotosPrefe = 0;
    this.formGroupSeccionVoto = this.formBuilder.group({
      params : this.formBuilder.group({}),
    });

    this.formGroupSeccionVotoPref = this.formBuilder.group({
      params : this.formBuilder.group({}),
    });
  }

  ngOnInit(): void {
    this.usuario = this.authentication();

    this.buscarRandomResolucion();

    this.tipoNulosFC.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.accionPasarAnulos = '0';
      });

  }

  generarFormulariosVotosRevocatoria(disabledInput:boolean){

    this.times= Array.from({length: 5}, (_, index) => index + 1);

    for (let i = 0; i< this.dataSourceAgrupacionesPoliticas.length;i++){
      let data = this.dataSourceAgrupacionesPoliticas[i];
      (this.formGroupSeccionVoto.get("params") as FormGroup).addControl(
        data.idDetActa+'-'+i, new FormControl(
          {value :  data.votos, disabled : disabledInput}),
      )

      if (data.votosOpciones!=null && data.votosOpciones.length>0){
        for (let j = 0; j< data.votosOpciones.length; j++){
          let dataPref = data.votosOpciones[j];
          (this.formGroupSeccionVotoPref.get("params") as FormGroup).addControl(
            dataPref.idDetActaOpcion+'-'+i+'-'+j, new FormControl(
              {value: dataPref.votos,disabled: disabledInput}
            )
          )
        }
      }
    }
  }
  generarFormulariosVotos(disabledInput:boolean){
    this.times= Array.from({length: this.cantVotosPrefe}, (_, index) => index + 1);

    for (let i = 0; i< this.dataSourceAgrupacionesPoliticas.length;i++){
      let data = this.dataSourceAgrupacionesPoliticas[i];
      (this.formGroupSeccionVoto.get("params") as FormGroup).addControl(
        data.idDetActa+'-'+i, new FormControl(
          {value :  data.votos, disabled : disabledInput}),
      )

      if (data.votosPreferenciales!=null && data.votosPreferenciales.length>0){
        for (let j = 0; j< this.cantVotosPrefe; j++){
          let dataPref = data.votosPreferenciales[j];
          (this.formGroupSeccionVotoPref.get("params") as FormGroup).addControl(
            dataPref.idDetActaPreferencial+'-'+i+'-'+j, new FormControl(
              {value: dataPref.votos,disabled: disabledInput}
            )
          )
        }
      }
      else{
        for (let j = 0; j< this.cantVotosPrefe; j++){
          (this.formGroupSeccionVotoPref.get("params") as FormGroup).addControl(
            'sinVotPref'+'-'+i+'-'+j, new FormControl(
              {value: '',disabled: false}
            )
          )
        }
      }
    }
  }

  buscarRandomResolucion(): void {
    this.utilityService.setLoading(true);

    this.resolucionService.getRandomResolucion()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.utilityService.setLoading(false);

          if (!res.data) {
            this.handleNoResoluciones();
            return;
          }

          const element: ResolucionAsociadosRequest = res.data;
          this.numeroResolucionAplicada = element.numeroResolucion;
          if (element.estadoResolucion === Constantes.ESTADO_RESOLUCION_EN_PROCESO) {
            this.procesarAsociadas(element);
          } else {
            this.mensajePopup("Estado de resolución no soportado.", IconPopType.ALERT);
            this.resetResolucionState();
          }
        },
        error: () => {
          this.utilityService.setLoading(false);
          this.mensajePopup("Ocurrió un error para obtener las resoluciones. Vuelva a intentarlo.", IconPopType.ERROR);
        }
      });
  }

  private procesarAsociadas(element: ResolucionAsociadosRequest): void {
    const esActaValida = (acta: ActaBean) => {
      const aceptada = acta.estadoDigitalizacion === Constantes.ESTADO_DIGTAL_1ER_CONTROL_ACEPTADA;
      return (
        acta.estadoActa === Constantes.ESTADO_ACTA_ASOCIADA_A_RESOLUCION ||
        (aceptada && acta.estadoResolucion === Constantes.ESTADO_ACTA_RESOLUCION_ACTA_EXTRAVIADA) ||
        (aceptada && acta.estadoResolucion === Constantes.ESTADO_ACTA_RESOLUCION_ACTA_SINIESTRADA)
      );
    };

    const result = element.actasAsociadas.filter(esActaValida);

    if (result.length === 0) {
      this.mensajePopup("No existen registros de actas.", IconPopType.ALERT);
      this.resetResolucionState();
      return;
    }

    this.prepararActa(element, result[0]);
  }

  private prepararActa(element: ResolucionAsociadosRequest, acta: ActaBean): void {
    this.isVisible = true;
    this.isDisabled = false;
    this.resetearFormControl(this.isDisabled);
    this.idResolucionAplicada = element.id;
    this.idActaAplicada = acta.actaId;
    this.procesoFormControlTab2.setValue(acta.codigoProceso);
    this.eleccionFormControlTab2.setValue(acta.codigoEleccion);
    this.codigoEleccion = acta.codigoEleccion;
    this.isArchivoResolucion = element.idArchivo;
    this.flagVerResolucion = false;
    this.buscarActaAplicarResolucion();
  }

  private handleNoResoluciones(): void {
    this.mensajePopup("No existen registros de resoluciones.", IconPopType.ALERT);
    this.resetResolucionState();
  }


  buscarActaAplicarResolucion() {
    sessionStorage.setItem('loading', 'true');
    this.resolucionService.getInfoById(this.idActaAplicada)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('loading', 'false');

          if (!response.success) {
            this.mensajePopup(response.message, IconPopType.ALERT);
            return;
          }

          // Inicializar controles
          this.tipoNulosFC.setValue("0");
          this.accionPasarAnulos = "0";
          this.enableFormControls();
          this.tipoResolverExtraviadaSiniestradaReconteo = response.data.tipoResolverExtraviadaSiniestrada;

          // Delegar lógica según estado del acta
          this.procesarEstadoActa(response.data);
        },
        error: (e) => {
          sessionStorage.setItem('loading', 'false');
          this.resetResolucionState();
          this.mensajePopup(`Ocurrió un error: ${e.error.message}`, IconPopType.ERROR);
        }
      });
  }

  private procesarEstadoActa(data: any): void {
    const msjExtra = this.getMensajeEstado(data);

    if (this.isExtraviadaSiniestrada(data)) {
      this.procesarExtraviadaSiniestrada(data, msjExtra);
    } else if (data.estadoResolucion === Constantes.ESTADO_ACTA_RESOLUCION_REPROCESAO) {
      this.mensajePopup("El acta fue marcada para reprocesamiento, proceda a resolverla.", IconPopType.CONFIRM);
      this.mostrarInformacionActa(data, false);
    } else {
      this.mostrarInformacionActa(data, false);
    }
  }

  private procesarExtraviadaSiniestrada(data: any, msjExtra: string): void {
    if (data.estadoDigitalizacion === Constantes.ESTADO_DIGTAL_DIGITALIZADA) {
      this.mensajePopup(msjExtra, IconPopType.ALERT);
      this.resetResolucionState();

    } else if (data.estadoDigitalizacion === Constantes.ESTADO_DIGTAL_1ER_CONTROL_ACEPTADA) {
      this.tipoResolverExtraviadaSiniestradaReconteo = Constantes.TEXT_ENCONTRADA;
      this.mostrarInformacionActa(data, false);

    } else if (data.estadoDigitalizacion === Constantes.ESTADO_DIGTAL_PENDIENTE) {
      this.manejarPendiente(data);
    }
  }

  private manejarPendiente(data: any): void {
    const mensaje = this.getMensajePendiente(data);

    this.dialog.open(DialogoConfirmacionExtsinComponent, { data: mensaje })
      .afterClosed()
      .subscribe((respuesta: string) => {
        if (respuesta === Constantes.TEXT_ENCONTRADA) {
          if (data.estadoDigitalizacion !== Constantes.ESTADO_DIGTAL_1ER_CONTROL_ACEPTADA) {
            this.resetResolucionState();
            this.mensajePopup(
              `El acta ${data.mesa}-${data.eleccion} marcada como encontrada, debe digitalizarse y pasar por control de digitalización.`,
              IconPopType.ALERT
            );
            return;
          }
          this.tipoResolverExtraviadaSiniestradaReconteo = respuesta;
          this.mostrarInformacionActa(data, false);

        } else if (respuesta === Constantes.TEXT_ANULADA) {
          this.tipoNulosFC.setValue("1");
          this.disableFormControls();
          this.tipoResolverExtraviadaSiniestradaReconteo = respuesta;
          this.mostrarInformacionActa(data, true);
          this.mensajePopup("Proceda a anular el acta, presione PASAR A NULOS.", IconPopType.CONFIRM);

        } else if(respuesta === Constantes.TEXT_RECONTEO){
          this.tipoResolverExtraviadaSiniestradaReconteo = respuesta;
          this.mostrarInformacionActa(data, false);
        } else {
          this.resetResolucionState();
        }
      });
  }

  private isExtraviadaSiniestrada(data: any): boolean {
    return data.estadoResolucion === Constantes.ESTADO_ACTA_RESOLUCION_ACTA_EXTRAVIADA ||
      data.estadoResolucion === Constantes.ESTADO_ACTA_RESOLUCION_ACTA_SINIESTRADA;
  }

  private getMensajeEstado(data: any): string {
    let estado = "extraviada";
    if (data.estadoResolucion === Constantes.ESTADO_ACTA_RESOLUCION_ACTA_SINIESTRADA) {
      estado = "siniestrada";
    }

    if (data.estadoComputo === Constantes.ESTADO_COMPUTO_EN_PROCESO) {
      return `El acta ${data.mesa}-${data.eleccion} ${estado} reprocesada por resolución se encuentra digitalizada. Debe pasar por control de digitalización.`;
    }
    return `El acta ${data.mesa}-${data.eleccion} declara como ${estado}, se encuentra digitalizada. Debe pasar por control de digitalización.`;
  }

  private getMensajePendiente(data: any): string {
    let estado = "extraviada";
    if (data.estadoResolucion === Constantes.ESTADO_ACTA_RESOLUCION_ACTA_SINIESTRADA) {
      estado = "siniestrada";
    }

    if (data.estadoComputo === Constantes.ESTADO_COMPUTO_EN_PROCESO) {
      return `La mesa ${data.mesa}-${data.eleccion} ${estado} reprocesada por resolución, para resolverla, seleccione una opción.`;
    }
    return `La mesa ${data.mesa}-${data.eleccion} fue declarada como ${estado}, para resolverla, seleccione una opción.`;
  }


  private resetResolucionState(): void {
    this.isVisible = false;
    this.numeroResolucionAplicada = "";
    this.isArchivoResolucion = null;
    this.flagVerResolucion = false;
    this.actaIdArchivoEscrutinio = "";
    this.actaIdArchivoInstalacionSufragio = "";
  }

  private disableFormControls(): void {
    this.tipoNulosFC.disable();
    this.cvasFC.disable();
    this.checkSinDatosFC.disable();
    this.checkSolNulidadFC.disable();
    this.checkIncompletaFC.disable();
    this.checkSinFirmasFC.disable();
  }

  private enableFormControls(): void {
    this.tipoNulosFC.enable();
    this.cvasFC.enable();
    this.checkSinDatosFC.enable();
    this.checkSolNulidadFC.enable();
    this.checkIncompletaFC.enable();
    this.checkSinFirmasFC.enable();
  }

  mostrarInformacionActa(actaBean:ActaBean, disabledInputVotod:boolean){
    this.actaFCApli.setValue(actaBean.mesa);
    this.copiaFCApli.setValue(actaBean.copia);
    this.actaIdArchivoEscrutinio = actaBean.idArchivoEscrutinio;
    this.actaIdArchivoInstalacionSufragio = actaBean.idArchivoInstalacionSufragio;
    this.tipoEleccionFCApli.setValue(actaBean.eleccion);
    this.electHabilFCApli.setValue(actaBean.electoresHabiles);
    this.cvasFC.setValue(actaBean.cvas);
    this.estadoDigitacionFCApli.setValue(actaBean.estadoDigitacion);
    this.ubigeoFCApli.setValue(actaBean.ubigeo);
    this.localVotacionFCApli.setValue(actaBean.localVotacion);
    this.horaEscrutinioFCApli.setValue(actaBean.horaEscrutinio);
    this.horaInstalacionFCApli.setValue(actaBean.horaInstalacion);
    this.checkSinDatosFC.setValue(actaBean.actaSinDatos==Constantes.VALUE_SI)
    if (actaBean.actaSinDatos === Constantes.VALUE_SI) {
      setTimeout(() => {
        this.deshabilitarPorActaSinDatos();
      });
    }
    this.checkSinFirmasFC.setValue(actaBean.actaSinFirma==Constantes.VALUE_SI);
    this.checkSolNulidadFC.setValue(actaBean.solNulidad==Constantes.VALUE_SI);
    if(actaBean.actasIncompletas==Constantes.VALUE_SI || actaBean.cvas == 'N' || actaBean.cvas == ''){
      this.checkIncompletaFC.setValue(true);
      this.checkIncompletaFC.disable();
    }

    this.dataSourceAgrupacionesPoliticas = actaBean.agrupacionesPoliticas;
    this.cantVotosPrefe = actaBean.cantidadColumnas;
    this.isSiniestradaExtraviada = (actaBean.estadoActa== Constantes.ESTADO_ACTA_ASOCIADA_A_RESOLUCION &&
      actaBean.estadoResolucion == Constantes.ESTADO_ACTA_RESOLUCION_ACTA_EXTRAVIADA) ||
      (actaBean.estadoActa== Constantes.ESTADO_ACTA_ASOCIADA_A_RESOLUCION &&
      actaBean.estadoResolucion == Constantes.ESTADO_ACTA_RESOLUCION_ACTA_SINIESTRADA) ;
    if (this.codigoEleccion === Constantes.COD_ELEC_REVOCATORIA){
      this.generarFormulariosVotosRevocatoria(disabledInputVotod);
    }else{
      this.generarFormulariosVotos(disabledInputVotod);
    }
    if(!disabledInputVotod)
      this.horaEscrutinioFCApli.enable();
    else
      this.horaEscrutinioFCApli.disable();
    this.isVisible=true;
  }


  requisitosMinimosParaRegistrar(): boolean {
    if (!this.flagVerResolucion) {
      this.mensajePopup(
        "No ha revisado la imagen de la resolución. Haga clic en \"VER IMAGEN RESOLUCIÓN\" para continuar con el proceso correctamente.",
        IconPopType.ALERT
      );
      return false;
    }

    if (this.horaEscrutinioFCApli.value == '') {
      this.mensajePopup(
        "Ingrese la hora de escrutinio en formato dd-MM-yyyy HH:mm de lo contrario ingrese la letra 'N'",
        IconPopType.ALERT
      );
      return false;
    }

    if (this.horaEscrutinioFCApli.value.toUpperCase() !== 'N' && this.tipoResolverExtraviadaSiniestradaReconteo != Constantes.TEXT_ANULADA) {
      const dateTimeRegex = /^(\d{2})-(\d{2})-(\d{4}) ([01]?\d|2[0-3]):([0-5]\d)$/;
      const result = dateTimeRegex.exec(this.horaEscrutinioFCApli.value);

      if (!result) {
        this.mensajePopup("Para el campo fecha y hora de escrutinio usar el formato: dd-MM-yyyy HH:mm (ej. 12-04-2026 17:00). Si no existe fecha y hora colocar N.", IconPopType.ALERT);
        return false;
      } else {
        const [, dd, MM, yyyy, HH, mm] = result;
        const fecha = new Date(+yyyy, +MM - 1, +dd, +HH, +mm);
        if (
          fecha.getFullYear() !== +yyyy ||
          fecha.getMonth() !== +MM - 1 ||
          fecha.getDate() !== +dd ||
          fecha.getHours() !== +HH ||
          fecha.getMinutes() !== +mm
        ) {
          this.mensajePopup("La fecha u hora no es válida. Ejemplo válido: 12-04-2026 17:00", IconPopType.ALERT);
          return false;
        }
      }
    }

    if (this.resultadoPrevio == 'sinmodificar') {
      this.mensajePopup("Para continuar, primero haga clic en el botón Resultado Previo.",IconPopType.ALERT);
      return false;
    }

    return true;
  }




  registrarAplicacionResolucion(): void {
    if (!this.requisitosMinimosParaRegistrar()) return;

    this.dialog.open(DialogoConfirmacionComponent, {
      data: `¿Está seguro de continuar?`
    }).afterClosed().subscribe({
      next: (confirmado: boolean) => {
        if (!confirmado) return;

        const actaBean = this.buildActaBean();

        this.utilityService.setLoading(true);

        this.resolucionService.aplicarResolucionActa(actaBean)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res) => {
              this.utilityService.setLoading(false);
              if(res.success){

                const aplicarActaBean: AplicarActaBean = res.data;
                this.isDisabled = true;
                this.resetearFormControl(this.isDisabled);

                if (aplicarActaBean.siguiente) {
                  // preparar siguiente acta
                  this.prepareNextActa(aplicarActaBean);
                } else {
                  // no hay más actas
                  this.resetResolucionState();

                  const popMensaje: PopMensajeData = {
                    title: 'Aplicación de Resoluciones',
                    mensaje: res.message,
                    icon: IconPopType.CONFIRM,
                    success: true
                  };

                  this.dialog.open(PopMensajeComponent, { data: popMensaje })
                    .afterClosed()
                    .subscribe({
                      next: (confirmado: boolean) => {
                        if (confirmado) this.buscarRandomResolucion();
                      }
                    });
                }
              }else{
                this.resultadoPrevio  = Constantes.TEXT_RESULT_PREVIO_SIN_MODIFICAR
                this.mensajePopup(res.message, IconPopType.ALERT);
              }
            },
            error: (e) => {
              this.utilityService.setLoading(false);
              this.mensajePopup(this.utilityService.manejarMensajeError(e), IconPopType.ERROR);
            }
          });
      }
    });
  }

  private buildActaBean(): ActaBean {
    const actaBean = new ActaBean();
    actaBean.actaId = this.idActaAplicada;
    actaBean.tipoResolverExtraviadaSiniestrada = this.tipoResolverExtraviadaSiniestradaReconteo;
    actaBean.resolucionId = this.idResolucionAplicada;
    actaBean.cvas = this.cvasFC.value;
    actaBean.codigoEleccion = this.codigoEleccion;
    actaBean.agrupacionesPoliticas = this.dataSourceAgrupacionesPoliticas;
    actaBean.actaSinFirma = this.checkSinFirmasFC.value ? Constantes.VALUE_SI : Constantes.VALUE_NO;
    actaBean.actaSinDatos = this.checkSinDatosFC.value ? Constantes.VALUE_SI : Constantes.VALUE_NO;
    actaBean.actasIncompletas = this.checkIncompletaFC.value ? Constantes.VALUE_SI : Constantes.VALUE_NO;
    actaBean.solNulidad = this.checkSolNulidadFC.value ? Constantes.VALUE_SI : Constantes.VALUE_NO;
    actaBean.observacionesJNE = this.refAreaObs?.nativeElement.value || "";
    actaBean.tipoComboNulos = this.accionPasarAnulos;
    return actaBean;
  }

  private prepareNextActa(aplicarActaBean: AplicarActaBean): void {
    this.isVisible = true;
    this.isDisabled = false;
    this.resetearFormControl(this.isDisabled);

    this.idActaAplicada = aplicarActaBean.actaId;
    this.eleccionFormControlTab2.setValue(aplicarActaBean.codigoEleccion);
    this.codigoEleccion = aplicarActaBean.codigoEleccion;
    this.procesoFormControlTab2.setValue(aplicarActaBean.codigoProceso);
    this.idResolucionAplicada = aplicarActaBean.idResolucion;

    this.buscarActaAplicarResolucion();
  }

  resetearFormControl(isDisabled:boolean){

    if(isDisabled){
      this.actaFCApli.setValue("");
      this.copiaFCApli.setValue("");
      this.idResolucionAplicada = null;
      this.idActaAplicada = null;
      this.tipoEleccionFCApli.setValue("");
      this.electHabilFCApli.setValue(0);
      this.cvasFC.setValue("0");
      this.estadoDigitacionFCApli.setValue("");
      this.ubigeoFCApli.setValue("");
      this.localVotacionFCApli.setValue("");
      this.horaEscrutinioFCApli.setValue("");
      this.horaInstalacionFCApli.setValue("");
      this.checkSinDatosFC.setValue(false);
      this.checkSinFirmasFC.setValue(false);
      this.checkSolNulidadFC.setValue(false);
      this.isSiniestradaExtraviada = false;
      if(this.refAreaObs){
        this.refAreaObs.nativeElement.value="";
        this.refAreaObs.nativeElement.disabled =true;
      }
      this.tipoNulosFC.setValue("");
      this.accionPasarAnulos="0";
      this.checkIncompletaFC.setValue(false);
      this.checkSinDatosFC.disable()
      this.checkSinFirmasFC.disable();
      this.resultadoPrevio=Constantes.TEXT_RESULT_PREVIO_SIN_MODIFICAR;
      this.cvasFC.disable();
      this.checkSolNulidadFC.disable();
      this.checkIncompletaFC.disable();
      this.tipoNulosFC.disable();
      this.dataSourceAgrupacionesPoliticas = [];
      this.cantVotosPrefe = 0;
      this.formGroupSeccionVoto = this.formBuilder.group({
        params : this.formBuilder.group({}),
      });
      this.formGroupSeccionVotoPref = this.formBuilder.group({
        params : this.formBuilder.group({}),
      });
    } else {
      this.checkSinDatosFC.enable();
      this.checkSinFirmasFC.enable();
      this.cvasFC.enable();
      this.checkSolNulidadFC.enable();
      if(this.refAreaObs)
        this.refAreaObs.nativeElement.disabled =false;
      this.checkIncompletaFC.enable();
      this.tipoNulosFC.enable();
      if (this.btnPasarNulos)
        this.btnPasarNulos.nativeElement.disabled = false;
    }
  }


  onClickResultadoPrevio(){
    if (this.tipoNulosFC.value !== '0' &&
      this.tipoNulosFC.value !== '' &&
      this.accionPasarAnulos === '0') {
      this.mensajePopup(
        'Debe pasar a nulos la opción seleccionada antes de continuar.',
        IconPopType.ALERT
      );
      return;
    }

    let listObservaciones:string[]=[];
    //verificar si tiene algún voto impugnado
    if(this.cvasFC.value == Constantes.VALUE_ILEGIBLE) {
      listObservaciones.push("El total de ciudadanos que votaron se encuentra Ilegible");
    }

    if(this.cvasFC.value == Constantes.CVAS_SIN_DATOS) {
      listObservaciones.push("Acta sin datos, el total de ciudadanos que votaron es N");
    }


    if (this.codigoEleccion != Constantes.COD_ELEC_REVOCATORIA){
      let LISTA_AGRUPOL_TEMPORAL:AgrupolBean[] = this.dataSourceAgrupacionesPoliticas.filter(e=>e.votos!="null");

      const caso9:AgrupolBean = LISTA_AGRUPOL_TEMPORAL.find(e=>e.votos==Constantes.VALUE_ILEGIBLE);
      if(caso9) {
        this.mensajePopup("Existe Ilegibilidad en la Votación de una Organización Política: "+caso9.nombreAgrupacionPolitica,IconPopType.ALERT);
        this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
        return;
      }

      if(Number(this.cvasFC.value)>this.electHabilFCApli.value) {
        this.mensajePopup("Ciudadanos que votaron en el acta de sufragio mayor que Electores Hábiles.",IconPopType.ALERT);
        this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
        return;
      }

      const agrupacionImpugnado:AgrupolBean = LISTA_AGRUPOL_TEMPORAL.find(e=>e.idAgrupol==Constantes.CODI_VOTOS_IMPUGNADOS)
      if(agrupacionImpugnado) {
        if(Number(agrupacionImpugnado.votos)>0){
          this.mensajePopup("Acta con votos impugnados.",IconPopType.ALERT);
          this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
          return;
        }
      }

      const sumaVotos = LISTA_AGRUPOL_TEMPORAL.reduce((acumula, current) => acumula + Number(current.votos), 0);
      if(sumaVotos > this.electHabilFCApli.value ) {
        this.mensajePopup("Total de Votos es mayor Electores Hábiles",IconPopType.ALERT);
        this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
        return;
      }

      const caso4:AgrupolBean = LISTA_AGRUPOL_TEMPORAL.find(e=>Number(e.votos)>this.electHabilFCApli.value)
      if(caso4 ) {
        this.mensajePopup("Votos para una agrupación política, mayor que los Electores Hábiles.",IconPopType.ALERT);
        this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
        return;
      }

      if(Number(this.cvasFC.value)>sumaVotos && Number(this.cvasFC.value) < this.electHabilFCApli.value && sumaVotos < this.electHabilFCApli.value) {
        this.mensajePopup("Ciudadanos que votaron en el acta de sufragio mayor que Total de Votos, y ambos menores que Electores Hábiles.",IconPopType.ALERT);
        this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
        return;
      }

      if(Number(this.cvasFC.value)<sumaVotos &&Number(this.cvasFC.value) < this.electHabilFCApli.value && sumaVotos < this.electHabilFCApli.value) {
        this.mensajePopup("Ciudadanos que votaron en el acta de sufragio menor que Total de Votos, y ambos menores que Electores Hábiles.",IconPopType.ALERT);
        this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
        return;
      }

      if(Number(this.cvasFC.value)!=sumaVotos ) {
        this.mensajePopup("El total de ciudadanos que votaron no coincide con la suma de votos.",IconPopType.ALERT);
        this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
        return;
      }

      const caso7:AgrupolBean = LISTA_AGRUPOL_TEMPORAL.find(e=>Number(e.votos)>Number(this.cvasFC.value))
      if(caso7 ) {
        this.mensajePopup("Votación consignada a favor de una determinada organización política es mayor que el total de Ciudadanos que votaron.",IconPopType.ALERT);
        this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
        return;
      }



      //PARA VOTOS PREFERENCIALES

      //Ilegibilidad en la Votación Preferencial de un candidato.  -  N
      let i = 0;
      let j = 0;
      for(let agrupol of LISTA_AGRUPOL_TEMPORAL) {
        if(agrupol.votosPreferenciales!=null) {
          for(let votoPreferencial of agrupol.votosPreferenciales){
            if(j>=this.cantVotosPrefe){break;}//validacion para saltar si trae mas vp que cantVotosPref
            if(votoPreferencial.votos==Constantes.VALUE_ILEGIBLE) {
              this.mensajePopup("Ilegibilidad en la Votación Preferencial de un candidato.   " +
                "( Agrupación Pólitica:"+agrupol.nombreAgrupacionPolitica+", Lista: "+votoPreferencial.lista +" )",IconPopType.ALERT);
              this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
              return;
            }
            j++
          }
        }
        i++;
        j=0;
      }


      //Votación Preferencial de un candidato es mayor que cantidad de votos de su organización política. -  G
      for(let agrupol of LISTA_AGRUPOL_TEMPORAL){
        if(agrupol.votosPreferenciales!=null){
          let votoAgrupol = agrupol.votos==''?'0':agrupol.votos;
          for(let votoPreferencial of agrupol.votosPreferenciales){
            if(Number(votoPreferencial.votos==''?'0':votoPreferencial.votos)>Number(votoAgrupol)){
              this.mensajePopup("Votación Preferencial de un candidato es mayor que cantidad de votos de su organización política.  " +
                "( Agrupación Pólitica:"+agrupol.nombreAgrupacionPolitica+", Lista: "+votoPreferencial.lista +" )",IconPopType.ALERT);
              this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
              return;
            }
          }
        }
      }


      //Votación Preferencial de un candidato es mayor al Total de votos de las organizaciones políticas - J
      for(let agrupol of LISTA_AGRUPOL_TEMPORAL){
        if(agrupol.votosPreferenciales!=null){
          for(let votoPreferencial of agrupol.votosPreferenciales){
            if(Number(votoPreferencial.votos==''?'0':votoPreferencial.votos)>sumaVotos){
              this.mensajePopup("Votación Preferencial de un candidato es mayor al Total de votos de las organizaciones políticas.   " +
                "( Agrupación Pólitica:"+agrupol.nombreAgrupacionPolitica+", Lista: "+votoPreferencial.lista +" )",IconPopType.ALERT);
              this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
              return;
            }
          }
        }
      }


      //Votación Preferencial de un candidato es mayor al Total de Ciudadanos que votaron. -  H
      for(let agrupol of LISTA_AGRUPOL_TEMPORAL){
        if(agrupol.votosPreferenciales!=null){
          for(let votoPreferencial of agrupol.votosPreferenciales) {
            if(Number(votoPreferencial.votos==''?'0':votoPreferencial.votos)>Number(this.cvasFC.value)){
              this.mensajePopup("Votación Preferencial de un candidato es mayor al Total de Ciudadanos que votaron.    " +
                "( Agrupación Pólitica:"+agrupol.nombreAgrupacionPolitica+", Lista: "+votoPreferencial.lista +" )",IconPopType.ALERT);
              this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
              return;
            }
          }
        }
      }

      //Votación Preferencial de un candidato es mayor al Total de Electores Hábiles.  -  I
      for(let agrupol of LISTA_AGRUPOL_TEMPORAL) {
        if(agrupol.votosPreferenciales!=null){
          for(let votoPreferencial of agrupol.votosPreferenciales){
            if(Number(votoPreferencial.votos==''?'0':votoPreferencial.votos)>Number(this.electHabilFCApli.value)){
              this.mensajePopup("Votación Preferencial de un candidato es mayor al Total de Electores Hábiles.    " +
                "( Agrupación Pólitica:"+agrupol.nombreAgrupacionPolitica+", Lista: "+votoPreferencial.lista +" )",IconPopType.ALERT);
              this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
              return;
            }
          }
        }
      }


      //Suma total de votos Preferenciales Congresal de los candidatos de una organización política es mayor al doble de la votación de la misma organización política. - K
      for(let agrupol of LISTA_AGRUPOL_TEMPORAL) {
        if(agrupol.votosPreferenciales!=null){
          let votoAgrupol = agrupol.votos==''?'0':agrupol.votos;

          let votopacumulado:number = 0;

          for(let votoPreferencial of agrupol.votosPreferenciales){
            votopacumulado= votopacumulado+ Number(votoPreferencial.votos==''?'0':votoPreferencial.votos);
          }

          if ( votopacumulado > 2 * Number(votoAgrupol)) {
            this.mensajePopup("Suma total de votos Preferenciales de "+this.tipoEleccionFCApli.value+", de los candidatos de una organización política es mayor al doble de la votación de la misma organización política.  " +
              "( Agrupación Pólitica:"+agrupol.nombreAgrupacionPolitica+" )",IconPopType.ALERT);
            this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
            return;
          }
        }
      }

      //Suma Total de Votos Preferenciales de los candidatos de una organización
      // política es mayor a la votación de la misma organización política  M solo para senado multiple

      if(this.codigoEleccion == Constantes.COD_ELEC_SENADO_MULTIPLE){
        for(let agrupol of LISTA_AGRUPOL_TEMPORAL) {
          if(agrupol.votosPreferenciales!=null){
            let votoAgrupol = agrupol.votos==''?'0':agrupol.votos;

            let votopacumulado:number = 0;

            for(let votoPreferencial of agrupol.votosPreferenciales){
              votopacumulado= votopacumulado+ Number(votoPreferencial.votos==''?'0':votoPreferencial.votos);
            }

            if ( votopacumulado > Number(votoAgrupol)) {
              this.mensajePopup("Suma total de votos Preferenciales de "+this.tipoEleccionFCApli.value+", de los candidatos de una organización política es mayor a la votación de la misma organización política.  " +
                "( Agrupación Pólitica:"+agrupol.nombreAgrupacionPolitica+" )",IconPopType.ALERT);
              this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
              return;
            }
          }
        }
      }

    }else{
      //para revotatoria

      let LISTA_AGRUPOL_TEMPORAL:AgrupolBean[] = this.dataSourceAgrupacionesPoliticas.filter(e=>
        e.votosOpciones.some(vo => vo.votos!=='null')
      );


      //ilegibilidad en una votacion consignada de una determinada autoridad
      const caso9:AgrupolBean = LISTA_AGRUPOL_TEMPORAL.find(e=>
        e.votosOpciones.some(vo => vo.votos == Constantes.VALUE_ILEGIBLE)
      );
      if(caso9) {
        listObservaciones.push("Existe Ilegibilidad en la autoridad en consulta: "+caso9.nombreAgrupacionPolitica);
      }

      //error A
      if(Number(this.cvasFC.value)>this.electHabilFCApli.value) {
        listObservaciones.push("Ciudadanos que votaron en el acta de sufragio mayor que Electores Hábiles.");
      }

      // votos impugnados
      const agrupacionImpugnado:AgrupolBean = LISTA_AGRUPOL_TEMPORAL.find(e=>
        e.votosOpciones.some(vo => vo.posicion == Constantes.CODI_VOTOS_IMPUGNADOS && Number(vo.votos) > 0)
      );
      if(agrupacionImpugnado) {
        listObservaciones.push("Acta con votos impugnados.");
      }


      const calculoPorAgrupacion = LISTA_AGRUPOL_TEMPORAL.map(agrupacion => {

        const parseVotos = (valor) => {
          if (valor === '' || valor === '#'){
            return 0;
          }
          const numero = parseInt(valor);
          return isNaN(numero)? 0 : numero;
        }

        const encontrarVoto = (posicion) => {
          const voto = agrupacion.votosOpciones.find(opcion => opcion.posicion == posicion);
          return {
            original: voto ? voto.votos : '',
            numerico: voto ? parseVotos(voto.votos) : 0
          };
        };

        const votoBlanco = encontrarVoto(Constantes.CODI_VOTOS_BLANCOS);
        const votoNulo = encontrarVoto(Constantes.CODI_VOTOS_NULOS);
        const votoImpugnado = encontrarVoto(Constantes.CODI_VOTOS_IMPUGNADOS);

        const totalVotos = agrupacion.votosOpciones.reduce((suma, opcion) => {
          return suma + parseVotos(opcion.votos);
        },0);

        const totalVotosEspeciales = votoBlanco.numerico + votoNulo.numerico + votoImpugnado.numerico;


        return {
          nombreAgrupacionPolitica: agrupacion.nombreAgrupacionPolitica,
          idAgrupol: agrupacion.idAgrupol,
          totalVotosOpciones: totalVotos,
          votoNulo: votoNulo.original,
          totalVotosEspeciales: totalVotosEspeciales
        };
      });

      //error B
      calculoPorAgrupacion.forEach(agrupacion => {
        //error b
        if (agrupacion.totalVotosOpciones > this.electHabilFCApli.value){
          listObservaciones.push(
            `El candidato "${agrupacion.nombreAgrupacionPolitica}" tiene ${agrupacion.totalVotosOpciones} votos, lo cual supera el número de electores hábiles.`
          )
        }

        //error Y

        if (this.cvasFC.value !== '' && this.cvasFC.value !== 'N' && agrupacion.totalVotosOpciones < Number(this.cvasFC.value)){
          listObservaciones.push(
            `El total de votos del candidato "${agrupacion.nombreAgrupacionPolitica}" es menor que el Total de Ciudadanos que votaron.`
          )
        }

        //error D
        if(Number(this.cvasFC.value)>agrupacion.totalVotosOpciones && Number(this.cvasFC.value) < this.electHabilFCApli.value && agrupacion.totalVotosOpciones < this.electHabilFCApli.value) {
          listObservaciones.push(
            `El total de votos del candidato "${agrupacion.nombreAgrupacionPolitica}" es menor que el Total de Ciudadanos que votaron y ambas menores al Total de Electores Hábiles.`
          )
        }

        //error E
        if(Number(this.cvasFC.value)<agrupacion.totalVotosOpciones &&Number(this.cvasFC.value) < this.electHabilFCApli.value && agrupacion.totalVotosOpciones < this.electHabilFCApli.value) {
          listObservaciones.push(
            `El total de votos del candidato "${agrupacion.nombreAgrupacionPolitica}" es mayor que el Total de Ciudadanos que votaron y ambas menores al Total de Electores Hábiles.`
          )
        }

        //error V
        if (agrupacion.totalVotosEspeciales > this.electHabilFCApli.value){
          listObservaciones.push(
            `La suma de votos Blanco, Nulos e Impugnados es mayor que los Electores Hábiles`
          )
        }

        //error W
        if (this.cvasFC.value !== '' && this.cvasFC.value !== 'N' && agrupacion.totalVotosEspeciales > Number(this.cvasFC.value)){
          listObservaciones.push(
            `La suma de votos Blanco, Nulos e Impugnados es mayor que los Ciudadanos que votaron`
          )
        }
      })

      //error C
      const caso4:AgrupolBean = LISTA_AGRUPOL_TEMPORAL.find(e=>
        e.votosOpciones.some(vo=>Number(vo.votos)>this.electHabilFCApli.value))
      if(caso4 ) {
        listObservaciones.push("Votación consignada a favor de una determinada autoridad en consulta, mayor que los Electores Hábiles.");
      }

      //error F
      const caso7:AgrupolBean = LISTA_AGRUPOL_TEMPORAL.find(e=>
        e.votosOpciones.some(vo => Number(vo.votos)>Number(this.cvasFC.value))
      )
      if(caso7 ) {
        listObservaciones.push("Votación consignada a favor de una determinada autoridad en consulta es mayor que el total de Ciudadanos que votaron.");
      }

    }



    if(this.checkSolNulidadFC.value ) {
      listObservaciones.push("Opción solicitud de nulidad está seleccionado.");
    }
    if(this.checkIncompletaFC.value) {
      listObservaciones.push("Opción acta incompleta está seleccionado.");
    }
    if(this.checkSinDatosFC.value) {
      listObservaciones.push("Opción acta sin datos está seleccionado.")
    }
    if(this.checkSinFirmasFC.value) {
      listObservaciones.push("Opción acta sin firmas está seleccionado.");
    }


    if (listObservaciones.length>0){

      let popMensaje :PopMensajeDataGenerica<Array<string>>;
      popMensaje = {
        title:"Aplicación de Resolución - Validación",
        mensaje:listObservaciones,
        icon:IconPopType.ALERT,
        success:true
      }
      this.dialog.open(PopMensajeDataGenericaComponent<Array<string>>, {
        data: popMensaje
      })
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
        });
    }else{
      this.bloquearResultadoPrevio();
    }

  }

  bloquear(){
    if(this.refAreaObs)
      this.refAreaObs.nativeElement.disabled =true;
    this.checkSinDatosFC.disable()
    this.checkSinFirmasFC.disable();
    this.cvasFC.disable();
    this.checkSolNulidadFC.disable();
    this.btnPasarNulos.nativeElement.disabled = true;
    this.checkIncompletaFC.disable();
    this.tipoNulosFC.disable();
    this.horaEscrutinioFCApli.disable();
    this.formGroupSeccionVoto.disable();
    if (this.codigoEleccion !== Constantes.COD_ELEC_PRE)
      this.formGroupSeccionVotoPref.disable();
  }

  desbloquear(){
    this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_SIN_MODIFICAR;
    this.checkSinDatosFC.enable();
    this.cvasFC.enable();
    this.checkSinFirmasFC.enable();
    this.btnPasarNulos.nativeElement.disabled = false;
    this.checkSolNulidadFC.enable();
    if(this.refAreaObs) this.refAreaObs.nativeElement.disabled =false;
    this.checkIncompletaFC.enable();
    this.tipoNulosFC.enable();
    this.horaEscrutinioFCApli.enable();
    this.formGroupSeccionVoto.enable();
    if (this.codigoEleccion !== Constantes.COD_ELEC_PRE)
      this.formGroupSeccionVotoPref.enable()
  }

  pasarNulos(){
    if (this.tipoNulosFC.value=== '0'){
      this.mensajePopup("Seleccione una opción para pasar a nulos",IconPopType.ALERT);
      return;
    }

    this.accionPasarAnulos = "1";

    this.dialog.open(DialogoConfirmacionComponent, {
      data: `¿Está seguro de continuar?`
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          let tipoNulos:string = this.tipoNulosFC.value;
          if(tipoNulos == Constantes.TIPO_PASAR_A_NULOS_ELECTORES_HABILES) {
            let i = 0;
            let j = 0;
            for (const e of this.dataSourceAgrupacionesPoliticas) {
              if(e.votos!='null'){
                if (this.codigoEleccion != Constantes.COD_ELEC_REVOCATORIA){
                  e.votos = "0";
                  this.formGroupSeccionVoto.get("params").get(e.idDetActa+"-"+i).setValue("0");

                  if(e.idAgrupol==Constantes.CODI_VOTOS_NULOS){
                    e.votos = this.electHabilFCApli.value.toString();
                    this.formGroupSeccionVoto.get("params").get(e.idDetActa+"-"+i).setValue(this.electHabilFCApli.value.toString());
                  }

                  //para preferenciales
                  if (e.votosPreferenciales && e.votosPreferenciales.length>0){
                    for (const vp of e.votosPreferenciales) {
                      if(j>=this.cantVotosPrefe){break;}//validacion para saltar si trae mas vp que cantVotosPref
                      vp.votos = '0';
                      this.formGroupSeccionVotoPref.get("params").get(vp.idDetActaPreferencial+'-'+i+'-'+j).setValue("0");
                      j++;
                    }
                  }
                }else{
                  //para revocatoria
                  if (e.votosOpciones && e.votosOpciones.length>0){
                    for (const vo of e.votosOpciones) {
                      if(j>=5){break;}//validacion para saltar si trae mas vo que cantVotosPref
                      if (vo.posicion==this.Constantes.CODI_VOTOS_NULOS){
                        vo.votos = this.electHabilFCApli.value.toString();
                        this.formGroupSeccionVotoPref.get("params").get(vo.idDetActaOpcion+'-'+i+'-'+j).setValue(this.electHabilFCApli.value.toString());
                      }else{
                        vo.votos = '0';
                        this.formGroupSeccionVotoPref.get("params").get(vo.idDetActaOpcion+'-'+i+'-'+j).setValue("0");
                      }

                      j++;
                    }
                  }
                }

              }
              i++;
              j = 0;

            }

            this.cvasFC.setValue(this.electHabilFCApli.value.toString());
            this.checkIncompletaFC.setValue(false);
            this.checkSinDatosFC.setValue(false);
            this.checkSinFirmasFC.setValue(false);
            this.checkSolNulidadFC.setValue(false);
            if (this.formGroupSeccionVoto && this.tipoResolverExtraviadaSiniestradaReconteo !== ResolverResolucionType.ANULADA) {
              this.formGroupSeccionVoto.enable();
            }
            if (this.codigoEleccion !== Constantes.COD_ELEC_PRE && this.tipoResolverExtraviadaSiniestradaReconteo !== ResolverResolucionType.ANULADA) {
              this.formGroupSeccionVotoPref.enable();
            }

            if(this.tipoResolverExtraviadaSiniestradaReconteo == Constantes.TEXT_ANULADA)
              this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_NORMAL;

            this.bloquearResultadoPrevio();

          } else if(tipoNulos == Constantes.TIPO_PASAR_A_NULOS_CIUDADANOS_QUE_VOTARON) {

            if(this.cvasFC.value == Constantes.VALUE_ILEGIBLE) {
              this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
              this.mensajePopup("El total de ciudadanos que votaron es ilegible",IconPopType.ALERT);
              return;
            }

            if(this.cvasFC.value == Constantes.CVAS_SIN_DATOS) {
              this.mensajePopup("Acta sin datos, el total de ciudadanos que votaron es N.",IconPopType.ALERT);
              this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
              return;
            }

            let i = 0;
            let j = 0;

            if (this.codigoEleccion != Constantes.COD_ELEC_REVOCATORIA){
              for (const e of this.dataSourceAgrupacionesPoliticas) {
                if (e.votos != 'null') {
                  e.votos = '0';
                  this.formGroupSeccionVoto.get("params").get(e.idDetActa+"-"+i).setValue("0");
                  if (e.idAgrupol == Constantes.CODI_VOTOS_NULOS) {
                    e.votos = this.cvasFC.value.toString();
                    this.formGroupSeccionVoto.get("params").get(e.idDetActa+"-"+i).setValue(this.cvasFC.value.toString());
                  }

                  if (e.votosPreferenciales && e.votosPreferenciales.length > 0) {
                    for (const vp of e.votosPreferenciales) {
                      if(j>=this.cantVotosPrefe){break;}//validacion para saltar si trae mas vp que cantVotosPref
                      vp.votos = '0';
                      this.formGroupSeccionVotoPref.get("params").get(vp.idDetActaPreferencial+'-'+i+'-'+j).setValue("0");
                      j++;
                    }
                  }
                }
                i++;
                j = 0;
              }
            }else{
              //para revocatoria
              for (const e of this.dataSourceAgrupacionesPoliticas) {
                if (e.votosOpciones && e.votosOpciones.length > 0) {
                  for (const vo of e.votosOpciones) {
                    if(j>=5){break;}//validacion para saltar si trae mas vo que cantVotosPref
                    if (vo.votos !=='null'){
                      if (vo.posicion==this.Constantes.CODI_VOTOS_NULOS){
                        vo.votos = this.cvasFC.value.toString();
                        this.formGroupSeccionVotoPref.get("params").get(vo.idDetActaOpcion+'-'+i+'-'+j).setValue(this.cvasFC.value.toString());
                      }else{
                        vo.votos = '0';
                        this.formGroupSeccionVotoPref.get("params").get(vo.idDetActaOpcion+'-'+i+'-'+j).setValue("0");
                      }
                    }
                    j++;
                  }
                }
                i++;
                j = 0;
              }
            }

            this.checkSinDatosFC.setValue(false);
            this.checkIncompletaFC.setValue(false);
            this.checkSinFirmasFC.setValue(false);
            this.checkSolNulidadFC.setValue(false);
            if (this.formGroupSeccionVoto) {
              this.formGroupSeccionVoto.enable();
            }
            if (this.codigoEleccion !== Constantes.COD_ELEC_PRE) {
              this.formGroupSeccionVotoPref.enable();
            }

            if(this.tipoResolverExtraviadaSiniestradaReconteo == Constantes.TEXT_ANULADA)
              this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_NORMAL;

            this.bloquearResultadoPrevio();

          } else if(tipoNulos == Constantes.TIPO_PASAR_A_NULOS_SUMA_DE_VOTOS){

            if (this.codigoEleccion != Constantes.COD_ELEC_REVOCATORIA) {
              const caso9:AgrupolBean = this.dataSourceAgrupacionesPoliticas.find(e=>e.votos==Constantes.VALUE_ILEGIBLE);

              if(caso9) {
                this.mensajePopup("La organización Política: "+caso9.nombreAgrupacionPolitica + " presenta ilegibilidad.",IconPopType.ALERT);
                this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
                return;
              }
              const sumaVotos = this.dataSourceAgrupacionesPoliticas.reduce((acumula, current) =>
                acumula + Number(current.votos=='null'?'0':current.votos), 0);

              let i = 0;
              let j = 0;

              for (const e of this.dataSourceAgrupacionesPoliticas) {
                if (e.votos != 'null') {
                  e.votos = '0';
                  this.formGroupSeccionVoto.get("params").get(e.idDetActa+"-"+i).setValue("0");
                  if (e.idAgrupol == Constantes.CODI_VOTOS_NULOS) {
                    e.votos = sumaVotos.toString();
                    this.formGroupSeccionVoto.get("params").get(e.idDetActa+"-"+i).setValue(sumaVotos.toString());
                  }

                  if (e.votosPreferenciales && e.votosPreferenciales.length > 0) {
                    for (const vp of e.votosPreferenciales) {
                      if(j>=this.cantVotosPrefe){break;}//validacion para saltar si trae mas vp que cantVotosPref
                      vp.votos = '0';
                      this.formGroupSeccionVotoPref.get("params").get(vp.idDetActaPreferencial+'-'+i+'-'+j).setValue("0");
                      j++;
                    }
                  }
                }
                i++;
                j = 0;
              }
              this.cvasFC.setValue(sumaVotos.toString());
            } else {
              //para revocatoria

              if(this.cvasFC.value == Constantes.VALUE_ILEGIBLE) {
                this.mensajePopup("El total de ciudadanos que votaron es ilegible.",IconPopType.ALERT);
                this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
                return;
              }

              if(this.cvasFC.value == Constantes.CVAS_SIN_DATOS) {
                this.mensajePopup("Acta sin datos, el total de ciudadanos que votaron es N.",IconPopType.ALERT);
                this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_OBSERVADA;
                return;
              }

              let LISTA_AGRUPOL_TEMPORAL:AgrupolBean[] = this.dataSourceAgrupacionesPoliticas.filter(e=>
                e.votosOpciones.some(vo => vo.votos!=='null')
              );

              const caso9:AgrupolBean = LISTA_AGRUPOL_TEMPORAL.find(e=>e.votosOpciones.find(vo=>vo.votos==Constantes.VALUE_ILEGIBLE));
              if(caso9){
                this.mensajePopup("La autoridad en consulta: "+caso9.nombreAgrupacionPolitica + " presenta ilegibilidad.",IconPopType.ALERT);
                return;
              }

              const calculoPorAgrupacion = LISTA_AGRUPOL_TEMPORAL.map(agrupacion => {
                const parseVotos = (valor) => {
                  if (valor === '' || valor === '#'){
                    return 0;
                  }
                  const numero = parseInt(valor);
                  return isNaN(numero)? 0 : numero;
                }

                const encontrarVoto = (posicion) => {
                  const voto = agrupacion.votosOpciones.find(opcion => opcion.posicion == posicion);
                  return {
                    original: voto ? voto.votos : '',
                    numerico: voto ? parseVotos(voto.votos) : 0
                  };
                };

                const votoBlanco = encontrarVoto(Constantes.CODI_VOTOS_BLANCOS);
                const votoNulo = encontrarVoto(Constantes.CODI_VOTOS_NULOS);
                const votoImpugnado = encontrarVoto(Constantes.CODI_VOTOS_IMPUGNADOS);

                const totalVotos = agrupacion.votosOpciones.reduce((suma, opcion) => {
                  return suma + parseVotos(opcion.votos);
                },0);

                const totalVotosEspeciales = votoBlanco.numerico + votoNulo.numerico + votoImpugnado.numerico;


                return {
                  nombreAgrupacionPolitica: agrupacion.nombreAgrupacionPolitica,
                  idAgrupol: agrupacion.idAgrupol,
                  totalVotosOpciones: totalVotos,
                  votoNulo: votoNulo.original,
                  totalVotosEspeciales: totalVotosEspeciales
                };
              });

              let votosTotalesIguales = true;
              let primerVotoTotal = calculoPorAgrupacion.length > 0 ? calculoPorAgrupacion[0].totalVotosOpciones : 0;

              for (let i = 1;i < calculoPorAgrupacion.length; i++){
                if (calculoPorAgrupacion[i].totalVotosOpciones !== primerVotoTotal){
                  votosTotalesIguales = false;
                  break;
                }
              }
              if (!votosTotalesIguales){
                let i = 0;
                let j = 0;
                for (const e of this.dataSourceAgrupacionesPoliticas) {
                  if (e.votosOpciones && e.votosOpciones.length > 0) {
                    for (const vo of e.votosOpciones) {
                      if(j>=5){break;}//validacion para saltar si trae mas vo que cantVotosPref
                      if (vo.votos !=='null'){
                        if (vo.posicion==this.Constantes.CODI_VOTOS_NULOS){
                          vo.votos = this.cvasFC.value.toString();
                          this.formGroupSeccionVotoPref.get("params").get(vo.idDetActaOpcion+'-'+i+'-'+j).setValue(this.cvasFC.value.toString());
                        }else{
                          vo.votos = '0';
                          this.formGroupSeccionVotoPref.get("params").get(vo.idDetActaOpcion+'-'+i+'-'+j).setValue("0");
                        }
                      }
                      j++;
                    }
                  }
                  i++;
                  j = 0;
                }
              }else{
                this.cvasFC.setValue(primerVotoTotal.toString());
                let i = 0;
                let j = 0;
                for (const e of this.dataSourceAgrupacionesPoliticas) {
                  if (e.votosOpciones && e.votosOpciones.length > 0) {
                    for (const vo of e.votosOpciones) {
                      if(j>=5){break;}//validacion para saltar si trae mas vo que cantVotosPref
                      if (vo.votos !=='null'){
                        if (vo.posicion==this.Constantes.CODI_VOTOS_NULOS){
                          vo.votos = this.cvasFC.value.toString();
                          this.formGroupSeccionVotoPref.get("params").get(vo.idDetActaOpcion+'-'+i+'-'+j).setValue(this.cvasFC.value.toString());
                        }else{
                          vo.votos = '0';
                          this.formGroupSeccionVotoPref.get("params").get(vo.idDetActaOpcion+'-'+i+'-'+j).setValue("0");
                        }
                      }
                      j++;
                    }
                  }
                  i++;
                  j = 0;
                }
              }
            }

            this.checkSinDatosFC.setValue(false);
            this.checkIncompletaFC.setValue(false);
            this.checkSinFirmasFC.setValue(false);
            this.checkSolNulidadFC.setValue(false);
            if (this.formGroupSeccionVoto) {
              this.formGroupSeccionVoto.enable();
            }
            if (this.codigoEleccion !== Constantes.COD_ELEC_PRE) {
              this.formGroupSeccionVotoPref.enable();
            }

            if(this.tipoResolverExtraviadaSiniestradaReconteo == Constantes.TEXT_ANULADA)
              this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_NORMAL;

            this.bloquearResultadoPrevio();

          }else{
            this.mensajePopup("Seleccione un item para pasar a Nulos.",IconPopType.ALERT)
          }
        }
      });
  }

  verImagenActa() {
    this.utilityService.abrirModalActaPorId(
      this.idActaAplicada,
      this.titlePopupMensaje,
      this.destroyRef
    );
  }

  bloquearResultadoPrevio(){
    this.resultadoPrevio = Constantes.TEXT_RESULT_PREVIO_NORMAL;
    this.bloquear();
  }

  verImagenResolucion(){
    this.utilityService.setLoading(true);
    this.resolucionService.generarResolucionPopup(this.isArchivoResolucion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.utilityService.setLoading(false);
          if(!response?.success){
            this.utilityService.mensajePopup(this.titlePopupMensaje, response?.message, IconPopType.ALERT);
            return;
          }
          if (!response.data) {
            this.utilityService.mensajePopup(this.titlePopupMensaje, 'No se encontró el archivo PDF para la resolución solicitada', IconPopType.ALERT);
            return;
          }

          this.flagVerResolucion = true;
          const pdfBlob = Utility.base64toBlob(response.data, 'application/pdf');
          this.utilityService.mostrarModalPdfMovible(pdfBlob).subscribe();
        },
        error: (err) => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(this.titlePopupMensaje, "Error al obtener la resolución", IconPopType.ERROR);
        }
      });
  }


  verActasAsociadas() {
    this.utilityService.setLoading(true);

    this.resolucionService.getResolucion(this.idResolucionAplicada)
      .pipe(
        finalize(() => this.utilityService.setLoading(false)) // siempre se ejecuta
      )
      .subscribe({
        next: (res) => {
          this.dialog.open(PopListActasAsocComponent, {
            width: '40%',
            maxWidth: '1080px',
            data: { resolucion: res.data }
          });
        },
        error: (error) => {
          this.mensajePopup(this.utilityService.manejarMensajeError(error), IconPopType.ALERT);
        }
      });
  }


  openModal(): void {
    const dialogRef = this.dialog.open(ModalResolucionComponent, {
      backdropClass: 'modalBackdrop',
      panelClass: 'modalPanel',
      width: '490px',
      autoFocus: false,
      maxHeight: '90vh',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El modal se cerró');
    });
  }

  evitarEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }





  mensajePopup(mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:this.titlePopupMensaje,
      mensaje:mensaje,
      icon:icon,
      success:true
    }
    this.dialog.open(PopMensajeComponent, {
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          //aceptar
        }
      });
  }

  // Método para validar la entrada según nuestras reglas (similar a sceNumerosHash)
  private validateInput(value: string): string {
    if (value === '#' || value.toLowerCase() === 'i') return '#';

    const digits = value.replace(/\D/g, '');
    return digits.substring(0,3);

  }

  onInputVotoRevocatoria(fileId: number, i: number, j: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const validado = this.validateInput(value);

    if (value !== validado) {
      const controlName = `${fileId}-${i}-${j}`;
      const control = this.formGroupSeccionVotoPref.get('params')?.get(controlName);
      control?.setValue(validado);

      // Reestablecer el cursor al final para evitar "brinco" visual
      setTimeout(() => {
        input.setSelectionRange(validado.length, validado.length);
      });
    }
  }

  changeVotoRevocatoria(fileId:number,i:number,j:number){
    const controlName = `${fileId}-${i}-${j}`;

    const control = this.formGroupSeccionVotoPref.get("params")?.get(controlName);
    let value = (control?.value || '').toString()

    //solo permitir digitos o un solo #
    const validado = this.validateInput(value);
    if (value !== validado){
      control?.setValue(validado);
      value = validado;
    }

    if (value == ''){
      this.dataSourceAgrupacionesPoliticas[i].votosOpciones[j].votos='0';

    }else{
      this.dataSourceAgrupacionesPoliticas[i].votosOpciones[j].votos=value;
    }

  }

  isEditingModeRevo(i: number, j: number): boolean {
    const key = `${i}-${j}`;
    return this.editingInputsRevo.get(key) || false;
  }
// Evento onDoubleClick - activar modo edición y seleccionar
  onDoubleClickRevocatoria(event: MouseEvent): void {
    const input = event.target as HTMLInputElement;
    const rowIndex = this.getIndexFromIdRevo(input.id, 'i');
    const colIndex = this.getIndexFromIdRevo(input.id, 'j');
    const voto =this.dataSourceAgrupacionesPoliticas[rowIndex] .votosOpciones[colIndex];
    if (voto && voto.idDetActaOpcion == null) {
      return;
    }

    if (rowIndex !== -1 && colIndex !== -1) {
      // Activar modo edición
      this.setEditingModeRevo(rowIndex, colIndex, true);

      // Seleccionar
      setTimeout(() => {
        input.select();
      }, 0);
    }
  }

  onBlurRevocatoria(): void {
    // Al perder foco, salimos del modo edición para todos
    this.editingInputsRevo.clear();
    this.cdr.detectChanges();
  }

  onFocusRevocatoria(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const rowIndex = this.getIndexFromIdRevo(input.id, 'i');
    const colIndex = this.getIndexFromIdRevo(input.id, 'j');

    if (rowIndex !== -1 && colIndex !== -1) {
      // Al recibir foco, no entramos en modo edición
      this.setEditingModeRevo(rowIndex, colIndex, false);

      // Evitar selección de texto
      setTimeout(() => {
        input.setSelectionRange(0, 0);
      }, 0);

    }
  }

  setEditingModeRevo(i: number, j: number, isEditing: boolean): void {
    const key = `${i}-${j}`;
    this.editingInputsRevo.set(key, isEditing);
    this.cdr.detectChanges(); // Forzar actualización de la UI
  }

  // Método auxiliar para extraer índices del id del elemento
  private getIndexFromIdRevo(id: string, indexType: 'i' | 'j'): number {
    const regex = /mat-input-pref-(\d+)-(\d+)/;
    const match = regex.exec(id);
    if (match) {
      return indexType === 'i' ? parseInt(match[1], 10) : parseInt(match[2], 10);
    }
    return -1;
  }

  changeVoto(fileId:string,preferencial: boolean,i:number,j ?:number){
    if (preferencial){
      let userValueCtrl = this.formGroupSeccionVotoPref.get("params").get(fileId+"-"+i+"-"+j).value;
      if (userValueCtrl==''){
        this.dataSourceAgrupacionesPoliticas[i].votosPreferenciales[j].votos='0';

      }else{
        this.dataSourceAgrupacionesPoliticas[i].votosPreferenciales[j].votos=userValueCtrl;
      }
    }else{
      let userValueCtrl = this.formGroupSeccionVoto.get("params").get(fileId+"-"+i).value;
      if (userValueCtrl==''){
        this.dataSourceAgrupacionesPoliticas[i].votos = '0';
      }else{
        this.dataSourceAgrupacionesPoliticas[i].votos = userValueCtrl;
      }
    }

  }

  changeCvas(){
    if(this.cvasFC.value == '' || this.cvasFC.value == 'N'){
      this.checkIncompletaFC.setValue(true);
      this.checkIncompletaFC.disable();
    }else{
      this.checkIncompletaFC.setValue(false);
      this.checkIncompletaFC.enable();
    }
  }

  setearTablaANulos(){
    let i = 0;
    let j = 0;
    for (const agruPol of this.dataSourceAgrupacionesPoliticas) {
      if (agruPol.votos !== 'null'){
        agruPol.votos = '0';
        this.formGroupSeccionVoto.get("params").get(agruPol.idDetActa+'-'+i).setValue("0");
      }

      if (agruPol.votosPreferenciales && agruPol.votosPreferenciales.length > 0) {
        for (const votPref of agruPol.votosPreferenciales) {
          if (votPref.votos !=='null'){
            votPref.votos = '0';
            this.formGroupSeccionVotoPref.get("params").get(votPref.idDetActaPreferencial+'-'+i+'-'+j).setValue("0");
          }
          j++;
        }
      }
      i++;
      j = 0;
    }
  }

  deshabilitarPorActaSinDatos(): void {

    if (this.formGroupSeccionVoto) {
      this.formGroupSeccionVoto.disable();
    }
    if (this.codigoEleccion !== Constantes.COD_ELEC_PRE) {
      this.formGroupSeccionVotoPref.disable();
    }
  }

  changeCheckSinDatos(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    if (isChecked) {
      this.utilityService.popupConfirmacion(
        event,
        'Usted eligió registrar el acta Sin Datos, se limpiarán los campos. ¿Está seguro de continuar?',
        (confirmado: boolean) => confirmado ? this.aplicarSinDatos() : this.cancelarSinDatos()
      );
    } else {
      this.reiniciarCamposSinDatos();
    }
  }

  private aplicarSinDatos(): void {
    this.checkSinDatosFC.setValue(true);
    this.setearTablaANulos();
    this.formGroupSeccionVoto.disable();
    if (this.codigoEleccion !== Constantes.COD_ELEC_PRE) {
      this.formGroupSeccionVotoPref.disable();
    }
  }

  private cancelarSinDatos(): void {
    this.checkSinDatosFC.setValue(false);
  }

  private reiniciarCamposSinDatos(): void {
    this.checkSinDatosFC.setValue(false);
    this.formGroupSeccionVoto.enable();
    if (this.codigoEleccion !== Constantes.COD_ELEC_PRE) {
      this.formGroupSeccionVotoPref.enable();
    }
  }

  changeCheckIncompleta(event: Event){
    const isChecked = (event.target as HTMLInputElement).checked;;
    if (isChecked){
      this.cvasFC.setValue('N');
      this.checkIncompletaFC.disable();
    }
  }

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

  obtenerTituloCabecera(indice: number): string {
    const titulos = [
      "SI",
      "NO",
      "VOTOS EN BLANCO",
      "VOTOS NULOS",
      "VOTOS IMPUGNADOS"
    ];

    return titulos[indice];
  }

  preventEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  @HostListener('keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (input.readOnly) return;

    // Determinar si es input total o preferencial por el ID
    const isPreferencial = input.id.includes('pref');

    let indices: { rowIndex: number, colIndex?: number } | null = null;
    let controlName: string | null = null;
    let formGroup: FormGroup;

    if (isPreferencial) {
      // Manejar inputs preferenciales
      indices = this.getIndicesFromInputPref(input);
      if (!indices || indices.colIndex === undefined) return;

      controlName = this.getControlName(indices.rowIndex, indices.colIndex);
      formGroup = this.formGroupSeccionVotoPref;
    } else {
      // Manejar inputs totales (código existente)
      indices = this.getIndicesFromInputTotal(input);
      if (!indices) return;

      controlName = this.getControlName(indices.rowIndex);
      formGroup = this.formGroupSeccionVoto;
    }

    if (!controlName) return;

    const control = formGroup.get("params")?.get(controlName);
    if (!control) return;

    const key = event.key;
    const currentVal: string = (control.value ?? '').toString();

    if (key === 'Backspace') {
      this.handleBackspace(event, input, control, indices, currentVal);
      return;
    }

    if (key.length > 1) {
      event.preventDefault();
      return;
    }

    this.handleCharacterInput(event, input, control, indices, currentVal, key);

  }

  handleCharacterInput(
    event: KeyboardEvent,
    input: HTMLInputElement,
    control: any,
    indices: { rowIndex: number, colIndex?: number },
    currentVal: string,
    key: string
  ): void {
    event.preventDefault();

    const char = key.toLowerCase() === 'i' ? '#' : key;
    const wasNotEditing = !this.isEditingMode(indices.rowIndex, indices.colIndex);

    if (wasNotEditing) {
      this.setEditingMode(true, indices.rowIndex, indices.colIndex);
    }

    if (wasNotEditing && this.shouldClearValue(input, currentVal)) {
      control.setValue('');
      currentVal = '';
    }

    if (char === '#') {
      this.handleHashInput(control, input, indices, currentVal);
    } else if (/^\d$/.test(char)) {
      this.handleNumberInput(control, input, indices, currentVal, char);
    }
  }

  shouldClearValue(input: HTMLInputElement, currentVal: string): boolean {
    return currentVal.length > 0 &&
      input.selectionStart === 0 &&
      input.selectionEnd === 0;
  }

  handleHashInput(
    control: any,
    input: HTMLInputElement,
    indices: { rowIndex: number, colIndex?: number },
    currentVal: string
  ): void {
    // No permitir más de un # o # después de números
    if (currentVal === '#' || (currentVal.length > 0 && /^\d+$/.test(currentVal))) {
      return;
    }

    // Insertar # solo si está vacío
    if (currentVal === '') {
      control.setValue('#');

      // Llamar changeVoto con los parámetros correctos
      const isPreferencial = indices.colIndex !== undefined;
      this.changeVoto(
        this.getFileIdFromIndices(indices),
        isPreferencial,
        indices.rowIndex,
        indices.colIndex
      );
      setTimeout(() => input.setSelectionRange(1, 1));
    }
  }

  handleNumberInput(
    control: any,
    input: HTMLInputElement,
    indices: { rowIndex: number, colIndex?: number },
    currentVal: string,
    char: string
  ): void {
    const start = input.selectionStart ?? currentVal.length;
    const end = input.selectionEnd ?? currentVal.length;

    if (start !== end) {
      const newValue = currentVal.slice(0, start) + char + currentVal.slice(end);

      if (newValue.length > 3) return;

      control.setValue(newValue);

      const isPreferencial = indices.colIndex !== undefined;
      this.changeVoto(
        this.getFileIdFromIndices(indices),
        isPreferencial,
        indices.rowIndex,
        indices.colIndex
      );
      setTimeout(() => input.setSelectionRange(start + 1, start + 1));
      return;
    }

    if (currentVal.length >= 3) return;

    const caretPos = start;
    const newValue = currentVal.slice(0, caretPos) + char + currentVal.slice(caretPos);

    control.setValue(newValue);

    const isPreferencial = indices.colIndex !== undefined;
    this.changeVoto(
      this.getFileIdFromIndices(indices),
      isPreferencial,
      indices.rowIndex,
      indices.colIndex
    );
    setTimeout(() => input.setSelectionRange(caretPos + 1, caretPos + 1));
  }

  handleBackspace(
    event: KeyboardEvent,
    input: HTMLInputElement,
    control: any,
    indices: { rowIndex: number, colIndex?: number },
    currentVal: string
  ): void {
    event.preventDefault();

    if (!this.isEditingMode(indices.rowIndex, indices.colIndex)) {
      this.setEditingMode(true, indices.rowIndex, indices.colIndex);
    }

    if (this.isCursorInactive(input)) {
      this.clearInputValue(control, input, indices);
      return;
    }

    if (currentVal.length > 0) {
      this.handleBackspaceWithContent(input, control, indices, currentVal);
      return;
    }

    setTimeout(() => input.setSelectionRange(0, 0));
  }

  handleBackspaceWithContent(
    input: HTMLInputElement,
    control: any,
    indices: { rowIndex: number, colIndex?: number },
    currentVal: string
  ): void {
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    let updated = '';
    let newCaretPosition = start;

    if (start === end && start > 0) {
      // Borrar un caracter hacia la izquierda
      updated = currentVal.slice(0, start - 1) + currentVal.slice(end);
      newCaretPosition = start - 1;
    } else {
      // Borrar selección
      updated = currentVal.slice(0, start) + currentVal.slice(end);
      newCaretPosition = start;
    }

    control.setValue(updated);

    // Llamar changeVoto con los parámetros correctos
    const isPreferencial = indices.colIndex !== undefined;
    this.changeVoto(
      this.getFileIdFromIndices(indices),
      isPreferencial,
      indices.rowIndex,
      indices.colIndex
    );
    setTimeout(() => input.setSelectionRange(newCaretPosition, newCaretPosition));
  }

  isCursorInactive(input: HTMLInputElement): boolean {
    return input.selectionStart === 0 && input.selectionEnd === 0;
  }

  clearInputValue(
    control: any,
    input: HTMLInputElement,
    indices: { rowIndex: number, colIndex?: number }
  ): void {
    control.setValue('');

    // Llamar changeVoto con los parámetros correctos
    const isPreferencial = indices.colIndex !== undefined;
    this.changeVoto(
      this.getFileIdFromIndices(indices),
      isPreferencial,
      indices.rowIndex,
      indices.colIndex
    );
    setTimeout(() => input.setSelectionRange(0, 0));
  }

  getFileIdFromIndices(indices: { rowIndex: number, colIndex?: number }): string {
    if (indices.colIndex !== undefined) {
      // Es preferencial
      return this.dataSourceAgrupacionesPoliticas[indices.rowIndex]?.votosPreferenciales[indices.colIndex]?.idDetActaPreferencial;
    } else {
      // Es total
      return this.dataSourceAgrupacionesPoliticas[indices.rowIndex]?.idDetActa;
    }
  }

  setEditingMode(isEditing: boolean, i: number, j?: number): void {
    if (j !== undefined) {
      const key = `${i}-${j}`;
      this.editingInputsPref.set(key, isEditing);
    } else {
      const key = `${i}`;
      this.editingInputsTotal.set(key, isEditing);
    }
    this.cdr.detectChanges();
  }



  getIndicesFromInputPref(input: HTMLInputElement): { rowIndex: number, colIndex: number } | null {
    const regex = /mat-input-pref-(\d+)-(\d+)/;
    const match = regex.exec(input.id);

    if (match) {
      return {
        rowIndex: parseInt(match[1], 10),
        colIndex: parseInt(match[2], 10)
      };
    }

    return null;
  }

  getIndicesFromInputTotal(input: HTMLInputElement): { rowIndex: number } | null {
    const rowIndex = this.getIndexFromId(input.id);

    if (rowIndex === -1) {
      return null;
    }

    return { rowIndex };
  }

  getIndexFromId(id: string): number {
    if (id.includes('pref')) {
      // Para inputs preferenciales: mat-input-pref-i-j
      const regex = /mat-input-pref-(\d+)-(\d+)/;
      const match = regex.exec(id);
      return match ? parseInt(match[1], 10) : -1;
    } else {
      // Para inputs totales: mat-input-total-i
      const regex = /mat-input-total-(\d+)/;
      const match = regex.exec(id);
      return match ? parseInt(match[1], 10) : -1;
    }
  }



  getControlName(rowIndex: number, colIndex?: number): string {
    console.log(this.formGroupSeccionVoto)
    if (colIndex !== undefined) {
      // Es preferencial
      const fileId = this.dataSourceAgrupacionesPoliticas[rowIndex]?.votosPreferenciales[colIndex]?.idDetActaPreferencial;
      return `${fileId}-${rowIndex}-${colIndex}`;
    } else {
      // Es total
      const fileId = this.dataSourceAgrupacionesPoliticas[rowIndex].idDetActa;
      return `${fileId}-${rowIndex}`;
    }
  }

  onInputVoto(fileId: string, i: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const validado = this.validateInput(value);

    if (value !== validado) {
      const controlName = `${fileId}-${i}`;
      const control = this.formGroupSeccionVoto.get('params')?.get(controlName);
      control?.setValue(validado);

      // Reestablecer el cursor al final para evitar "brinco" visual
      setTimeout(() => {
        input.setSelectionRange(validado.length, validado.length);
      });
    }
  }

  onFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const indices = this.getIndicesFromId(input.id);
    if (!indices) return;

    const { rowIndex } = indices;

    if (!this.isEditingMode(rowIndex)) {
      this.setEditingMode(false, rowIndex);

      setTimeout(() => {
        if (input.selectionStart === input.selectionEnd) {
          input.setSelectionRange(0, 0);
        }
      }, 0);
    }
  }

  getIndicesFromId(id: string): { rowIndex: number, colIndex?: number } | null {
    if (id.includes('pref')) {
      // Para inputs preferenciales: mat-input-pref-i-j
      const regex = /mat-input-pref-(\d+)-(\d+)/;
      const match = regex.exec(id);

      if (match) {
        return {
          rowIndex: parseInt(match[1], 10),
          colIndex: parseInt(match[2], 10)
        };
      }
    } else {
      // Para inputs totales: mat-input-total-i
      const regex = /mat-input-total-(\d+)/;
      const match = regex.exec(id);

      if (match) {
        return {
          rowIndex: parseInt(match[1], 10)
        };
      }
    }

    return null;
  }

  isEditingMode(i: number, j?: number): boolean {
    if (j !== undefined) {
      const key = `${i}-${j}`;

      return this.editingInputsPref.get(key) || false;
    } else {
      const key = `${i}`;

      return this.editingInputsTotal.get(key) || false;
    }

  }

  onBlur(): void {
    this.editingInputsTotal.clear();
    this.editingInputsPref.clear();
    this.cdr.detectChanges();
  }

  onInputVotoPref(fileId: string, i: number, j: number, event: Event): void {

    const input = event.target as HTMLInputElement;
    const value = input.value;
    const validado = this.validateInput(value);

    if (value !== validado) {
      const controlName = `${fileId}-${i}-${j}`;
      const control = this.formGroupSeccionVotoPref.get('params')?.get(controlName);
      control?.setValue(validado);

      // Reestablecer el cursor al final para evitar "brinco" visual
      setTimeout(() => {
        input.setSelectionRange(validado.length, validado.length);
      });
    }

  }

  onFocusPref(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const indices = this.getIndicesFromInputPref(input);
    if (!indices) return;

    const { rowIndex, colIndex } = indices;

    if (!this.isEditingMode(rowIndex, colIndex)) {
      this.setEditingMode(false, rowIndex, colIndex);

      setTimeout(() => {
        // Solo poner cursor en 0 si NO hay selección (para no interferir con doble clic)
        if (input.selectionStart === input.selectionEnd) {
          input.setSelectionRange(0, 0);
        }
      }, 0);
    }

  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  onDoubleClick(event: MouseEvent): void {
    const input = event.target as HTMLInputElement;
    const indices = this.getIndicesFromId(input.id);
    if (!indices) return;

    const { rowIndex } = indices;

    this.setEditingMode(true, rowIndex);

    setTimeout(() => {
      input.select();
    }, 0);
  }

  onDoubleClickPref(event: MouseEvent): void {
    const input = event.target as HTMLInputElement;
    const indices = this.getIndicesFromInputPref(input);
    if (!indices) return;

    const { rowIndex, colIndex } = indices;

    this.setEditingMode(true, rowIndex, colIndex);

    setTimeout(() => {
      input.select();
    }, 0);
  }

  protected readonly Constantes = Constantes;
}
