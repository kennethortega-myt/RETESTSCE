import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {AuthComponent} from "../../../helper/auth-component";
import {FormBuilder, FormGroup} from "@angular/forms";
import {GeneralService} from "../../../service/general-service.service";
import {ProcesoAmbitoBean} from "../../../model/procesoAmbitoBean";
import {ProcesoElectoralResponseBean} from "../../../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../../../model/eleccionResponseBean";
import {AmbitoBean} from "../../../model/ambitoBean";
import {CentroComputoBean} from "../../../model/centroComputoBean";
import {Usuario} from "../../../model/usuario-bean";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {filter, forkJoin, switchMap, tap} from "rxjs";
import {UbigeoDepartamentoBean} from "../../../model/UbigeoDepartamentoBean";
import {FiltroAvanceEstadoActaBean} from "../../../model/filtroAvanceEstadoActaBean";
import {ReporteAvanceEstadoActasService} from "../../../service/reporte-avance-estado-actas.service";
import {AvanceEstadoActaReporteBean} from "../../../model/avanceEstadoActaReporteBean";
import {Utility} from "../../../helper/utility";
import {UtilityService} from "../../../helper/utilityService";
import {IconPopType} from "../../../model/enum/iconPopType";

@Component({
    selector: 'app-reporte-resumen-total-cc',
    templateUrl: './reporte-resumen-total-cc.component.html',
  })
  export class ReporteResumenTotalCcComponent extends AuthComponent implements OnInit {

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
  public tituloAlert="Avance de estado de actas";

  constructor(
    private generalService : GeneralService,
    private reporteAvanceEstadoActasService: ReporteAvanceEstadoActasService,
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
      centroComputoFormControl: ['0']
    });
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
    this.formGroupRepoAvanEstActFiltro.get('procesoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').setValue('0');
          this.isShowReporte = false;
          this.listEleccion = [];
        }),
        filter(value => value != '0'),
        switchMap(idProceso => this.generalService.obtenerElecciones(idProceso)),
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
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar las elecciones", IconPopType.ERROR);
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
            this.generalService.getListAmbitos(),
            this.generalService.getTipoAmbitoPorProceso(this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value)
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

  onAmbitoChanged():void{
    this.formGroupRepoAvanEstActFiltro.get('ambitoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').setValue('0');
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
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los centros de cómputo", IconPopType.ALERT);
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

  getDepartamentoCorrecto(response: GenericResponseBean<Array<UbigeoDepartamentoBean>>){
    if (response){
      console.log("data correcta")
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  getDepartamentoIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los departamentos", IconPopType.ERROR);
  }

  buscarReporteAvanceEstActas(){
    if(!this.sonValidosLosDatosMinimos()) return;

    this.filtroAvanceEstadoActaBean.idProceso = this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value;
    this.filtroAvanceEstadoActaBean.idEleccion = this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').value;
    this.filtroAvanceEstadoActaBean.idCentroComputo = this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').value;

    sessionStorage.setItem('loading','true');

    this.reporteAvanceEstadoActasService.getReporteAvanceEstadoActa(this.filtroAvanceEstadoActaBean)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getReporteAvanceEstadoMesaCorrecto.bind(this),
        error: this.getReporteAvanceEstadoMesaIncorrecto.bind(this)
      });


  }

  getReporteAvanceEstadoMesaCorrecto(response: GenericResponseBean<AvanceEstadoActaReporteBean>){
    sessionStorage.setItem('loading','false');
    if (response.success){
      this.avanceEstadoMesaReporteBean = response.data;
      this.isShowReporte = true;
    }else {
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }
  getReporteAvanceEstadoMesaIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.isShowReporte = false;
    this.utilityService.mensajePopup(this.tituloAlert, "No se pudo obtener el reporte.", IconPopType.ALERT);
  }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección", IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoAvanEstActFiltro.get('ambitoFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('ambitoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una "+this.ambito.nombreTipoAmbito, IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un centro de cómputo ", IconPopType.ALERT);
      return false;
    }
    return true;
  }

  descargarReporte(){

    let filtroAvanceEstadoActaBean: FiltroAvanceEstadoActaBean = new FiltroAvanceEstadoActaBean();
    filtroAvanceEstadoActaBean.idProceso = this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value;
    filtroAvanceEstadoActaBean.idEleccion = this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').value;
    filtroAvanceEstadoActaBean.idCentroComputo = this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').value;
    this.reporteAvanceEstadoActasService.getReporteAvanceEstadoActaBase64(filtroAvanceEstadoActaBean)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.reporteAvanceEstadoActaBase64Correcto.bind(this),
        error: this.reporteAvanceEstadoActaBase64Incorrecto.bind(this)
      });
  }

  reporteAvanceEstadoActaBase64Correcto(response: GenericResponseBean<string>){
    if (response.success){
      this.pdfBlob = Utility.base64toBlob(response.data,'application/pdf');
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
    this.utilityService.mensajePopup(this.tituloAlert, "No se pudó obtener el reporte.", IconPopType.ERROR);
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


  }
