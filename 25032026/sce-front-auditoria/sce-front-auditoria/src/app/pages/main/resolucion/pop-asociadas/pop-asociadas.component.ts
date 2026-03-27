import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Inject,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';

//Chips
import {ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {FormControl} from "@angular/forms";
import {GeneralService} from "../../../../service/general-service.service";
import {forkJoin, Subject} from "rxjs";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import { ResolucionAsociadosRequest} from "../../../../model/resoluciones/resolucion-bean";
import {ResolucionService} from "../../../../service/resolucion.service";
import {ActaBean} from "../../../../model/resoluciones/acta-jee-bean";
import {Constantes} from "../../../../helper/constantes";
import {ListaResolucionesComponent} from "../lista-resoluciones/lista-resoluciones.component";
import {PopMensajeData} from "../../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../../shared/pop-mensaje/pop-mensaje.component";
import {Utility} from "../../../../helper/utility";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {IGenericInterface} from "../../../../interface/general.interface";
import {OrcDetalleCatalogoEstructuraBean} from "../../../../model/orcDetalleCatalogoEstructuraBean";
import {UtilityService} from "../../../../helper/utilityService";
import {EleccionDTO, UbigeoDTO} from '../../../../model/ubigeoElectoralBean';
import {LocalVotacionBean} from '../../../../model/localVotacionBean';
import {UbigeoService} from '../../../../service/ubigeo-service.service';
import {DialogoConfirmacionComponent} from '../../dialogo-confirmacion/dialogo-confirmacion.component';
import {IconPopType} from '../../../../model/enum/iconPopType';


export interface Acta {
  nroActaCopia: string;
}

@Component({
  selector: 'app-pop-asociadas',
  templateUrl: './pop-asociadas.component.html',
  styleUrls: ['./pop-asociadas.component.scss'],
})
export class PopAsociadasComponent implements OnInit,OnDestroy{

  destroyRef:DestroyRef = inject(DestroyRef);

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER] as const;
  actas: ActaBean[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  listTiposResoluciones: Array<OrcDetalleCatalogoEstructuraBean>;
  listProcedencias: Array<OrcDetalleCatalogoEstructuraBean>;
  tipoResolucionFormControl = new FormControl(0);
  procedenciaFormControl = new FormControl(0);
  nroExpedienteFormControl = new FormControl();
  nroResolucionFormControl = new FormControl();
  fechaResolucionFormControl = new FormControl(new Date());
  isSelectedOnpe :boolean = false;

  departamentoFormControl = new FormControl(0);
  provinciaFormControl = new FormControl(0);
  distritoFormControl = new FormControl(0);
  localVotacionFormControl = new FormControl(0);
  eleccionesFormControl = new FormControl(0);
  tipoNulosFC = new FormControl({value:"0", disabled:false});

  listDepartamentos: Array<UbigeoDTO>;
  listProvincias: Array<UbigeoDTO>;
  listDistritos: Array<UbigeoDTO>;
  listLocalVotacion: Array<LocalVotacionBean>;
  listElecciones: Array<EleccionDTO>;

  idProceso : number;
  nuevaResolucion: boolean = false;
  minDate:Date;
  readonly maxDate:Date;
  isMostrarModal: boolean = false;

  announcer = inject(LiveAnnouncer);

  constructor(
    private readonly generalService : GeneralService,
    private readonly ubigeoService : UbigeoService,
    private readonly resolucionService: ResolucionService,
    private readonly dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly dialogRef: MatDialogRef<ListaResolucionesComponent>,
    private readonly cdr: ChangeDetectorRef,
    private readonly utilityService: UtilityService
  ) {
    this.minDate= new Date(Utility.getAnioActual(),0,1);
    this.maxDate = new Date(Utility.getAnioActual(),Utility.getNumeroMesActual()-1,Utility.getDiaActual());

  }

  ngOnInit(): void {
    const resolucionBean: ResolucionAsociadosRequest = this.data.resolucionBean;
    this.idProceso = this.data.idProceso;
    this.nuevaResolucion = this.data.nuevaResolucion;

    this.nroResolucionFormControl.setValue(resolucionBean.numeroResolucion);
    this.nroExpedienteFormControl.setValue(resolucionBean.numeroExpediente);

    if (resolucionBean.fechaResolucion2) {
      this.fechaResolucionFormControl.setValue(new Date(resolucionBean.fechaResolucion2));
    }

    if (resolucionBean.fechaRegistro) {
      const fechaRegistro = Utility.parsearFecha(
        resolucionBean.fechaRegistro.toString(),
        'DD-MM-YYYY HH:mm:ss'
      ).toDate();

      const sieteDiasAntes = new Date(fechaRegistro);
      sieteDiasAntes.setDate(fechaRegistro.getDate() - 7);
      this.minDate = sieteDiasAntes;
    }

    this.actas = resolucionBean.actasAsociadas;

    this.utilityService.setLoading(true);

    forkJoin({
      procedencias: this.generalService.obtenerDetCatalogoEstructura(
        "mae_procedencia",
        "n_procedencia"
      ),
      tiposResoluciones: this.generalService.obtenerDetCatalogoEstructura(
        "mae_tipo_resolucion",
        "n_tipo_resolucion"
      )
    }).subscribe({
      next: ({ procedencias, tiposResoluciones }) => {
        this.utilityService.setLoading(false);

        this.listProcedencias = procedencias?.data ?? [];
        this.listTiposResoluciones = tiposResoluciones?.data ?? [];

        this.procedenciaFormControl.setValue(resolucionBean.procedencia ?? 0);
        this.tipoResolucionFormControl.setValue(resolucionBean.tipoResolucion ?? 0);

        if (this.procedenciaFormControl.value !== 0) {
          this.procedenciaFormControl.disable();
        }
        if (this.tipoResolucionFormControl.value !== 0) {
          this.tipoResolucionFormControl.disable();
          this.changeTipoResolucion();
        }

        this.isMostrarModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.utilityService.setLoading(false);
        this.cerrarDialogo();
        const mensaje = this.utilityService.manejarMensajeError(err);
        this.mensajePopup(mensaje, IconPopType.ALERT);
      }
    });
  }


  changeTipoResolucion() {

    if(this.nuevaResolucion){
      this.actas = [];
    }

    const tipo = this.tipoResolucionFormControl.value;

    if (
      tipo === Constantes.CATALOGO_TIPO_RESOL_INFUNDADAS_XUBIGEO ||
      tipo === Constantes.CATALOGO_TIPO_RESOL_ANULACION_ACTAS_X_UBIGEO
    ) {
      this.utilityService.setLoading(true);

      this.ubigeoService.listarDepartamentos().subscribe({
        next: (response) => {
          if (response?.success) {
            this.listDepartamentos = response.data;
          }
          this.utilityService.setLoading(false);
        },
        error: (err) => {
          this.utilityService.setLoading(false);
          const mensaje = this.utilityService.manejarMensajeError(err);
          this.mensajePopup(mensaje, IconPopType.ALERT);
        },
      });
    }
  }

  changeDepartamento() {
    this.actas = [];
    this.listLocalVotacion = [];
    this.listDistritos = [];

    this.ubigeoService.listarProvincias(this.departamentoFormControl.value).subscribe({
      next: (response) => {
        this.listProvincias = response?.success ? response.data : [];
      },
      error: (err) => {
        this.utilityService.setLoading(false);
        this.mensajePopup(this.utilityService.manejarMensajeError(err), IconPopType.ALERT);
      }
    });
  }

  changeProvincia(){

    this.actas = [];
    this.listLocalVotacion = [];
    this.ubigeoService.listarDistritos(this.provinciaFormControl.value).subscribe({
      next: (response) => {
        this.listDistritos = response?.success ? response.data : [];
      },
      error: (err) => {
        this.utilityService.setLoading(false);
        this.mensajePopup(this.utilityService.manejarMensajeError(err), IconPopType.ALERT);
      }
    });
  }

  changeDistrito() {
    this.actas = [];
    const ubigeoId = this.distritoFormControl.value;

    this.utilityService.setLoading(true);

    forkJoin({
      locales: this.ubigeoService.listarLocalesVotacionPorUbigeo(ubigeoId),
      elecciones: this.ubigeoService.listarEleccionesPorUbigeo(ubigeoId)
    }).subscribe({
      next: ({ locales, elecciones }) => {
        this.listLocalVotacion = locales?.success ? locales.data : [];
        this.listElecciones = elecciones?.success ? elecciones.data : [];
        this.utilityService.setLoading(false);
      },
      error: (err) => {
        this.utilityService.setLoading(false);
        const mensaje = this.utilityService.manejarMensajeError(err);
        this.mensajePopup(mensaje, IconPopType.ALERT);
      }
    });
  }

  changeLocalVotacion() {

    this.actas = [];

  }

  changeEleccion() {

    this.actas = [];

  }


  buscarActasContabilizadasPorUbigeo(){

    this.actas = [];

    if (this.tipoResolucionFormControl.value== 0){
      this.mensajePopup("Seleccione el tipo de resolución",IconPopType.ALERT)
      return;
    }

    if (this.distritoFormControl.value== 0){
      this.mensajePopup("Debe seleccionar un distrito.",IconPopType.ALERT)
      return;
    }

    sessionStorage.setItem('loading','true');

    this.resolucionService.getInfoActaParaAsociacion(this.tipoResolucionFormControl.value,"", this.distritoFormControl.value,this.localVotacionFormControl.value,this.eleccionesFormControl.value, this.idProceso)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getInfoOnlyActaCorrecto.bind(this),
        error: this.getInfoOnlyActaIncorrecto.bind(this)
      });
  }

  mensajePopup(mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:"Actas Asociadas",
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


  add(event: MatChipInputEvent): void {
    let nroActaCopia = (event.value || '').trim().toUpperCase();
    const tipoResolucion = this.tipoResolucionFormControl.value;

    if (!nroActaCopia) return;

    // Validar que se haya seleccionado tipo de resolución
    if (!tipoResolucion || tipoResolucion == 0) {
      return this.showError("Seleccione el tipo de resolución.", event);
    }

    const isMesa = (codigo: string) => codigo.length === 6;
    const isActa = (codigo: string) => codigo.length === 9;

    const validarMesa = (codigo: string): boolean => {
      if (!isMesa(codigo)) {
        this.showError("El nro de mesa debe tener 6 caracteres", event);
        return false;
      }
      if (this.actas.some(e => e.mesa === codigo)) {
        this.showError(`La mesa ${codigo} ya ha sido agregada.`, event);
        return false;
      }
      return true;
    };

    const validarActa = (codigo: string): boolean => {
      if (!isActa(codigo)) {
        this.showError("El valor ingresado debe contener 9 caracteres.", event);
        return false;
      }
      const nroCopia = codigo.substring(6);
      if (nroCopia.length !== 3) {
        this.showError("El número de copia no cuenta con 3 dígitos.", event);
        return false;
      }
      if (!/^\d{2}/.test(nroCopia.substring(0, 2))) {
        this.showError("Los dos primeros dígitos de la copia deben ser números.", event);
        return false;
      }
      if (!/^[a-zA-Z]$/.test(nroCopia.substring(2))) {
        this.showError("El último dígito de la copia debe ser una letra.", event);
        return false;
      }
      if (this.actas.some(e => e.mesa + e.copia === codigo)) {
        this.showError(`El acta ${codigo} ya ha sido agregada.`, event);
        return false;
      }
      return true;
    };

    let valido = false;

    switch (tipoResolucion) {
      case Constantes.CATALOGO_TIPO_RESOL_MESAS_NO_INSTALADAS:
      case Constantes.CATALOGO_TIPO_RESOL_ACTAS_EXTRAVIADAS:
      case Constantes.CATALOGO_TIPO_RESOL_ACTAS_SINIESTRADAS:
        valido = validarMesa(nroActaCopia);
        break;

      case Constantes.CATALOGO_TIPO_RESOL_ACTAS_ENVIADAS_A_JEE:
        if (isMesa(nroActaCopia)) {
          valido = validarMesa(nroActaCopia);
        } else {
          valido = validarActa(nroActaCopia);
        }
        break;

      case Constantes.CATALOGO_TIPO_RESOL_REPROCESADAS_JNE:
      case Constantes.CATALOGO_TIPO_RESOL_REPROCESADAS_ONPE:
      case Constantes.CATALOGO_TIPO_RESOL_INFUNDADAS_XUBIGEO:
      case Constantes.CATALOGO_TIPO_RESOL_INFUNDADAS:
        valido = validarActa(nroActaCopia);
        break;

      default:
        return this.showError("El tipo de resolución seleccionada no tiene implementación.", event);
    }

    if (!valido) return;

    // Si pasa validaciones, llamar servicio
    this.utilityService.setLoading(true);
    this.resolucionService.getInfoActaParaAsociacion(
      tipoResolucion,
      nroActaCopia,
      this.distritoFormControl.value,
      this.localVotacionFormControl.value,
      this.eleccionesFormControl.value,
      this.idProceso
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getInfoOnlyActaCorrecto.bind(this),
        error: this.getInfoOnlyActaIncorrecto.bind(this)
      });

    event.chipInput.clear();
  }

  //Función auxiliar para no repetir código
  private showError(msg: string, event: MatChipInputEvent) {
    this.mensajePopup(msg, IconPopType.ALERT);
    event.chipInput.clear();
  }


  remove(acta: ActaBean): void {

    if(this.tipoResolucionFormControl.value==Constantes.CATALOGO_TIPO_RESOL_INFUNDADAS_XUBIGEO ||
      this.tipoResolucionFormControl.value==Constantes.CATALOGO_TIPO_RESOL_ANULACION_ACTAS_X_UBIGEO){
      this.mensajePopup("No se puede eliminar actas para los siguientes tipos: Resoluciones Infundadas por Ubigeo y Anulación de Actas por Ubigeo.", IconPopType.ALERT);
      return;
    }

    const index = this.actas.indexOf(acta);

    if (index >= 0) {
      this.actas.splice(index, 1);
    }
  }

  getInfoOnlyActaCorrecto(response: IGenericInterface<ActaBean[]>){
    sessionStorage.setItem('loading','false');
    if(response.success){

      for(let res of response.data){
        this.actas.push(res);
      }
    }else{
      this.mensajePopup(response.message,IconPopType.ALERT)
    }
  }

  getInfoOnlyActaIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup(this.utilityService.manejarMensajeError(e),IconPopType.ALERT);
  }

  registrarAsociacion(){
    let procedencia = this.procedenciaFormControl.value;
    let tipoResolucion = this.tipoResolucionFormControl.value;
    let nroResolucion = this.nroResolucionFormControl.value;
    let nroExpediente = this.nroExpedienteFormControl.value;
    if (!procedencia || procedencia == 0) {
      this.mensajePopup("Seleccione una procedencia.",IconPopType.ALERT);
      return;
    }

    if (!tipoResolucion || tipoResolucion == 0) {
      this.mensajePopup("Seleccione un tipo de resolución.",IconPopType.ALERT);
      return;
    }


    if(procedencia !== Constantes.CATALOGO_PROCEDENCIA_ONPE_COD){
      if (!nroExpediente || nroExpediente == '') {
        this.mensajePopup("Ingrese un número de expediente.",IconPopType.ALERT);
        return;
      }
    }

    if (!nroResolucion || nroResolucion == '') {
        this.mensajePopup("Ingrese un número de resolución.",IconPopType.ALERT);
        return;
    }

    if(this.actas.length == 0){
      this.mensajePopup("No se han ingresado actas para asociarlas a la resolución.",IconPopType.ALERT);
      return;
    }

    if(tipoResolucion == Constantes.CATALOGO_TIPO_RESOL_ANULACION_ACTAS_X_UBIGEO){
      if (!this.tipoNulosFC.value || this.tipoNulosFC.value == "0") {
        this.mensajePopup("Seleccione una cantidad para pasar a nulos.",IconPopType.ALERT);
        return;
      }
    }


    this.dialog.open(DialogoConfirmacionComponent, {
      data: '¿Desea continuar?'
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          let resumenResolucionesDto: ResolucionAsociadosRequest = new ResolucionAsociadosRequest();
          resumenResolucionesDto.id = this.data.resolucionBean.id;
          resumenResolucionesDto.tipoResolucion = tipoResolucion;
          resumenResolucionesDto.numeroResolucion = nroResolucion;
          resumenResolucionesDto.numeroExpediente = nroExpediente;
          resumenResolucionesDto.tipoPasarNulos = this.tipoNulosFC.value;
          resumenResolucionesDto.fechaResolucion = this.fechaResolucionFormControl.value;
          resumenResolucionesDto.procedencia = procedencia;
          resumenResolucionesDto.actasAsociadas = this.actas;
          sessionStorage.setItem('loading','true');
          this.resolucionService.registrarAsociacionConActas(resumenResolucionesDto)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: this.registrarAsociacionCorrecto.bind(this),
                error: this.registrarAsociacionIncorrecto.bind(this)
              }
            );
        }
      });


  }

  registrarAsociacionCorrecto(res){
    sessionStorage.setItem('loading','false');
    if(res.success){
      this.dialogRef.close(res.message);
    }else{
      this.mensajePopup(res.message,IconPopType.ALERT)
    }
  }

  registrarAsociacionIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    let mensaje = this.utilityService.manejarMensajeError(e);
    this.mensajePopup(mensaje,IconPopType.ALERT);
  }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

  cerrarDialogo(){
    this.dialogRef.close("cancelar");
  }

  restringirNumeros(event: any): void {
    const valorOriginal = event.target.value;
    const valorNumerico = valorOriginal.replace(/\D/g, ''); // \D = no dígitos
    if (valorOriginal !== valorNumerico) {
      event.target.value = valorNumerico;
    }
  }

  restringirAlfanumerico(event: any): void {
    const valorOriginal = event.target.value;
    const valorFiltrado = valorOriginal.replace(/[^a-zA-Z0-9]/g, '');
    const valorMayusculas = valorFiltrado.toUpperCase();
    if (valorOriginal !== valorMayusculas) {
      event.target.value = valorMayusculas;
    }
  }


  protected readonly Constantes = Constantes;
}
