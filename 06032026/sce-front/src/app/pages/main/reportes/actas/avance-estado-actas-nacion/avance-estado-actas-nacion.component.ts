import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {AuthComponent} from 'src/app/helper/auth-component';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ProcesoElectoralResponseBean} from "src/app/model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "src/app/model/eleccionResponseBean";
import {CentroComputoBean} from "src/app/model/centroComputoBean";
import {Usuario} from "src/app/model/usuario-bean";
import {FiltroAvanceEstadoActaBean} from "src/app/model/filtroAvanceEstadoActaBean";
import {AvanceEstadoActaDetalleBean, AvanceEstadoActaReporteBean} from "src/app/model/avanceEstadoActaReporteBean";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "src/app/model/genericResponseBean";
import {catchError, of, Subscription, switchMap, timer} from "rxjs";
import {MonitoreoNacionService} from "src/app/service/monitoreo-nacion.service";
import {ReporteAvanceMesaNacionService} from "src/app/service/reporte-avance-mesa-nacion.service";
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { PopReportePuestaCeroComponent } from '../../../puesta-cero/pop-reporte-puesta-cero/pop-reporte-puesta-cero.component';
import { MatDialog } from '@angular/material/dialog';
import { Constantes } from 'src/app/helper/constantes';

@Component({
  selector: 'app-avance-estado-actas-nacion',
  templateUrl: './avance-estado-actas-nacion.component.html',
  styleUrls: ['./avance-estado-actas-nacion.component.scss']
})

export class AvanceEstadoActasNacionComponent extends AuthComponent implements OnInit{

  displayedColumns: string[] = [ 'codigoCc', 'nombreCc', 'fechaUltModificacion', 'totalActas',
    'actasIngresadas', 'actasProcesadas', 'actasProcesadasPorcen', 'actasContabilizadas', 'actasContabilizadasPorcen',
    'actasPendientesResolverJEE','actasPendientesResolverJEEPorcen' ];

  dataSourceDetail : AvanceEstadoActaDetalleBean[];
  dataSourceTotal : AvanceEstadoActaDetalleBean[];

  destroyRef:DestroyRef = inject(DestroyRef);

  public form: FormGroup;
  public isShowReporte: boolean;
  public pdfBlob: Blob;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public usuario: Usuario;
  public filtroAvanceEstadoActaBean: FiltroAvanceEstadoActaBean;
  public avanceEstadoMesaReporteBean: AvanceEstadoActaReporteBean;
  public listEstado: any[];
  public tituloAlert="Avance de Estado de Actas";
  public timeUpdate: number = Constantes.TIEMPO_ACTUALIZACION_REPORTE_AVANCE_ESTADO_ACTAS;
  public filtroTodos = {id: '0', nombre: 'TODOS'}

  public timerConsultar = timer(this.timeUpdate * 1000 * 60, this.timeUpdate * 1000 * 60);

  public timerSubscription: Subscription;

  constructor(
    private readonly reporteAvanceEstadoActasService: ReporteAvanceMesaNacionService,
    private readonly monitoreoService:MonitoreoNacionService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    public dialog: MatDialog,
  ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listCentrosComputo = [];
    this.isShowReporte = false;
    this.filtroAvanceEstadoActaBean = new FiltroAvanceEstadoActaBean();

    this.listEstado = [
      {id: '1', nombre: 'CC CONTABILIZADAS'},
      {id: '2', nombre: 'CC PROCESADAS'},
      {id: '3', nombre: 'CC POR PROCESAR'},
    ]

    this.form = this.formBuilder.group({
      proceso: [{ disabled: false }],
      eleccion: [{ disabled: false }],
      centroComputo: [{ disabled: false }],
      estado: [{ value: this.filtroTodos, disabled: false }],
    });
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.inicializarPeticiones();
    this.eventChanged();
  }


  colorRow(row: AvanceEstadoActaDetalleBean): string {
    let color: string = 'bg_rojo';

    if(row.mesasHabiles === row.actasContabilizadas){
      color = 'bg_verde';
    } else if (row.mesasHabiles === row.actasProcesadas) {
      color = 'bg_amarillo'
    }

    return color;
  }

  inicializarPeticiones() {
    this.monitoreoService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.listProceso = response.data;
          this.form.get('proceso').setValue(this.listProceso[0]);
        }
      });
  }

  eventChanged(): void {
    this.valueChangedProceso();
    this.valueChangedEleccion();
    this.valueChangedCentroComputo();
  }

  valueChangedProceso(): void {
    this.form.get('proceso').valueChanges
      .pipe(
        switchMap(proceso => {
            return this.monitoreoService.obtenerEleccionesNacion(proceso.id, proceso.acronimo)
              .pipe(
                catchError(err => {
                  return of(null);
                })
              )
          }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (elecciones) => {
          if(!elecciones){
            this.utilityService.mensajePopup(this.tituloAlert, 'No fue posible obtener las elecciones para el proceso seleccionado.', IconPopType.ERROR);
            this.listEleccion = [];
            return;
          }
          this.listEleccion = elecciones.data;
          if(this.listEleccion && this.listEleccion.length > 0){
            this.form.get('eleccion').setValue(this.listEleccion[0]);
          }
        },
      })
  }

  valueChangedEleccion(): void {
    this.form.get('eleccion').valueChanges
      .pipe(
        switchMap(
          eleccion => this.monitoreoService.obtenerCentroComputoPorIdEleccion(eleccion.id,
            this.form.get('proceso').value.nombreEsquemaPrincipal,
            this.form.get('proceso').value.acronimo
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.listCentrosComputo = response.data;
          if(this.listCentrosComputo && this.listCentrosComputo.length > 0){
            this.form.get('centroComputo').setValue(this.listCentrosComputo[0]);
          }
        }
      })
  }

  valueChangedCentroComputo(): void {
    this.form.get('centroComputo').valueChanges
      .subscribe(cc => {
        this.isShowReporte = false;
      });
  }


  buscarReporteAvanceEstActas(){
    this.getReporteAvanceEstadoActa();
    this.executeTimerConsulta();
  }

  getReporteAvanceEstadoActa() {
    if(!this.sonValidosLosDatosMinimos()) return;
    sessionStorage.setItem('loading','true');

    this.reporteAvanceEstadoActasService.getReporteAvanceEstadoActa(this.filtroAvance, this.form.get('proceso').value.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('loading','false');
          this.avanceEstadoMesaReporteBean = response.data;
          this.dataSourceDetail = this.avanceEstadoMesaReporteBean.detalleAvanceEstadoMesa;
          this.dataSourceTotal = this.avanceEstadoMesaReporteBean.totalAvanceEstadoMesa;
          this.isShowReporte = true;
        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener la información.", IconPopType.ERROR);
        }
      });
  }

  get filtroAvance(): FiltroAvanceEstadoActaBean {
    const proceso = this.form.get('proceso').value;
    this.filtroAvanceEstadoActaBean.idProceso = proceso.id;
    this.filtroAvanceEstadoActaBean.schema = proceso.nombreEsquemaPrincipal;
    this.filtroAvanceEstadoActaBean.idEleccion = this.form.get('eleccion').value.id;
    this.filtroAvanceEstadoActaBean.idCentroComputo = this.form.get('centroComputo').value.id;
    this.filtroAvanceEstadoActaBean.estado = this.form.get('estado').value.id;
    this.filtroAvanceEstadoActaBean.usuario = this.usuario.nombre;
    this.filtroAvanceEstadoActaBean.estadoDescripcion = this.form.get('estado').value.nombre
    this.filtroAvanceEstadoActaBean.centroComputo = this.form.get('centroComputo').value.codigo;

    return this.filtroAvanceEstadoActaBean;
  }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.form.get('proceso').value ||
      this.form.get('proceso').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso.", IconPopType.ALERT);
      return false;
    }
    if(!this.form.get('eleccion').value ||
      this.form.get('eleccion').value === '0'){
        this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección.", IconPopType.ALERT);
      return false;
    }

    return true;
  }

  descargarReporte(){
    sessionStorage.setItem('loading','true');
    this.reporteAvanceEstadoActasService.getReporteAvanceEstadoActaBase64(this.filtroAvance, this.form.get('proceso').value.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('loading','false');
          this.descargarPdf(response);
        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.utilityService.mensajePopup(this.tituloAlert, 'No se pudo obtener el reporte', IconPopType.ERROR);
        }
      });
  }

  descargarPdf(response: GenericResponseBean<string>){
    if (response.success){
      this.dialog.open(PopReportePuestaCeroComponent, {
        width: '1200px',
        maxWidth: '80vw',
        data: {
          dataBase64: response.data,
          nombreArchivoDescarga: 'reporteAvanceEstadoActa.pdf',
          success: true
        }
      });
    }else{
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ERROR);
    }
  }

  executeTimerConsulta() {
    this.timerSubscription = this.timerConsultar
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      () => {
        this.getReporteAvanceEstadoActa();
      }
    );
  }

  timeUpdateOnchange() {
    if(this.timeUpdate && this.timeUpdate > 0){
      this.timerSubscription.unsubscribe();
      this.timerConsultar = timer(this.timeUpdate * 1000 * 60, this.timeUpdate * 1000 * 60);
      this.executeTimerConsulta();
    }else {
      this.utilityService.mensajePopup(this.tituloAlert, "Ingrese un tiempo de actualización.", IconPopType.ERROR);
      this.timeUpdate = Constantes.TIEMPO_ACTUALIZACION_REPORTE_AVANCE_ESTADO_ACTAS;
    }
  }

}

