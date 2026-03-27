import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, combineLatest, filter, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { UbigeoDTO } from 'src/app/model/ubigeoElectoralBean';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { FiltroReporteModeloUno } from './filtro-reporte-modelo-uno.model';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { UtilityService } from 'src/app/helper/utilityService';
import { Utility } from 'src/app/helper/utility';
import { NivelUbigeo } from 'src/app/model/enum/nivel-ubigeo.enum';


@Component({
  selector: 'app-filtro-reporte-modelo-uno',
  templateUrl: './filtro-reporte-modelo-uno.component.html'
})
export class FiltroReporteModeloUnoComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listAmbitoElectoral: Array<AmbitoBean>;
  public listNivelUbigeoUno: Array<UbigeoDTO>;
  public listNivelUbigeoDos: Array<UbigeoDTO>;
  public listNivelUbigeoTres: Array<UbigeoDTO>;
  public filtroReporteModeloUno: FiltroReporteModeloUno = new FiltroReporteModeloUno();

  @Input({ required: true })
  public textoBoton: string = "";

  @Input()
  public showEleccion: boolean = true;

  @Output()
  public eventBuscar = new EventEmitter<FiltroReporteModeloUno>();

  @Input()
  public nombreReporte: string = "";

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly utilityService: UtilityService,
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
    this.valueChangedNivelUbigeoUno();
    this.valueChangedNivelUbigeoDos();
    this.valueChangedNivelUbigeoTres();
  }

  iniciarFormulario(): void {
    this.form = this.formBuilder.group({
      proceso: [{ value: '0', disabled: false }],
      eleccion: [{ value: '0', disabled: false }],
      ambitoElectoral: [{ value: '0', disabled: false }],
      centroComputo: [{ value: '0', disabled: false }],
      nivelUbigeoUno: [{ value: '0', disabled: false }],
      nivelUbigeoDos: [{ value: '0', disabled: false }],
      nivelUbigeoTres: [{ value: '0', disabled: false }]
    })
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
          this.listAmbitoElectoral = [];

          this.filtroReporteModeloUno.eleccion = null;
          this.filtroReporteModeloUno.ambitoElectoral = null;
          this.filtroReporteModeloUno.centroComputo = null;
          this.filtroReporteModeloUno.ubigeoNivelUno = null;
          this.filtroReporteModeloUno.ubigeoNivelDos = null;
          this.filtroReporteModeloUno.ubigeoNivelTres = null;

          if (value == 0) {
            this.filtroReporteModeloUno.proceso = null;
            return false;
          } else {
            this.filtroReporteModeloUno.proceso = {
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
          return this.monitoreoService.obtenerEleccionesPorIdProcesoElectoral(
            proceso.id, 
            proceso.nombreEsquemaPrincipal,
            proceso.acronimo)
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
        next: (elecciones) => {
          if(!elecciones){
            this.utilityService.mensajePopup(this.nombreReporte,
              'No fue posible obtener las elecciones para el proceso seleccionado.', IconPopType.ERROR);
            this.listEleccion = [];
            return;
          }
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
        this.filtroReporteModeloUno.preferencial = primerElemento.preferencial;
      }

    }

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

          this.filtroReporteModeloUno.ambitoElectoral = null;
          this.filtroReporteModeloUno.centroComputo = null;
          this.filtroReporteModeloUno.ubigeoNivelUno = null;
          this.filtroReporteModeloUno.ubigeoNivelDos = null;
          this.filtroReporteModeloUno.ubigeoNivelTres = null;

          if (value == 0) {
            return false;
          } else {
            if (value == null) {
              return false;
            }
            this.filtroReporteModeloUno.eleccion = {
              id: value.id,
              codigo: value.cnombre,
              nombre: value.nombre
            }

            this.filtroReporteModeloUno.preferencial = value.preferencial;
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

  valueChangedNivelUbigeoUno(): void {
    this.form.get('nivelUbigeoUno').valueChanges
      .pipe(
        tap(() => {
          this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listNivelUbigeoDos = [];

          this.filtroReporteModeloUno.ubigeoNivelDos = null;
          this.filtroReporteModeloUno.ubigeoNivelTres = null;

          if (value == 0) {
            this.filtroReporteModeloUno.ubigeoNivelUno = null;
            return false;
          } else {
            this.filtroReporteModeloUno.ubigeoNivelUno = {
              id: value.id,
              codigo: value.codigo,
              nombre: value.nombre
            }
            return true;
          }
        }),
        switchMap(nivelUbigeoUno =>
          this.monitoreoService.obtenerProvinciasNacion(nivelUbigeoUno.id,
            this.form.get('eleccion').value.id,
            this.form.get('proceso').value.acronimo,
            this.form.get('proceso').value.nombreEsquemaPrincipal,
            this.form.get('ambitoElectoral').value.id
          )
        ),
        takeUntil(this.destroy$)

      )
      .subscribe({
        next: this.obtenerUbigeoNivelDosCorrecto.bind(this),
      });
  }
  obtenerUbigeoNivelDosCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
    if (response) {
      this.listNivelUbigeoDos = response.data;
      this.filtroReporteModeloUno.ubigeoNivelDos = null;
    }
  }
  valueChangedNivelUbigeoDos() {
    this.form.get('nivelUbigeoDos').valueChanges
      .pipe(
        tap(() => {
          this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listNivelUbigeoTres = [];
          this.filtroReporteModeloUno.ubigeoNivelTres = null;

          if (value == 0) {
            this.filtroReporteModeloUno.ubigeoNivelDos = null;
            return false;
          } else {
            this.filtroReporteModeloUno.ubigeoNivelDos = {
              id: value.id,
              codigo: value.codigo,
              nombre: value.nombre
            }
            return true;
          }
        }),
        switchMap(nivelUbigeoDos =>
          this.monitoreoService.obtenerDistritosNacion(
            nivelUbigeoDos.id,
            this.form.get('eleccion').value.id,
            this.form.get('proceso').value.acronimo,
            this.form.get('proceso').value.nombreEsquemaPrincipal,
            this.form.get('ambitoElectoral').value.id)),
        takeUntil(this.destroy$)

      )
      .subscribe({
        next: this.obtenerUbigeoNivelTresCorrecto.bind(this)
      });
  }
  obtenerUbigeoNivelTresCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
    if (response) {
      this.listNivelUbigeoTres = response.data;
    }
  }

  valueChangedNivelUbigeoTres() {
    this.form.get('nivelUbigeoTres').valueChanges
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: value => {
          if (value == 0) {
            this.filtroReporteModeloUno.ubigeoNivelTres = null;
          } else {
            this.filtroReporteModeloUno.ubigeoNivelTres = {
              id: value.id,
              codigo: value.codigo,
              nombre: value.nombre
            }
          }
        }
      });
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
          this.filtroReporteModeloUno.ubigeoNivelUno = this.form.get('nivelUbigeoUno').value;
          this.filtroReporteModeloUno.ubigeoNivelDos = this.form.get('nivelUbigeoDos').value;
          this.filtroReporteModeloUno.ubigeoNivelTres = this.form.get('nivelUbigeoTres').value;

          if (value == 0) {
            this.filtroReporteModeloUno.ambitoElectoral = null;
            return false;
          } else {
            this.filtroReporteModeloUno.ambitoElectoral = {
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
          this.listAmbitoElectoral = [];
          this.listNivelUbigeoUno = [];
          this.listNivelUbigeoDos = [];
          this.listNivelUbigeoTres = [];

          if (value == 0) {
            this.filtroReporteModeloUno.centroComputo = null;
            return false;
          } else {
            this.filtroReporteModeloUno.centroComputo = {
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
  obtenerAmbitoElectoralCorrecto(response) {
    if (response.success) {
      this.listAmbitoElectoral = response.data;
      let primerElemento = this.listAmbitoElectoral[0];
      if (primerElemento != undefined) {
        this.form.get('ambitoElectoral').setValue(primerElemento);
      }

    }
  }
  obtenerUbigeoNivelUnoCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
    if (response.success) {
      this.listNivelUbigeoUno = response.data;
    }
  }

  consultar(): void {
    this.eventBuscar.emit(this.filtroReporteModeloUno);
  }

  get labelNivelUbigeoUno(): string {
    return Utility.labelFiltroUbigeo(this.form.get('nivelUbigeoUno').value.codigo, NivelUbigeo.UNO);
  }

  get labelNivelUbigeoDos(): string {
    return Utility.labelFiltroUbigeo(this.form.get('nivelUbigeoUno').value.codigo, NivelUbigeo.DOS);
  }

  get labelNivelUbigeoTres(): string {
    return Utility.labelFiltroUbigeo(this.form.get('nivelUbigeoUno').value.codigo, NivelUbigeo.TRES);
  }

  ngOnDestroy() {
    this.destroy$.next(); // Emits signal to unsubscribe
    this.destroy$.complete(); // Completes the subject
  }
}
