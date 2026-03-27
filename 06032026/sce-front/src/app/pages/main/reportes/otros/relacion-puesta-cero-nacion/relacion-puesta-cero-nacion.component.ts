import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { catchError, filter, of, Subject, Subscription, switchMap, takeUntil, tap, timer } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { Constantes } from 'src/app/helper/constantes';
import { UtilityService } from 'src/app/helper/utilityService';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { FiltroReporteRelacionPuestaCero } from 'src/app/model/reportes/filtroReporteRelacionPuestaCero';
import { ReporteRelacionPuestaCeroBean } from 'src/app/model/reportes/reporteRelacionPuestaCeroBean';
import { ModalGenericoReporteComponent } from 'src/app/pages/shared/modal-generico-reporte/modal-generico-reporte.component';

import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { ReporteRelacionPuestoCeroService } from 'src/app/service/reporte/reporte-relacion-puesto-cero.service';

const ELEMENT_DATA1 = [
  { bgColor: 'bg_rojo', codigo: 'C44002', cc: 'CAJAMARCA', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC: '26/05/2024 19:26:47', estado: 'Realizada' },
  { bgColor: 'bg_rojo', codigo: 'C44002', cc: 'BONGARA', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC: '26/05/2024 19:26:47', estado: 'Realizada' },
  { bgColor: 'bg_rojo', codigo: 'C44002', cc: 'LIMA', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC: '26/05/2024 19:26:47', estado: 'Realizada' },
  { bgColor: 'bg_amarillo', codigo: 'C44002', cc: 'AREQUIPA', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC: '26/05/2024 19:26:47', estado: 'Realizada' },
  { bgColor: 'bg_amarillo', codigo: 'C44002', cc: 'CUSCO', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC: '26/05/2024 19:26:47', estado: 'Pendiente' },
  { bgColor: 'bg_amarillo', codigo: 'C44002', cc: 'AMAZONAS', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC: '26/05/2024 19:26:47', estado: 'Realizada' },
  { bgColor: 'bg_amarillo', codigo: 'C44002', cc: 'LA LIBERTAD', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC: '26/05/2024 19:26:47', estado: 'Realizada' },
  { bgColor: 'bg_amarillo', codigo: 'C44002', cc: 'PUNO', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC: '26/05/2024 19:26:47', estado: 'Pendiente' },
  { bgColor: 'bg_amarillo', codigo: 'C44002', cc: 'SAN MARTIN', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC: '26/05/2024 19:26:47', estado: 'Realizada' },
  { bgColor: 'bg_amarillo', codigo: 'C44002', cc: 'TACNA', FechaEnvioCC: '26/05/2024 15:31:26', FechaRecepcionCC: '26/05/2024 19:26:47', estado: 'Realizada' },


];

const ELEMENT_DATA_ESTADO = [
  { id: '-1', nombre: 'TODOS' },
  { id: 0, nombre: 'PENDIENTE' },
  { id: 1, nombre: 'COMPLETO' }
]
@Component({
  selector: 'app-relacion-puesta-cero-nacion',
  templateUrl: './relacion-puesta-cero-nacion.component.html',
  styleUrls: ['./relacion-puesta-cero-nacion.component.scss']
})
export class RelacionPuestaCeroNacionComponent extends AuthComponent {
  public form: FormGroup;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  protected listConsultaReporteRelacionPuestaCero: Array<ReporteRelacionPuestaCeroBean> = [];
  private destroy$: Subject<boolean> = new Subject<boolean>();
  protected tituloAlert = "Reporte relación de puestas a cero por centro de cómputo";
  public mensaje: string = 'Por favor, seleccione los filtros para realizar la búsqueda.';
  displayedColumns1: string[] = ['codigo', 'cc', 'FechaEnvioCC', 'FechaRecepcionCC', 'estado'];
  dataSource1 = ELEMENT_DATA_ESTADO;

  protected listEstados = null;
  protected isShowReporte: boolean;
  protected totalPendientes: number = 0;
  protected totalCompletas: number = 0;
  protected timerSubscription: Subscription;
  protected timeUpdate: number = 5;
  protected timerConsultar = timer(this.timeUpdate * 1000 * 60, this.timeUpdate * 1000 * 60);
  private destroyRef: DestroyRef = inject(DestroyRef);

  constructor(private reporteRelacionPuestaCeroService: ReporteRelacionPuestoCeroService,
    private monitoreoService: MonitoreoNacionService,
    private formBuilder: FormBuilder,
    private utilityService: UtilityService,
    private dialog: MatDialog
  ) {
    super();

    this.form = this.formBuilder.group({
      proceso: [{ value: '0', disabled: false }],
      centroComputo: [{ value: '0', disabled: false }],
      estado: [{ value: '-1', disabled: false }],
    });
  }
  ngOnInit(): void {
    this.inicializarPeticiones();

  }

  inicializarPeticiones() {
    this.monitoreoService.obtenerProcesosElectorales()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: this.obtenerProcesosCorrecto.bind(this)
      });
    this.eventChanged();
  }

  eventChanged(): void {
    this.valueChangedProceso();
  }

  valueChangedProceso(): void {
    this.form.get('proceso').valueChanges
      .pipe(
        tap(() => {
          this.form.get('centroComputo').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listCentrosComputo = [];
          if (value == 0) {
            return false;
          } else {
            return true;
          }
        }),
        switchMap(proceso => {
          return this.monitoreoService.obtenerCentroComputo(proceso.nombreEsquemaPrincipal, proceso.acronimo)
          .pipe(
              catchError(err => {
                return of(null);
              })
            )
        }
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (centrosComputo) => {
          if(!centrosComputo){
            this.utilityService.mensajePopup(this.tituloAlert, 'No fue posible obtener los centros de cómputos para el proceso seleccionado.', IconPopType.ERROR);
            this.listCentrosComputo = [];
            return;
          }
          this.obtenerCentrosComputoCorrecto(centrosComputo);
        },
      })
  }

  obtenerProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>) {
    if (response.success) {
      this.listProceso = response.data;
      let primerElemento = response.data[0];
      this.form.get('proceso').setValue(primerElemento);
    }
  }

  obtenerCentrosComputoCorrecto(response: GenericResponseBean<Array<CentroComputoBean>>) {
    if (response.success) {
      this.listCentrosComputo = response.data;
      let primerElemento = response.data[0];
      this.form.get('centroComputo').setValue(primerElemento);
      this.listEstados = ELEMENT_DATA_ESTADO;
      this.form.get('estado').setValue(this.listEstados[0]);
    }
  }

  buscarReporteAsync() {
    this.consultar();
    this.executeTimerConsulta();
  }

  consultar(): void {
    if (!this.sonValidosLosDatosMinimos()) return;
    this.mensaje = '';
    let filtro: FiltroReporteRelacionPuestaCero = this.mapearCampos();
    this.reporteRelacionPuestaCeroService.consultaReporteRelacionPuestoCeroNacion(filtro, this.form.get('proceso').value.acronimo)
      .pipe(
        filter(value => {
          this.listConsultaReporteRelacionPuestaCero = [];
          return true;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          if (response.success) {
            this.listConsultaReporteRelacionPuestaCero = response.data;
            this.obtenerTotales(this.listConsultaReporteRelacionPuestaCero);
          }
        }
      });
  }

  obtenerTotales(list: ReporteRelacionPuestaCeroBean[]): void {
    this.totalCompletas = list.filter(x => x.estado == 1).length;
    this.totalPendientes = list.filter(x => x.estado == 0).length;
  }

  imprimir(): void {
    this.isShowReporte = true;
    if (!this.sonValidosLosDatosMinimos()) return;
    sessionStorage.setItem('loading', 'true');

    this.mensaje = '';
    let filtro: FiltroReporteRelacionPuestaCero = this.mapearCampos();

    this.reporteRelacionPuestaCeroService.obtenerReporteRelacionPuestoCeroNacion(filtro)
      .pipe(
        filter(value => {
          return true;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          this.descargarPdf(response);
        },
        error: err => {
          sessionStorage.setItem('loading', 'false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de relación puesta a cero.", IconPopType.ERROR);
        }
      })
  }



  descargarPdf(response: GenericResponseBean<string>) {
    if (response.success) {
      setTimeout(() => {
        this.dialog.open(ModalGenericoReporteComponent, {
          width: '1200px',
          maxWidth: '80vw',
          data: {
            pdfBlob: response.data,
            nombreArchivoDescarga: 'Relacion-puestas-cero.pdf',
            success: true
          }
        });

      }, 300);

    } else {
      this.isShowReporte = false;
      sessionStorage.setItem('loading', 'false');
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ERROR);
    }
  }

  mapearCampos(): FiltroReporteRelacionPuestaCero {
    let filtro: FiltroReporteRelacionPuestaCero = new FiltroReporteRelacionPuestaCero();
    filtro.esquema = this.form.get('proceso').value.nombreEsquemaPrincipal;
    filtro.idProceso = this.form.get('proceso').value.id;
    filtro.proceso = this.form.get('proceso').value.nombre;
    filtro.idCentroComputo = this.form.get('centroComputo').value.id;
    filtro.codigoCentroComputo = this.form.get('centroComputo').value.codigo;
    filtro.centroComputo = this.form.get('centroComputo').value.nombre;
    filtro.idEstado = this.form.get('estado').value.id == -1 ? null : this.form.get('estado').value.id;
    filtro.estado = this.form.get('estado').value.id == -1 ? null : this.form.get('estado').value.nombre;
    console.log(filtro)
    return filtro;
  }

  sonValidosLosDatosMinimos(): boolean {

    if (!this.form.get('proceso').value ||
      this.form.get('proceso').value === '0') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return false;
    }

    if (this.form.get('centroComputo').value === '00') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un centro de cómputo", IconPopType.ALERT);
      return false;
    }

    if ("-2" === this.form.get('estado').value.toString()) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un estado", IconPopType.ALERT);
      return false;
    }

    return true;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  timeUpdateOnchange() {
    if(this.timeUpdate && this.timeUpdate > 0){
      if(this.timerSubscription!=undefined) {
        this.timerSubscription.unsubscribe();
      }
      this.timerConsultar = timer(this.timeUpdate * 1000 * 60, this.timeUpdate * 1000 * 60);
      this.executeTimerConsulta();
    }else {
      this.utilityService.mensajePopup(this.tituloAlert, "Ingrese un tiempo de actualización.", IconPopType.ERROR);
      this.timeUpdate = Constantes.TIEMPO_ACTUALIZACION_REPORTE_AVANCE_ESTADO_ACTAS;
    }
  }

  executeTimerConsulta() {
    this.timerSubscription = this.timerConsultar
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        () => {
          this.consultar();
        }
      );
  }

    colorRow(estado: number): string {
      let color: string = 'pc_pendiente';

      if(estado === 1){
        color = 'pc_completo';
      }

      return color;
    }

}
