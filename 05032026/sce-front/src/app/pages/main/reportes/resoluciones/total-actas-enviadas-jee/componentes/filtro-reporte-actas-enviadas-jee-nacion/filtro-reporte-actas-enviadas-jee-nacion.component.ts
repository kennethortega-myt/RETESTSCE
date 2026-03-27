import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { FiltroReporteActasEnviadasJEENacionModel } from './filtro-reporte-actas-enviadas-jee-nacion.model';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { combineLatest, filter, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';

const LISTA_TIPO_CONSULTA = [
  { id: 1, codigo: '01', nombre: 'DATA ACTUAL'},
  { id: 2, codigo: '02', nombre: 'DATA HISTÓRICA'},
];
const LISTA_AGRUPADO = [
  { id: 1, codigo: '01', nombre: 'POR LOCAL DE VOTACIÓN'},
  { id: 2, codigo: '02', nombre: 'POR CENTRO DE CÓMPUTO'},
];
@Component({
  selector: 'app-filtro-reporte-actas-enviadas-jee-nacion',
  templateUrl: './filtro-reporte-actas-enviadas-jee-nacion.component.html'
})
export class FiltroReporteActasEnviadasJEENacionComponent {
  protected form: FormGroup;
  protected listProceso: Array<ProcesoElectoralResponseBean>;
  protected listEleccion: Array<EleccionResponseBean>;
  protected listCentrosComputo: Array<CentroComputoBean>;
  protected listAmbitoElectoral: Array<AmbitoBean>;
  protected listTipoConsulta: Array<any> = LISTA_TIPO_CONSULTA;
  protected listAgrupado: Array<any> = LISTA_AGRUPADO;
  protected filtroReporteModeloTres: FiltroReporteActasEnviadasJEENacionModel = new FiltroReporteActasEnviadasJEENacionModel();

  @Input({ required: true })
  public textoBoton: string = "";

  @Output()
  public eventBuscar = new EventEmitter<FiltroReporteActasEnviadasJEENacionModel>();

  private readonly destroy$ = new Subject<void>();
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly monitoreoService: MonitoreoNacionService
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    this.eventChanged();
    this.inicializarPeticiones();
  }

  inicializarPeticiones() {
    sessionStorage.setItem('loading', 'true');
    this.monitoreoService.obtenerProcesosElectorales()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.obtenerProcesosCorrecto(result)
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
    this.valueChangedCentroComputo();
    this.valueChangedAmbitoElectoral();
  }

  iniciarFormulario(): void {
    this.form = this.formBuilder.group({
      proceso: [{ value: '0', disabled: false }],
      eleccion: [{ value: '0', disabled: false }],
      ambitoElectoral: [{ value: '0', disabled: false }],
      centroComputo: [{ value: '0', disabled: false }],
      tipoConsulta: [{ value: 1, disabled: false }],
      tipoAgrupado: [{ value: 1, disabled: false }]
    });
    this.form.get('tipoConsulta').setValue(LISTA_TIPO_CONSULTA[0]);
    this.form.get('tipoAgrupado').setValue(LISTA_AGRUPADO[0]);
  }

  obtenerProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>) {
    if (response.success) {
      this.listProceso = response.data;
      let primerElemento = this.listProceso[0];
      if (primerElemento != undefined) {
        this.form.get('proceso').setValue(primerElemento, { emitEvent: true });
      }
    }
  }

  valueChangedProceso(): void {
    this.form.get('proceso').valueChanges
      .pipe(
        tap(() => {
          this.form.get('eleccion').setValue('0', { emitEvent: false });
          this.form.get('centroComputo').setValue('0', { emitEvent: false });
          this.form.get('ambitoElectoral').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listEleccion = [];
          this.listCentrosComputo = [];
          this.listAmbitoElectoral = [];

          this.filtroReporteModeloTres.eleccion = null;
          this.filtroReporteModeloTres.ambitoElectoral = null;
          this.filtroReporteModeloTres.centroComputo = null;

          if (value == 0) {
            this.filtroReporteModeloTres.proceso = null;
            return false;
          } else {
            this.filtroReporteModeloTres.proceso = {
              id: value.id,
              codigo: value.cnombre,
              nombre: value.nombre,
              esquema: value.nombreEsquemaPrincipal,
              acronimo: value.acronimo
            }
            return true;
          }
        }),
        switchMap(proceso => {
          return combineLatest([
            this.monitoreoService.obtenerEleccionesPorIdProcesoElectoral(
              proceso.id,
              proceso.nombreEsquemaPrincipal,
              proceso.acronimo)
          ])
        }
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ([elecciones]) => {
          this.obtenerEleccionesCorrecto(elecciones);
        },
      })
  }

  obtenerEleccionesCorrecto(response: GenericResponseBean<Array<EleccionResponseBean>>) {
    if (response.success) {
      this.listEleccion = response.data;
      let primerElemento = this.listEleccion[0];
      if (primerElemento != undefined) {
        this.form.get('eleccion').setValue(primerElemento);
        this.filtroReporteModeloTres.preferencial = primerElemento.preferencial;
      }
    }
  }

  valueChangedEleccion(): void {
    this.form.get('eleccion').valueChanges
      .pipe(
        tap(() => {
          this.form.get('centroComputo').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listCentrosComputo = [];

          this.filtroReporteModeloTres.ambitoElectoral = null;
          this.filtroReporteModeloTres.centroComputo = null;

          if (value == 0) {
            return false;
          } else {
            if (value == null) {
              return false;
            }
            this.filtroReporteModeloTres.eleccion = {
              id: value.id,
              codigo: value.cnombre,
              nombre: value.nombre
            }

            this.filtroReporteModeloTres.preferencial = value.preferencial;
            return true;
          }
        }),
        switchMap(eleccion => this.monitoreoService.obtenerCentroComputoPorIdEleccion(
          eleccion.id,
          this.form.get('proceso').value.nombreEsquemaPrincipal,
          this.form.get('proceso').value.acronimo
        )),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: this.obtenerCentrosComputoCorrecto.bind(this)
      })
  }

  obtenerCentrosComputoCorrecto(response: GenericResponseBean<Array<CentroComputoBean>>) {
    if (response.success) {
      this.listCentrosComputo = response.data;
      let primerElemento = this.listCentrosComputo[0];
      if (primerElemento != undefined) {
        this.form.get('centroComputo').setValue(primerElemento);
      }
    }
  }

  valueChangedCentroComputo(): void {
    this.form.get('centroComputo').valueChanges
      .pipe(
        tap(() => {
          this.form.get('ambitoElectoral').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listAmbitoElectoral = [];

          if (value == 0) {
            this.filtroReporteModeloTres.centroComputo = null;
            return false;
          } else {
            this.filtroReporteModeloTres.centroComputo = {
              id: value.id,
              codigo: value.codigo,
              nombre: value.nombre
            }
            return true;
          }
        }),
        switchMap(centroComputo => {
          return combineLatest([
            this.monitoreoService.obtenerAmbitoElectoralPorIdCentroComputo(
              centroComputo.id,
              this.form.get('proceso').value.nombreEsquemaPrincipal,
              this.form.get('proceso').value.acronimo),
          ])
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ([ambitoElectoral]) => {
          this.obtenerAmbitoElectoralCorrecto(ambitoElectoral);
        }
      });
  }

  valueChangedAmbitoElectoral() {
    this.form.get('ambitoElectoral').valueChanges
      .pipe(
        tap(() => {
        }),
        filter(value => {

          if (value == 0) {
            this.filtroReporteModeloTres.ambitoElectoral = null;
            return false;
          } else {
            this.filtroReporteModeloTres.ambitoElectoral = {
              id: value.id,
              codigo: value.codigo,
              nombre: value.nombre
            }
            return true;
          }
        }
        ),
        switchMap(ambitoElectoral => {
          let idEleccion = this.form.get('eleccion').value.id;
          return combineLatest([
            this.monitoreoService.obtenerUbigeoNivelUnoPorAmbitoElectoral(idEleccion, ambitoElectoral.id, this.form.get('proceso').value.nombreEsquemaPrincipal,this.form.get('proceso').value.acronimo)
          ])
        }),

        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ([nivelUbigeoUno]) => {
        }
      });
  }

  obtenerAmbitoElectoralCorrecto(response) {
    if (response.success) {
      this.listAmbitoElectoral = response.data;
      let primerElemento = this.listAmbitoElectoral[0];
      if (primerElemento != undefined) {
        this.form.get('ambitoElectoral').setValue(primerElemento);
      }

    }
  }

  consultar(): void {
    this.filtroReporteModeloTres.tipoConsulta = this.form.get('tipoConsulta').value;
    this.filtroReporteModeloTres.agrupado = this.form.get('tipoAgrupado').value;
    console.log("*******************")
    console.log(this.filtroReporteModeloTres)
    console.log("*******************")
    this.eventBuscar.emit(this.filtroReporteModeloTres);
  }
}
