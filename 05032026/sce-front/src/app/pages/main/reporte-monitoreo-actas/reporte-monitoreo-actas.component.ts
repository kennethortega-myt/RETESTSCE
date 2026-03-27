import {Component, DestroyRef, inject, OnDestroy, OnInit} from '@angular/core';
import {AuthComponent} from "../../../helper/auth-component";
import {GeneralService} from "../../../service/general-service.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {ProcesoElectoralResponseBean} from "../../../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../../../model/eleccionResponseBean";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Usuario} from "../../../model/usuario-bean";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {filter, forkJoin, switchMap, tap} from "rxjs";
import {UbigeoDepartamentoBean} from "../../../model/UbigeoDepartamentoBean";
import {UbigeoProvinciaBean} from "../../../model/ubigeoProvinciaBean";
import {UbigeoDistritoBean} from "../../../model/ubigeoDistritoBean";
import {CentEducativoBean} from "../../../model/cent-educativo-bean";
import {LocalVotacionBean} from "../../../model/localVotacionBean";
import {MesaBean} from "../../../model/mesaBean";
import {ReporteMonitoreoActaService} from "../../../service/reporte-monitoreo-acta.service";
import {ReporteMonitoreoActasBean} from "../../../model/reporteMonitoreoActasBean";
import {AmbitoBean} from "../../../model/ambitoBean";
import {ProcesoAmbitoBean} from "../../../model/procesoAmbitoBean";
import {CentroComputoBean} from "../../../model/centroComputoBean";
import {FiltroUbigeoDepartamentoBean} from "../../../model/FiltroUbigeoDepartamentoBean";
import {FiltroUbigeoProvinciaBean} from "../../../model/filtroUbigeoProvinciaBean";
import {FiltroUbigeoDistritoBean} from "../../../model/filtroUbigeoDistritoBean";
import {ObservacionBean} from "../../../model/observacionBean";
import {UtilityService} from "../../../helper/utilityService";
import {IconPopType} from "../../../model/enum/iconPopType";

export interface PeriodicElement {
  OPolitica: string;
  position: number;
  votos: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    OPolitica: 'Movimiento regional movimiento amazonas',
    votos: 1.0079,

  },
  {
    position: 1,
    OPolitica: 'Movimiento regional movimiento amazonas',
    votos: 1.0079,

  },

  {
    position: 1,
    OPolitica: 'Movimiento regional movimiento amazonas',
    votos: 1.0079,

  },
  {
    position: 1,
    OPolitica: 'Votos Nulos',
    votos: 1.0079,

  },
  {
    position: 1,
    OPolitica: 'Votos Blancos',
    votos: 1.0079,

  },
  {
    position: 1,
    OPolitica: 'Votos Inpugnados',
    votos: 1.0079,

  },
];


@Component({
  selector: 'app-reporte-monitoreo-actas',
  templateUrl: './reporte-monitoreo-actas.component.html',
  styleUrls: ['./reporte-monitoreo-actas.component.scss']
})
export class ReporteMonitoreoActasComponent extends AuthComponent implements OnInit, OnDestroy{

  destroyRef:DestroyRef = inject(DestroyRef);

  public formGroupFiltroBusqueda: FormGroup;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listAmbitos: Array<AmbitoBean>;
  public listDepartamento: Array<UbigeoDepartamentoBean>;
  public listProvincia: Array<UbigeoProvinciaBean>;
  public listDistrito: Array<UbigeoDistritoBean>;
  public ambito: ProcesoAmbitoBean;
  public listCentrosComputo: Array<CentroComputoBean>;
  listLocalVotacion: Array<LocalVotacionBean>;
  listMesa: Array<MesaBean>;
  listCentEducativo: Array<CentEducativoBean>;
  public usuario: Usuario;
  public isShowReporte: boolean;
  public isBusquedaDirecta: boolean;
  public reporteMonitoreo: ReporteMonitoreoActasBean;
  public observaciones: Array<ObservacionBean>;
  public observacionesActa: Array<ObservacionBean>;
  public observacionesActaDetalle: Array<ObservacionBean>;
  public tituloAlert="Monitoreo de actas";

  public procesoFormControl: FormControl;
  public eleccionFormControl: FormControl;
  public indCheckTipoBusqueda: FormControl;
  public ambitoFormControl: FormControl;
  public centroComputoFormControl: FormControl;
  public departamentoFormControl: FormControl;
  public provinciaFormControl: FormControl;
  public distritoFormControl: FormControl;
  public localVotacionFormControl: FormControl;
  public numeroMesaCmbFormControl: FormControl;
  public numeroMesaTxtFormControl: FormControl;


  displayedColumns: string[] = ['position',
                                'OPolitica',
                                'votos'
                              ];
  dataSource = ELEMENT_DATA;

  constructor(
    private generalService : GeneralService,
    private reporteMonitoreoActaService: ReporteMonitoreoActaService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private utilityService: UtilityService
  ) {
    super();

    this.listProceso = [];
    this.listEleccion = [];
    this.listAmbitos = [];
    this.listDepartamento = [];
    this.listProvincia = [];
    this.listDistrito = [];
    this.ambito = new ProcesoAmbitoBean();
    this.ambito.nombreTipoAmbito = "ODPE";
    this.listLocalVotacion = [];
    this.listCentEducativo = [];
    this.listMesa = [];
    this.isShowReporte = false;
    this.isBusquedaDirecta = false;
    this.reporteMonitoreo = new ReporteMonitoreoActasBean();
    this.observaciones = [];
    this.observacionesActa = [];
    this.observacionesActaDetalle = [];

    this.formGroupFiltroBusqueda = this.formBuilder.group({
      procesoFormControl: ['0'],
      eleccionFormControl: ['0'],
      indCheckTipoBusqueda: [false],
      ambitoFormControl: ['0'],
      centroComputoFormControl: ['0'],
      departamentoFormControl: ['0'],
      provinciaFormControl: ['0'],
      distritoFormControl: ['0'],
      localVotacionFormControl: ['0'],
      numeroMesaCmbFormControl: ['0'],
      numeroMesaTxtFormControl: [{value:'',disabled: false}]
    });

    this.procesoFormControl = this.formGroupFiltroBusqueda.get('procesoFormControl') as FormControl;
    this.eleccionFormControl = this.formGroupFiltroBusqueda.get('eleccionFormControl') as FormControl;
    this.indCheckTipoBusqueda = this.formGroupFiltroBusqueda.get('indCheckTipoBusqueda') as FormControl;
    this.ambitoFormControl = this.formGroupFiltroBusqueda.get('ambitoFormControl') as FormControl;
    this.centroComputoFormControl = this.formGroupFiltroBusqueda.get('centroComputoFormControl') as FormControl;
    this.departamentoFormControl = this.formGroupFiltroBusqueda.get('departamentoFormControl') as FormControl;
    this.provinciaFormControl = this.formGroupFiltroBusqueda.get('provinciaFormControl') as FormControl;
    this.distritoFormControl = this.formGroupFiltroBusqueda.get('distritoFormControl') as FormControl;
    this.localVotacionFormControl = this.formGroupFiltroBusqueda.get('localVotacionFormControl') as FormControl;
    this.numeroMesaCmbFormControl = this.formGroupFiltroBusqueda.get('numeroMesaCmbFormControl') as FormControl;
    this.numeroMesaTxtFormControl = this.formGroupFiltroBusqueda.get('numeroMesaTxtFormControl') as FormControl;
  }

  ngOnInit() {
    this.usuario = this.authentication();
    this.generalService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getListProcesosCorrecto.bind(this),
        error: this.getListProcesosIncorrecto.bind(this)
      });

    this.onProcesoChanged();
    this.onEleccionChanged();
    this.onAmbitoChanged();
    this.onCentroComputoChanged();
    this.onDepartamentoChanged();
    this.onProvinciaChanged();
    this.onDistritoChanged();
    this.onLocalVotacionChanged();
    this.onMesaChanged();
    this.onChangeTipoBusqueda();
    this.onChangeMesaTxt();
  }

  getListProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>){
    if (response.success){
      this.listProceso = response.data;
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  getListProcesosIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los procesos", IconPopType.ERROR);
  }

  onProcesoChanged():void{

    this.procesoFormControl.valueChanges
      .pipe(
        tap(() => {
          this.eleccionFormControl.setValue('0');
          this.isShowReporte = false;
          this.listEleccion = [];
        }),
        filter(value => value != '0'),
        switchMap(idProceso => this.generalService.obtenerElecciones(idProceso)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerEleccionesCorrecto.bind(this),
        error: this.obtenerEleccionesIncorrecto.bind(this)
      });
  }

  obtenerEleccionesCorrecto(response:GenericResponseBean<Array<EleccionResponseBean>>){
    this.listEleccion = response.data;
  }
  obtenerEleccionesIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar las elecciones", IconPopType.ALERT);
  }


  onChangeTipoBusqueda():void{
    this.indCheckTipoBusqueda.valueChanges.subscribe(value => {
      this.isShowReporte = false;
      if (value){
        this.isBusquedaDirecta = true;
      }else {
        this.isBusquedaDirecta = false;

      }
      this.procesoFormControl.setValue('0');
    })

  }

  onChangeMesaTxt(){
    this.numeroMesaTxtFormControl.valueChanges
      .subscribe(mesa => {
        this.isShowReporte = false;
      })
    ;
  }

  onAmbitoChanged():void{

    this.ambitoFormControl.valueChanges
      .pipe(
        tap(() => {
          this.centroComputoFormControl.setValue('0');
          this.isShowReporte = false;
          this.listCentrosComputo = [];
        }),
        filter(value => value != '0'),
        switchMap(idAmbito => this.generalService.getCentrosComputo()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.getCentrosComputoCorrecto.bind(this),
        error: this.getCentrosComputoIncorrecto.bind(this)
      });
  }

  getCentrosComputoCorrecto(response: GenericResponseBean<Array<CentroComputoBean>>){
    if (response.success){
      this.listCentrosComputo= response.data;
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  getCentrosComputoIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los centros de cómputo", IconPopType.ERROR);
  }

  onCentroComputoChanged(): void{
      this.centroComputoFormControl.valueChanges
        .pipe(
          tap(() => {
            this.departamentoFormControl.setValue('0');
            this.isShowReporte = false;
            this.listDepartamento = [];
          }),
          filter(value => value != '0'),
          switchMap(idCentroComputo => {
            let filtro: FiltroUbigeoDepartamentoBean = new FiltroUbigeoDepartamentoBean();
            filtro.idEleccion = this.eleccionFormControl.value;
            filtro.idAmbito = this.ambitoFormControl.value;
            filtro.idCentroComputo = this.centroComputoFormControl.value;
            return this.generalService.getDepartamento(filtro);
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: this.getDepartamentoCorrecto.bind(this),
          error: this.getDepartamentoIncorrecto.bind(this)
        });

  }

  getDepartamentoCorrecto(response: GenericResponseBean<Array<UbigeoDepartamentoBean>>){
    if (response){
      this.listDepartamento = response.data;
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  getDepartamentoIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los departamentos.", IconPopType.ERROR);
  }


  onDepartamentoChanged():void{

    this.departamentoFormControl.valueChanges
      .pipe(
        tap(() => {
          this.provinciaFormControl.setValue('0');
          this.isShowReporte = false;
          this.listProvincia = [];
        }),
        filter(value => value != '0'),
        switchMap(idCentroComputo => {
          let filtro: FiltroUbigeoProvinciaBean = new FiltroUbigeoProvinciaBean();
          filtro.idEleccion = this.eleccionFormControl.value;
          filtro.idAmbito = this.ambitoFormControl.value;
          filtro.idCentroComputo = this.centroComputoFormControl.value;
          filtro.departamento = this.departamentoFormControl.value;
          return this.generalService.getProvincia(filtro);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.getProvinciaCorrecto.bind(this),
        error: this.getProvinciaIncorrecto.bind(this)
      });
  }

  getProvinciaCorrecto(response: GenericResponseBean<Array<UbigeoProvinciaBean>>){
    if (response){
      this.listProvincia = response.data;
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  getProvinciaIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar las provincias.", IconPopType.ERROR);
  }


  onProvinciaChanged():void{

    this.provinciaFormControl.valueChanges
      .pipe(
        tap(() => {
          this.distritoFormControl.setValue('0');
          this.isShowReporte = false;
          this.listDistrito = [];
        }),
        filter(value => value != '0'),
        switchMap(idCentroComputo => {
          let filtro: FiltroUbigeoDistritoBean = new FiltroUbigeoDistritoBean();
          filtro.idEleccion = this.eleccionFormControl.value;
          filtro.idAmbito = this.ambitoFormControl.value;
          filtro.idCentroComputo = this.centroComputoFormControl.value;
          filtro.departamento = this.departamentoFormControl.value;
          filtro.provincia = this.provinciaFormControl.value;
          return this.generalService.getDistrito(filtro);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.getDistritoCorrecto.bind(this),
        error: this.getDistritoIncorrecto.bind(this)
      });
  }

  getDistritoCorrecto(response: GenericResponseBean<Array<UbigeoDistritoBean>>){
    if (response){
      this.listDistrito = response.data;
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  getDistritoIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los distritos.", IconPopType.ERROR);
  }


  onDistritoChanged(){

    this.distritoFormControl.valueChanges
      .pipe(
        tap(() => {
          this.localVotacionFormControl.setValue('0');
          this.isShowReporte = false;
          this.listLocalVotacion = [];
        }),
        filter(value => value != '0'),
        switchMap(idDistrito => this.generalService.obtenerLocalVotacionPorUbigeo(
          this.distritoFormControl.value)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerLocalVotacionCorrecto.bind(this),
        error: this.obtenerLocalVotacionIncorrecto.bind(this)
      });
  }


  obtenerLocalVotacionCorrecto(response:GenericResponseBean<Array<LocalVotacionBean>>){
    this.listLocalVotacion = response.data;
  }
  obtenerLocalVotacionIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los locales de votación", IconPopType.ALERT);
  }

  onLocalVotacionChanged(){

    this.localVotacionFormControl.valueChanges
      .pipe(
        tap(() => {
          this.numeroMesaCmbFormControl.setValue('0');
          this.isShowReporte = false;
          this.listMesa = [];
        }),
        filter(value => value != '0'),
        switchMap(idLocalVotacion => this.generalService.obtenerMesaPorLocalVotacion(idLocalVotacion)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerMesaCorrecto.bind(this),
        error: this.obtenerMesaIncorrecto.bind(this)
      });
  }

  onMesaChanged(){
    this.numeroMesaCmbFormControl.valueChanges
      .subscribe(mesa => {
        this.isShowReporte = false;
      })
    ;
  }

  obtenerMesaCorrecto(response:GenericResponseBean<Array<MesaBean>>){
    this.listMesa = response.data;
  }
  obtenerMesaIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar las Mesas", IconPopType.ALERT);
  }



  onEleccionChanged():void{
    this.eleccionFormControl.valueChanges
      .pipe(
        tap(() => {
          if (this.isBusquedaDirecta){
            this.numeroMesaTxtFormControl.setValue('');
          }else{
            this.ambitoFormControl.setValue('0');
            this.ambito.nombreTipoAmbito = "ODPE";
            this.listAmbitos = [];
          }
        }),
        filter(value => value != '0' && !this.isBusquedaDirecta),
        switchMap(idEleccion => {
          return forkJoin([
            this.generalService.getListAmbitos(),
            this.generalService.getTipoAmbitoPorProceso(this.procesoFormControl.value)
          ])
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerAmbitosCorrecto.bind(this),
        error: this.obtenerAmbitosIncorrecto.bind(this)
      });


  }

  obtenerAmbitosCorrecto(response){
    this.listAmbitos = response[0].data;
    if(response[1].data == null){
      this.ambito = new ProcesoAmbitoBean();
    } else{
      this.ambito = response[1].data;
    }
  }
  obtenerAmbitosIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No se pudieron obtener los ámbitos.", IconPopType.ERROR);
  }

  buscarActa(): void{
    let numMesa = "";
    if (this.isBusquedaDirecta){
      if(!this.sonValidosLosDatosMinimosBusquedaDirecta()) return;

      numMesa= this.numeroMesaTxtFormControl.value;

    }else{
      if(!this.sonValidosLosDatosMinimos()) return;

      numMesa= this.numeroMesaCmbFormControl.value;
    }
    sessionStorage.setItem('loading','true');
    this.reporteMonitoreoActaService.getReporteMonitoreoActa(numMesa)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getReporteMonitoreoActaCorrecto.bind(this),
        error: this.getReporteMonitoreoActaIncorrecto.bind(this)
      });
  }




  getReporteMonitoreoActaCorrecto(response: ReporteMonitoreoActasBean){
    sessionStorage.setItem('loading','false');
    this.isShowReporte = true;
    this.reporteMonitoreo = response;
    if (this.reporteMonitoreo.observaciones.length!==0){
      this.observaciones = this.reporteMonitoreo.observaciones.filter(
        observacion => observacion.tipo == 'OBSERVACION' );

      this.observacionesActa = this.reporteMonitoreo.observaciones.filter(
        observacion => observacion.tipo == 'EM_ACTA' );

      this.observacionesActaDetalle = this.reporteMonitoreo.observaciones.filter(
        observacion => observacion.tipo == 'EM_DET_ACTA' );
    }



  }

  getReporteMonitoreoActaIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.isShowReporte = false;
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de monitoreo de actas.", IconPopType.ERROR);
  }

  sonValidosLosDatosMinimos() :boolean{
    const controles = [
      { control: this.procesoFormControl, mensaje: "Seleccione un proceso" },
      { control: this.eleccionFormControl, mensaje: "Seleccione una elección" },
      { control: this.ambitoFormControl, mensaje: "Seleccione un " + this.ambito.nombreTipoAmbito },
      { control: this.centroComputoFormControl, mensaje: "Seleccione un centro de cómputo" },
      { control: this.departamentoFormControl, mensaje: "Seleccione un Departamento" },
      { control: this.provinciaFormControl, mensaje: "Seleccione una Provincia" },
      { control: this.distritoFormControl, mensaje: "Seleccione un distrito" },
      { control: this.localVotacionFormControl, mensaje: "Seleccione un Local de Votación" },
      { control: this.numeroMesaCmbFormControl, mensaje: "Seleccione una Mesa" }
    ];

    for (const { control, mensaje } of controles) {
      if (!control.value || control.value === '0') {
        this.utilityService.mensajePopup(this.tituloAlert, mensaje, IconPopType.ALERT);
        return false;
      }
    }

    return true;
  }

  sonValidosLosDatosMinimosBusquedaDirecta() :boolean{
    if(!this.procesoFormControl.value ||
      this.procesoFormControl.value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return false;
    }
    if(!this.eleccionFormControl.value ||
      this.eleccionFormControl.value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección", IconPopType.ALERT);
      return false;
    }
    if(this.numeroMesaTxtFormControl.value == ""){
      this.utilityService.mensajePopup(this.tituloAlert, "Ingrese el número de mesa.", IconPopType.ALERT);
      return false;
    }
    return true;
  }

  changeTipoBusqueda(event: MatSlideToggleChange){
    //Método vació
  }

  ngOnDestroy() {
    //Método vació
  }
}
