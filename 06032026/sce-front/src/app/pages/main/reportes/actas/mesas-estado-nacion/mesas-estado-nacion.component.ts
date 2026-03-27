import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, combineLatest, filter, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { UtilityService } from 'src/app/helper/utilityService';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { EstadoMesa, EstadoMesaPorTipoReporteBean } from 'src/app/model/estadoMesaPorTipoReporteBean';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { FiltroReporteMesasPorEstado } from 'src/app/model/reportes/filtroReporteMesasPorEstadoMesa';
import { UbigeoDTO } from 'src/app/model/ubigeoElectoralBean';
import { Usuario } from 'src/app/model/usuario-bean';
import { GeneralService } from 'src/app/service/general-service.service';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { ReporteMesasPorEstadoMesaService } from 'src/app/service/reporte/reporte-mesas-por-estado-mesa.service';
import { TipoReporteEnum } from 'src/app/transversal/enums/tipo-reporte.enum';
import { generarPdf } from 'src/app/transversal/utils/funciones';
import { Utility } from 'src/app/helper/utility';
import { NivelUbigeo } from 'src/app/model/enum/nivel-ubigeo.enum';

@Component({
  selector: 'app-mesas-estado-nacion',
  templateUrl: './mesas-estado-nacion.component.html',
})
export class MesasEstadoNacionComponent extends AuthComponent implements OnInit, OnDestroy {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  public pdfBlob: Blob;
  public mensaje: string = 'Por favor, seleccione el ámbito para realizar la búsqueda.';
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listNivelUbigeoUno: Array<UbigeoDTO>;
  public listNivelUbigeoDos: Array<UbigeoDTO>;
  public listNivelUbigeoTres: Array<UbigeoDTO>;
  public listOdpes: Array<AmbitoBean>;
  public usuario: Usuario;
  public isShowReporte: boolean;
  public tituloAlert = "Reporte mesas por estado";
  protected TipoReporteEnum = TipoReporteEnum;


  private destroy$: Subject<boolean> = new Subject<boolean>();
  private destroyRef: DestroyRef = inject(DestroyRef);
  protected form: FormGroup;

  protected listTipoEstadoMesa: Array<EstadoMesaPorTipoReporteBean>;
  protected listEstadoMesa: Array<EstadoMesa>;

  constructor(
    private monitoreoService: MonitoreoNacionService,
    private generalService: GeneralService,
    private utilityService: UtilityService,
    private reporteMesasPorEstadoMesaService: ReporteMesasPorEstadoMesaService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
  ) {
    super();
    this.form = this.formBuilder.group({
      proceso: [{ value: '0', disabled: false }],
      eleccion: [{ value: '0', disabled: false }],
      tipoReporte: [{ value: 0, disabled: false }],
      ambitoElectoral: [{ value: '0', disabled: false }],
      centroComputo: [{ value: '0', disabled: false }],
      estadoMesa: [{ value: '0', disabled: false }],
      nivelUbigeoUno: [{ value: '0', disabled: false }],
      nivelUbigeoDos: [{ value: '0', disabled: false }],
      nivelUbigeoTres: [{ value: '0', disabled: false }],
      porDistrito: [{value:true, disabled:false}]
    });
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.inicializarPeticiones();
    this.eventChanged();
  }

  inicializarPeticiones() {
    sessionStorage.setItem('loading', 'true');
    this.monitoreoService.obtenerProcesosElectorales()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.obtenerProcesosCorrecto(result);
          sessionStorage.setItem('loading', 'false');
        },
        error: error => {
          sessionStorage.setItem('loading', 'false');
        }
      });
  }

  eventChanged(): void {
    this.valueChangedProceso();
    this.valueChangedEleccion();
    this.valueChangedAmbitoElectoral();
    this.valueChangedNivelUbigeoUno();
    this.valueChangedNivelUbigeoDos();
    this.valueChangedCentroComputo();
    this.valueChangedTipoReporte();
  }

  valueChangedProceso(): void {
    this.form.get('proceso').valueChanges
      .pipe(
        tap(() => {
          this.form.get('eleccion').setValue('0', { emitEvent: false });
          this.form.get('centroComputo').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoUno').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
          this.form.get('ambitoElectoral').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listEleccion = [];
          this.listCentrosComputo = [];
          this.listNivelUbigeoUno = [];
          this.listNivelUbigeoDos = [];
          this.listNivelUbigeoTres = [];
          this.listOdpes = [];
          if (value == 0) {
            return false;
          } else {
            return true;
          }
        }),
        switchMap(proceso => {
          return combineLatest([
            this.monitoreoService.obtenerEleccionesPorIdProcesoElectoral(
              proceso.id,
              proceso.nombreEsquemaPrincipal,
              proceso.acronimo)
            .pipe(
              catchError(err => {
                return of(null);
              })
            )
            ,
            this.monitoreoService.obtenerAmbitoElectoralPorIdCentroComputo(0, proceso.nombreEsquemaPrincipal, proceso.acronimo)
            .pipe(
              catchError(err => {
                return of(null);
              })
            )
          ])
        }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([elecciones, ambitoElectorales]) => {
          if(!elecciones){
            this.utilityService.mensajePopup(this.tituloAlert, 'No fue posible obtener las elecciones para el proceso seleccionado.', IconPopType.ERROR);
            this.listEleccion = [];
            return;
          }
          this.obtenerEleccionesCorrecto(elecciones);
          this.obtenerAmbitoElectoralCorrecto(ambitoElectorales);
        },
      })
  }

  valueChangedEleccion(): void {
    this.form.get('eleccion').valueChanges
      .pipe(
        tap(() => {
          this.form.get('centroComputo').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoUno').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listNivelUbigeoUno = [];
          this.listNivelUbigeoDos = [];
          this.listNivelUbigeoTres = [];
          this.listCentrosComputo = [];
          if (value == 0) {
            return false;
          } else {
            return true;
          }
        }),
        switchMap(eleccion => {
          return combineLatest([
            this.monitoreoService.obtenerCentroComputoPorIdEleccion(
              eleccion.id,
              this.form.get('proceso').value.nombreEsquemaPrincipal,
              this.form.get('proceso').value.acronimo
            ),
            this.monitoreoService.obtenerAmbitoElectoralPorIdCentroComputo(0,
              this.form.get('proceso').value.nombreEsquemaPrincipal,
              this.form.get('proceso').value.acronimo)
          ])
        }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([elecciones, ambitoElectorales]) => {
          this.obtenerCentrosComputoCorrecto(elecciones);
          this.obtenerAmbitoElectoralCorrecto(ambitoElectorales);
        }
      })
  }

  valueChangedAmbitoElectoral() {
    this.form.get('ambitoElectoral').valueChanges
      .pipe(
        tap(() => {
          this.form.get('nivelUbigeoUno').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listNivelUbigeoDos = [];
          this.listNivelUbigeoTres = [];
          if (value == 0) {
            return false;
          } else {
            return true;
          }
        }
        ),
        switchMap(ambitoElectoral => {
          let idEleccion = this.form.get('eleccion').value.id;
          return combineLatest([
            this.monitoreoService.obtenerUbigeoNivelUnoPorAmbitoElectoral(idEleccion, ambitoElectoral.id, this.form.get('proceso').value.nombreEsquemaPrincipal,
              this.form.get('proceso').value.acronimo)
          ])
        }),

        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ([nivelUbigeoUno]) => {
          this.obtenerUbigeoNivelUnoCorrecto(nivelUbigeoUno);
        }
      });
  }

  valueChangedCentroComputo(): void {
    this.form.get('centroComputo').valueChanges
      .pipe(
        tap(() => {
          this.form.get('ambitoElectoral').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoUno').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listOdpes = [];
          this.listNivelUbigeoUno = [];
          this.listNivelUbigeoDos = [];
          this.listNivelUbigeoTres = [];
          return true;
        }),
        switchMap(centroComputo => {
          let idCentroComputo = centroComputo == 0 ? 0 : centroComputo.id;
          return combineLatest([
            this.monitoreoService.obtenerAmbitoElectoralPorIdCentroComputo(
              idCentroComputo,
              this.form.get('proceso').value.nombreEsquemaPrincipal,
              this.form.get('proceso').value.acronimo
            )
          ])
        }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        //error: this.getProvinciaIncorrecto.bind(this)
        next: ([ambitoElectoral]) => {
          this.obtenerAmbitoElectoralCorrecto(ambitoElectoral);
        }
      });
  }
  valueChangedNivelUbigeoUno(): void {
    this.form.get('nivelUbigeoUno').valueChanges
      .pipe(
        tap(() => {
          this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listNivelUbigeoDos = [];
          this.listNivelUbigeoTres = [];
          if (value == 0) {
            return false;
          } else {
            return true;
          }
        }),
        switchMap(nivelUbigeoUno =>
          this.monitoreoService.obtenerProvinciasNacion(nivelUbigeoUno,
            this.form.get('eleccion').value.id,
            this.form.get('proceso').value.acronimo,
            this.form.get('proceso').value.nombreEsquemaPrincipal,
            this.form.get('ambitoElectoral').value.id)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerUbigeoNivelDosCorrecto.bind(this),
        //error: this.getProvinciaIncorrecto.bind(this)
      });
  }
  valueChangedNivelUbigeoDos() {
    this.form.get('nivelUbigeoDos').valueChanges
      .pipe(
        tap(() => {
          this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listNivelUbigeoTres = [];
          if (value == 0) {
            return false;
          } else {
            return true;
          }
        }),
        switchMap(nivelUbigeoDos =>
          this.monitoreoService.obtenerDistritosNacion(
            nivelUbigeoDos,
            this.form.get('eleccion').value.id,
            this.form.get('proceso').value.acronimo,
            this.form.get('proceso').value.nombreEsquemaPrincipal,
            this.form.get('ambitoElectoral').value.id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerUbigeoNivelTresCorrecto.bind(this)
      });
  }
  valueChangedTipoReporte(): void {
    this.form.get('tipoReporte').valueChanges
      .pipe(
        tap(() => {
          this.form.get('estadoMesa').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listEstadoMesa = [];
          if (value == 0) {
            return false;
          } else {
            return true;
          }
        }),
        switchMap(tipoReporte => {
          let nombreTipoReporte: string = '';
          if(tipoReporte == TipoReporteEnum.MesasPorMesa) {
            nombreTipoReporte = 'c_estado_mesa';
          }
          else if (tipoReporte == TipoReporteEnum.MesasPorEstadoDeActa) {
            nombreTipoReporte = 'n_grupo_estado_acta';
          }
          else if (tipoReporte == TipoReporteEnum.MesasPorEstadoDeDigitacion) {
            nombreTipoReporte = 'n_clasificacion_acta_digitacion';
          }
          return this.monitoreoService.obtenerTipoEstadoReporte(this.form.get('proceso').value.nombreEsquemaPrincipal, nombreTipoReporte,
            this.form.get('proceso').value.acronimo);
        }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerEstadoMesaCorrecto.bind(this)
      })
  }
  obtenerEstadoMesaCorrecto(response) {
    this.listEstadoMesa = response.data;

  }
  obtenerAmbitoElectoralCorrecto(response) {
    if(response.success) {
      this.listOdpes = response.data;
      let dataInicial = response.data[0];
      this.form.get('ambitoElectoral').setValue(dataInicial, { emitEvent: true });
    }
  }

  obtenerEleccionesCorrecto(response: GenericResponseBean<Array<EleccionResponseBean>>) {
    if(response.success) {
      this.listEleccion = response.data;
      let dataInicial = response.data[0];
      this.form.get('eleccion').setValue(dataInicial, { emitEvent: true });
    }
  }

  obtenerCentrosComputoCorrecto(response: GenericResponseBean<Array<CentroComputoBean>>) {
    if (response.success) {
      this.listCentrosComputo = response.data;
      let dataInicial = response.data[0];
      this.form.get('centroComputo').setValue(dataInicial, { emitEvent: false });
    }
  }
  obtenerProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>) {
    if (response.success) {
      this.listProceso = response.data;
      let primerElemento: ProcesoElectoralResponseBean = response.data[0];
      this.form.get('proceso').setValue(primerElemento,{ emitEvent: true });
    }
  }
  obtenerUbigeoNivelUnoCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
    if (response.success) {
      this.listNivelUbigeoUno = response.data;
    }
  }
  obtenerUbigeoNivelDosCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
    if (response) {
      this.listNivelUbigeoDos = response.data;
    }
  }
  obtenerUbigeoNivelTresCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
    if (response) {
      this.listNivelUbigeoTres = response.data;
    }
  }


  buscarReporte(): void {
    if (!this.sonValidosLosDatosMinimos()) return;
    this.mensaje = '';

    let filtros: FiltroReporteMesasPorEstado = this.mapearCampos();

    this.isShowReporte = true;
    sessionStorage.setItem('loading', 'true');
    this.reporteMesasPorEstadoMesaService.obtenerReporteOrganizacionesPoliticasNacion(filtros, this.form.get('proceso').value?.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.generarReporte(response);
          } else {
            this.isShowReporte = false;
            this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
          }
          sessionStorage.setItem('loading', 'false');
        },
        error: () => {
          sessionStorage.setItem('loading', 'false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de mesa por estado de mesa.", IconPopType.ERROR);
        }
      })
  }

  mapearCampos(): FiltroReporteMesasPorEstado {
    let filtros: FiltroReporteMesasPorEstado = new FiltroReporteMesasPorEstado();
    filtros.esquema = this.form.get('proceso').value.nombreEsquemaPrincipal
    filtros.idProceso = this.form.get('proceso').value.id;
    filtros.proceso = this.form.get('proceso').value.nombre;
    filtros.idEleccion = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.id;
    filtros.codigoEleccion = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.codigo;
    filtros.eleccion = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.nombre;
    filtros.tipoReporte = this.form.get('tipoReporte').value == 0 ? null : this.form.get('tipoReporte').value;
    filtros.codigoAmbitoElectoral = this.form.get('ambitoElectoral').value.codigo;
    filtros.ambitoElectoral = this.form.get('ambitoElectoral').value.id == 0 ? null : this.form.get('ambitoElectoral').value.codigo;
    filtros.codigoCentroComputo = this.form.get('centroComputo').value.codigo;
    filtros.centroComputo = this.form.get('centroComputo').value.id == 0 ? null : this.form.get('centroComputo').value.codigo;
    filtros.codigoEstadoMesa = this.form.get('estadoMesa').value == 0 ? null : this.form.get('estadoMesa').value.codigo;
    filtros.idEstadoMesa = this.form.get('estadoMesa').value.id == 0 ? null : this.form.get('estadoMesa').value.idCodigo;
    filtros.estadoMesa = this.form.get('estadoMesa').value.id == 0 ? null : this.form.get('estadoMesa').value.nombre;
    filtros.ubigeoNivelUno = this.form.get('nivelUbigeoUno').value == "0" ? null : this.form.get('nivelUbigeoUno').value;
    filtros.ubigeoNivelDos = this.form.get('nivelUbigeoDos').value == "0" ? null : this.form.get('nivelUbigeoDos').value;
    filtros.ubigeoNivelTres = this.form.get('nivelUbigeoTres').value == "0" ? null : this.form.get('nivelUbigeoTres').value;
    filtros.porDistrito = this.form.get('porDistrito').value;
    return filtros;
  }

  generarReporte(response: GenericResponseBean<string>) {

    this.renderer.setProperty(this.midivReporte.nativeElement,'innerHTML','');

    sessionStorage.setItem('loading', 'false');

    if (response.success) {
      generarPdf(response.data, this.midivReporte);

    } else {
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  sonValidosLosDatosMinimos(): boolean {
    if (!this.form.get('proceso').value ||
      this.form.get('proceso').value === '0') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return false;
    }
    if (!this.form.get('eleccion').value ||
      this.form.get('eleccion').value === '0') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección", IconPopType.ALERT);
      return false;
    }
    if (!this.form.get('tipoReporte').value ||
      this.form.get('tipoReporte').value === '0') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un tipo de reporte", IconPopType.ALERT);
      return false;
    }

    if (this.form.get('centroComputo').value === '00') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un centro de cómputo", IconPopType.ALERT);
      return false;
    }

    if ('00' === this.form.get('ambitoElectoral').value.toString()) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un odpe", IconPopType.ALERT);
      return false;
    }

    return true;
  }

  get labelNivelUbigeoUno(): string {
    return Utility.labelFiltroUbigeo(this.form.get('nivelUbigeoUno').value, NivelUbigeo.UNO);
  }

  get labelNivelUbigeoDos(): string {
    return Utility.labelFiltroUbigeo(this.form.get('nivelUbigeoUno').value, NivelUbigeo.DOS);
  }

  get labelNivelUbigeoTres(): string {
    return Utility.labelFiltroUbigeo(this.form.get('nivelUbigeoUno').value, NivelUbigeo.TRES);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
