import { Component, DestroyRef, inject, OnInit} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, of, Subscription, switchMap, timer } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { UtilityService } from 'src/app/helper/utilityService';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { Usuario } from 'src/app/model/usuario-bean';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { PopReportePuestaCeroComponent } from '../../../puesta-cero/pop-reporte-puesta-cero/pop-reporte-puesta-cero.component';
import { MatDialog } from '@angular/material/dialog';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { EstadoActasOdpe, FiltroEstadoActasOdpe } from 'src/app/model/reportes/estado-actas-odpe';
import { Constantes } from 'src/app/helper/constantes';
import { ReporteEstadoActasOdpeService } from 'src/app/service/reporte/reporte-estado-actas-odpe.service';

@Component({
  selector: 'app-estado-actas-odpe-nacion',
  templateUrl: './estado-actas-odpe-nacion.component.html'
})
export class EstadoActasOdpeNacionComponent extends AuthComponent implements OnInit {
  displayedColumns: string[] = ['num', 'descOdpe', 'descCentroCompu', 'ahProcesar', 'porProcesar' ,
    'procesadas','observadas','resueltas','pendienteResol'];

  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listOdpe: Array<AmbitoBean>;
  public usuario: Usuario;
  public isShowReporte: boolean;
  public tituloAlert="Estado de actas por ODPE";
  public timeUpdate: number = 5;
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;

  public timerConsultar = timer(this.timeUpdate * 1000 * 60, this.timeUpdate * 1000 * 60);
  public timerSubscription: Subscription;

  public estadoActasOdpeBean: EstadoActasOdpe;

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly reporteEstadoActasOdpeService: ReporteEstadoActasOdpeService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    public dialog: MatDialog,
  ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listCentrosComputo = [];
    this.listOdpe = [];
    this.isShowReporte = false;

    this.form = this.formBuilder.group({
      proceso: [{ disabled: false }],
      eleccion: [{ disabled: false }],
      odpe: [{ disabled: false }],
      centroComputo: [{ disabled: false }],
    });
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.inicializarPeticiones();
    this.eventChanged();
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
    this.valueChangedOdpe();
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
          if(this.listEleccion && this.listEleccion.length > 0) {
            this.form.get('eleccion').setValue(this.listEleccion[0]);
          }
        },
      })
  }

  valueChangedEleccion(): void {
    this.form.get('eleccion').valueChanges
      .pipe(
        switchMap(
          eleccion => this.monitoreoService.obtenerAmbitoElectoralPorIdEleccion(eleccion.id,
            this.form.get('proceso').value.nombreEsquemaPrincipal,
            this.form.get('proceso').value.acronimo
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.listOdpe = response.data;
          if(this.listOdpe && this.listOdpe.length > 0) {
            this.form.get('odpe').setValue(this.listOdpe[0]);
          }
        }
      })
  }

  valueChangedOdpe(): void {
    this.form.get('odpe').valueChanges
      .pipe(
        switchMap(odpe =>
            this.monitoreoService.obtenerCentroComputoPorIdAmbitoElectoral(
              odpe.id,
              this.form.get('proceso').value.nombreEsquemaPrincipal,
              this.form.get('proceso').value.acronimo)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.listCentrosComputo = response.data;
          if(this.listCentrosComputo && this.listCentrosComputo.length > 0) {
            this.form.get('centroComputo').setValue(this.listCentrosComputo[0]);
          }

        }
      });
  }

  buscarReporte() {
    this.getReporteAvanceEstadoActa();
    this.executeTimerConsulta();
  }

  getReporteAvanceEstadoActa() {
    if(!this.sonValidosLosDatosMinimos()) return;
    sessionStorage.setItem('loading','true');

    this.reporteEstadoActasOdpeService.getReporteEstadoActasOdpe(this.filtroEstadoActasOdpe, this.form.get('proceso').value.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('loading','false');
          this.estadoActasOdpeBean = response.data;
          this.isShowReporte = true;
        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener la información.", IconPopType.ERROR);
        }
      });
  }

  imprimir() {
    if(!this.sonValidosLosDatosMinimos()) return;
    sessionStorage.setItem('loading','true');
    this.reporteEstadoActasOdpeService.getReporteEstadoActasOdpeBase64(this.filtroEstadoActasOdpe, this.form.get('proceso').value.acronimo)
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
          nombreArchivoDescarga: 'estado-actas-odpe.pdf',
          success: true
        }
      });

    }else{
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ERROR);
    }
  }

  get filtroEstadoActasOdpe(): FiltroEstadoActasOdpe {
    const proceso = this.form.get('proceso').value;

    return {
      usuario: this.usuario.nombre,
      esquema: proceso.nombreEsquemaPrincipal,
      idProceso: proceso.id,
      idEleccion: this.form.get('eleccion').value.id,
      idCentroComputo: this.form.get('centroComputo').value.id === 0 ? null : this.form.get('centroComputo').value.id,
      idOdpe: this.form.get('odpe').value.id === 0 ? null : this.form.get('odpe').value.id,
      proceso: proceso.nombre,
      eleccion: this.form.get('eleccion').value.nombre,
      centroComputo: this.form.get('centroComputo').value.codigo +  ' - ' + this.form.get('centroComputo').value.nombre,
      odpe: this.form.get('odpe').value.codigo + ' - ' + this.form.get('odpe').value.nombre,
      // codigoCentroComputo: this.form.get('centroComputo').value.codigo,

    }
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

  executeTimerConsulta() {
    this.timerSubscription = this.timerConsultar
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      () => {
        this.buscarReporte();
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
