import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {AuthComponent} from "../../../helper/auth-component";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ProcesoAmbitoBean} from "../../../model/procesoAmbitoBean";
import {ProcesoElectoralResponseBean} from "../../../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../../../model/eleccionResponseBean";
import {AmbitoBean} from "../../../model/ambitoBean";
import {CentroComputoBean} from "../../../model/centroComputoBean";
import {Usuario} from "../../../model/usuario-bean";
import {MonitoreoNacionService} from "../../../service/monitoreo-nacion.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {filter, forkJoin, switchMap, tap} from "rxjs";
import {ReporteTotalCentroComputoService} from "../../../service/reporte-total-centro-computo.service";
import {FiltroTotalCentroComputoBean} from "../../../model/FiltroTotalCentroComputoBean";
import {UtilityService} from '../../../helper/utilityService';
import {IconPopType} from '../../../model/enum/iconPopType';
import {Utility} from 'src/app/helper/utility';

@Component({
  selector: 'app-reporte-total-centro-computo',
  templateUrl: './reporte-total-centro-computo.component.html',
})
export class ReporteTotalCentroComputoComponent extends AuthComponent implements OnInit {

  public readonly formGroupRepoAvanEstActFiltro: FormGroup;
  public isShowReporte: boolean;
  public ambito: ProcesoAmbitoBean;
  public pdfBlob: Blob;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listAmbitos: Array<AmbitoBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public usuario: Usuario;
  public filtroTotalCentroComputoBean: FiltroTotalCentroComputoBean;

  private readonly tituloComponente = "Reporte total de centro de cómputo";
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly reporteTotalCentroComputoService: ReporteTotalCentroComputoService,
    private readonly monitoreoService:MonitoreoNacionService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService
  ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listAmbitos = [];
    this.listCentrosComputo = [];
    this.ambito = new ProcesoAmbitoBean();
    this.ambito.nombreTipoAmbito = "ODPE";
    this.isShowReporte = false;
    this.filtroTotalCentroComputoBean = new FiltroTotalCentroComputoBean();


    this.formGroupRepoAvanEstActFiltro = this.formBuilder.group({
      procesoFormControl: ['0'],
      eleccionFormControl: ['0'],
      ambitoFormControl: ['0'],
      centroComputoFormControl: ['0'],
      estadoFormControl: ['0'],
      tipoReporte:['1']
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
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
  }

  getListProcesosIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloComponente,"No fue posible cargar los procesos",IconPopType.ERROR);
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
    this.utilityService.mensajePopup(this.tituloComponente,"No fue posible cargar las elecciones",IconPopType.ERROR);
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
    this.utilityService.mensajePopup(this.tituloComponente,"No se pudo obtener los ambitos.",IconPopType.ERROR);
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
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
  }

  getCentrosComputoIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloComponente,"No fue posible cargar los centros de computo",IconPopType.ERROR);
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


  buscarReporteTotalCentroComputo(){
    if(!this.sonValidosLosDatosMinimos()) return;

    this.filtroTotalCentroComputoBean.idProceso = this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.id;
    this.filtroTotalCentroComputoBean.schema = this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.nombreEsquemaPrincipal;
    this.filtroTotalCentroComputoBean.idEleccion = this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').value;
    this.filtroTotalCentroComputoBean.idCentroComputo = this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').value;

    this.reporteTotalCentroComputoService.getReporteTotalCentroComputo(this.filtroTotalCentroComputoBean,this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getReporteAvanceEstadoMesaCorrecto.bind(this),
        error: this.getReporteAvanceEstadoMesaIncorrecto.bind(this)
      });

    this.isShowReporte = true;
  }

  getReporteAvanceEstadoMesaCorrecto(response: GenericResponseBean<any>){
    if (response.success){
    }else {
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
  }
  getReporteAvanceEstadoMesaIncorrecto(error: any){
    this.isShowReporte = false;
    this.utilityService.mensajePopup(this.tituloComponente,"no se pudo obtener el reporte.",IconPopType.ERROR);
  }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloComponente,"Seleccione un proceso",IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloComponente,"Seleccione un eleccion",IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoAvanEstActFiltro.get('ambitoFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('ambitoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloComponente,"Seleccione una "+this.ambito.nombreTipoAmbito,IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloComponente,"Seleccione un centro de Cómputo",IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoAvanEstActFiltro.get('estadoFormControl').value ||
      this.formGroupRepoAvanEstActFiltro.get('estadoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloComponente,"Seleccione un estado ",IconPopType.ALERT);
      return false;
    }
    return true;
  }

  descargarReporte(){

    let totalCentroComputoBean: FiltroTotalCentroComputoBean = new FiltroTotalCentroComputoBean();
    totalCentroComputoBean.idProceso = this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.id;
    totalCentroComputoBean.schema = this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.nombreEsquemaPrincipal;
    totalCentroComputoBean.idEleccion = this.formGroupRepoAvanEstActFiltro.get('eleccionFormControl').value;
    totalCentroComputoBean.idCentroComputo = this.formGroupRepoAvanEstActFiltro.get('centroComputoFormControl').value;
    this.reporteTotalCentroComputoService.getReporteTotalCentroComputoBase64(totalCentroComputoBean,this.formGroupRepoAvanEstActFiltro.get('procesoFormControl').value.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.reporteTotalCentroComputoBase64Correcto.bind(this),
        error: this.reporteTotalCentroComputoBase64Incorrecto.bind(this)
      });
  }

  reporteTotalCentroComputoBase64Correcto(response: GenericResponseBean<string>){
    if (response.success){
      this.pdfBlob = Utility.base64toBlob(response.data,'application/pdf')
      const blobUrl = URL.createObjectURL(this.pdfBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.target = '_blank';
      a.download = 'reporteTotalCentroComputo.pdf';
      document.body.appendChild(a);
      a.click();
    }else{
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
  }

  reporteTotalCentroComputoBase64Incorrecto(error: any){
    this.isShowReporte = false;
    this.utilityService.mensajePopup(this.tituloComponente,"No se pudó obtener el reporte.",IconPopType.ERROR);
  }

  displayedColumns: string[] = [
    'codigo',
    'ccomputo',
    'hablitadoCierre',
    'totalMesasInstalar',
    'digitalizacion',
    'totalMesasInstaladas',
    'totalMesasNoInstaladas',
    'actasSiniestradasAnuladas',
    'actasExtravAnuladas',
    'actasProcesadasRecibidas',
    'actasContabilizadas',
    'controlCalidad',
    'transmisionImagenes',
    'registroOmisos'
  ];

}
