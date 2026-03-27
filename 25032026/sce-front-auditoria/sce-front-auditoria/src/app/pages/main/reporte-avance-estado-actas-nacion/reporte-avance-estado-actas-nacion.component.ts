import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {AuthComponent} from "../../../helper/auth-component";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ProcesoAmbitoBean} from "../../../model/procesoAmbitoBean";
import {ProcesoElectoralResponseBean} from "../../../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../../../model/eleccionResponseBean";
import {AmbitoBean} from "../../../model/ambitoBean";
import {CentroComputoBean} from "../../../model/centroComputoBean";
import {Usuario} from "../../../model/usuario-bean";
import {FiltroAvanceEstadoActaBean} from "../../../model/filtroAvanceEstadoActaBean";
import {AvanceEstadoActaReporteBean} from "../../../model/avanceEstadoActaReporteBean";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {filter, forkJoin, switchMap, tap} from "rxjs";
import {MonitoreoNacionService} from "../../../service/monitoreo-nacion.service";
import {ReporteAvanceMesaNacionService} from "../../../service/reporte-avance-mesa-nacion.service";
import {UtilityService} from '../../../helper/utilityService';
import {IconPopType} from '../../../model/enum/iconPopType';
import {Utility} from 'src/app/helper/utility';

export interface PeriodicElement {
  codigo: string;
  ccomputo: string;
  UltimaModif: string;
  AIngresada: number;
  AProcesada: number;
  PorAProcesada: number;
  AConta: number;
  ProAComta: number;
  APendiente: number;
  PorAPendiente: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    codigo: '232232',
    ccomputo: 'Hydrogen',
    UltimaModif: '26/03/1993',
    AIngresada: 23,
    AProcesada: 23,
    PorAProcesada: 23,
    AConta: 23,
    ProAComta: 23,
    APendiente: 23,
    PorAPendiente: 23,
  },
  {
    codigo: '232232',
    ccomputo: 'Hydrogen',
    UltimaModif: '26/03/1993',
    AIngresada: 23,
    AProcesada: 23,
    PorAProcesada: 23,
    AConta: 23,
    ProAComta: 23,
    APendiente: 23,
    PorAPendiente: 23,
  },
  {
    codigo: '232232',
    ccomputo: 'Hydrogen',
    UltimaModif: '26/03/1993',
    AIngresada: 23,
    AProcesada: 23,
    PorAProcesada: 23,
    AConta: 23,
    ProAComta: 23,
    APendiente: 23,
    PorAPendiente: 23,
  },
  {
    codigo: '232232',
    ccomputo: 'Hydrogen',
    UltimaModif: '26/03/1993',
    AIngresada: 23,
    AProcesada: 23,
    PorAProcesada: 23,
    AConta: 23,
    ProAComta: 23,
    APendiente: 23,
    PorAPendiente: 23,
  },
  {
    codigo: '232232',
    ccomputo: 'Hydrogen',
    UltimaModif: '26/03/1993',
    AIngresada: 23,
    AProcesada: 23,
    PorAProcesada: 23,
    AConta: 23,
    ProAComta: 23,
    APendiente: 23,
    PorAPendiente: 23,
  },
  {
    codigo: '232232',
    ccomputo: 'Hydrogen',
    UltimaModif: '26/03/1993',
    AIngresada: 23,
    AProcesada: 23,
    PorAProcesada: 23,
    AConta: 23,
    ProAComta: 23,
    APendiente: 23,
    PorAPendiente: 23,
  },

  {
    codigo: '232232',
    ccomputo: 'Hydrogen',
    UltimaModif: '26/03/1993',
    AIngresada: 23,
    AProcesada: 23,
    PorAProcesada: 23,
    AConta: 23,
    ProAComta: 23,
    APendiente: 23,
    PorAPendiente: 23,
  },
  {
    codigo: '232232',
    ccomputo: 'Hydrogen',
    UltimaModif: '26/03/1993',
    AIngresada: 23,
    AProcesada: 23,
    PorAProcesada: 23,
    AConta: 23,
    ProAComta: 23,
    APendiente: 23,
    PorAPendiente: 23,
  },

];

@Component({
  selector: 'app-reporte-avance-estado-actas-nacion',
  templateUrl: './reporte-avance-estado-actas-nacion.component.html',
})
export class ReporteAvanceEstadoActasNacionComponent extends AuthComponent implements OnInit {

  destroyRef:DestroyRef = inject(DestroyRef);

  public formGroupRepoAvanEstActFiltro: FormGroup;
  public isShowReporte: boolean;
  public ambito: ProcesoAmbitoBean;
  public pdfBlob: Blob;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listAmbitos: Array<AmbitoBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public usuario: Usuario;
  public filtroAvanceEstadoActaBean: FiltroAvanceEstadoActaBean;
  public avanceEstadoMesaReporteBean:AvanceEstadoActaReporteBean;
  public tituloAlert = "Reporte avance estado actas nación"


  constructor(
    private reporteAvanceEstadoActasService: ReporteAvanceMesaNacionService,
    private monitoreoService:MonitoreoNacionService,
    private formBuilder: FormBuilder,
    private utilityService: UtilityService
  ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listAmbitos = [];
    this.listCentrosComputo = [];
    this.ambito = new ProcesoAmbitoBean();
    this.ambito.nombreTipoAmbito = "ODPE";
    this.isShowReporte = false;
    this.filtroAvanceEstadoActaBean = new FiltroAvanceEstadoActaBean();

    this.formGroupRepoAvanEstActFiltro = this.formBuilder.group({
      procesoFormControl: ['0'],
      eleccionFormControl: ['0'],
      ambitoFormControl: ['0'],
      centroComputoFormControl: ['0'],
      estadoFormControl: ['0']
    });
  }

  ngOnInit() {
    this.usuario = this.authentication();
    this.monitoreoService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getListProcesosCorrecto.bind(this),
        error: this.getListProcesosIncorrecto.bind(this)
      });

    this.onProcesoChanged();
    this.onEleccionChanged();
    this.onAmbitoChanged();
    this.onCentroComputoChanged();
    this.onEstadoChanged();
  }

  getListProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>){
    if (response.success){
      this.listProceso = response.data;
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  getListProcesosIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert,"No fue posible cargar los procesos", IconPopType.ERROR);
  }

  onProcesoChanged():void{
    this.formGroupRepoAvanEstActFiltro.get('procesoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').setValue('0');
          this.isShowReporte = false;
          this.listEleccion = [];
        }),
        filter(value => value != '0'),
        switchMap(proceso => this.monitoreoService.obtenerEleccionesNacion(proceso.id,proceso.acronimo)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerEleccionesCorrecto.bind(this),
        error: this.obtenerEleccionesIncorrecto.bind(this),
        complete: () => console.info("completo en obtenerElecciones")
      });
  }

  obtenerEleccionesCorrecto(response:GenericResponseBean<Array<EleccionResponseBean>>){
    this.listEleccion = response.data;
  }
  obtenerEleccionesIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert,"No fue posible cargar las elecciones", IconPopType.ERROR);
  }

  onEleccionChanged():void{
    this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupRepoAvanEstActFiltro.get('ambitoFormControl').setValue('0');
          this.isShowReporte = false;
          this.listAmbitos = [];
        }),
        filter(value => value != '0'),
        switchMap(idEleccion => {
          return forkJoin([
            this.monitoreoService.getListAmbitos(this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.acronimo),
            this.monitoreoService.getTipoAmbitoPorProceso(this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.id,this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.acronimo)
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
    this.utilityService.mensajePopup(this.tituloAlert,"No se pudo obtener los ambitos.", IconPopType.ERROR);
  }

  onAmbitoChanged():void{
    this.formGroupRepoAvanEstActFiltro.get('ambitoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').setValue('0');
          this.isShowReporte = false;
          this.listCentrosComputo = [];
        }),
        filter(value => value != '0'),
        switchMap(idAmbito => this.monitoreoService.getCentrosComputo(this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.acronimo)),
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
    this.utilityService.mensajePopup(this.tituloAlert,"No fue posible cargar los centros de computo", IconPopType.ERROR);
  }

  onCentroComputoChanged(): void{
    this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl')!.valueChanges
      .subscribe(distrito => {
        this.isShowReporte = false;
      })
    ;
  }

  onEstadoChanged(): void{
    this.formGroupRepoAvanEstActFiltro.get('estadoFormControl')!.valueChanges
      .subscribe(distrito => {
        this.isShowReporte = false;
      })
    ;
  }


  buscarReporteAvanceEstActas(){
    if(!this.sonValidosLosDatosMinimos()) return;

    this.filtroAvanceEstadoActaBean.idProceso = this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.id;
    this.filtroAvanceEstadoActaBean.schema = this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.nombreEsquemaPrincipal;
    this.filtroAvanceEstadoActaBean.idEleccion = this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').value;
    this.filtroAvanceEstadoActaBean.idCentroComputo = this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').value;

    this.reporteAvanceEstadoActasService.getReporteAvanceEstadoActa(this.filtroAvanceEstadoActaBean,this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getReporteAvanceEstadoMesaCorrecto.bind(this),
        error: this.getReporteAvanceEstadoMesaIncorrecto.bind(this)
      });

    this.isShowReporte = true;
  }

  getReporteAvanceEstadoMesaCorrecto(response: GenericResponseBean<AvanceEstadoActaReporteBean>){
    if (response.success){
      this.avanceEstadoMesaReporteBean = response.data;
    }else {
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }
  getReporteAvanceEstadoMesaIncorrecto(error: any){
    this.isShowReporte = false;
    this.utilityService.mensajePopup(this.tituloAlert, "no se pudo obtener el reporte.", IconPopType.ERROR);
  }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un eleccion", IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoAvanEstActFiltro.get('ambitoFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('ambitoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una "+this.ambito.nombreTipoAmbito, IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un centro de Cómputo", IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoAvanEstActFiltro.get('estadoFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('estadoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un estado ", IconPopType.ALERT);
      return false;
    }
    return true;
  }

  descargarReporte(){

    let filtroAvanceEstadoActaBean: FiltroAvanceEstadoActaBean = new FiltroAvanceEstadoActaBean();
    filtroAvanceEstadoActaBean.idProceso = this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.id;
    filtroAvanceEstadoActaBean.schema = this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.nombreEsquemaPrincipal;
    filtroAvanceEstadoActaBean.idEleccion = this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').value;
    filtroAvanceEstadoActaBean.idCentroComputo = this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').value;
    this.reporteAvanceEstadoActasService.getReporteAvanceEstadoActaBase64(filtroAvanceEstadoActaBean,this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.reporteAvanceEstadoActaBase64Correcto.bind(this),
        error: this.reporteAvanceEstadoActaBase64Incorrecto.bind(this)
      });
  }

  reporteAvanceEstadoActaBase64Correcto(response: GenericResponseBean<string>){
    if (response.success){
      this.pdfBlob = Utility.base64toBlob(response.data,'application/pdf')
      const blobUrl = URL.createObjectURL(this.pdfBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.target = '_blank';
      a.download = 'reporteAvanceEstadoActa.pdf';
      document.body.appendChild(a);
      a.click();
    }else{
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  reporteAvanceEstadoActaBase64Incorrecto(error: any){
    this.isShowReporte = false;
    this.utilityService.mensajePopup(this.tituloAlert,"No se pudó obtener el reporte.", IconPopType.ERROR);
  }

  displayedColumns: string[] = ['codigo',
    'ccomputo',
    'UltimaModif',
    'AIngresada',
    'AProcesada',
    'PorAProcesada',
    'AConta',
    'ProAComta',
    'APendiente',
    'PorAPendiente'
  ];
  dataSource = ELEMENT_DATA;
}
