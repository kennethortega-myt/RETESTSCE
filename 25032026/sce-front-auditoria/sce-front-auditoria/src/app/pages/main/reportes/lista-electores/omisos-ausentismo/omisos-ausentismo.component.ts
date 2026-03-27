import {Component, DestroyRef, ElementRef, inject, OnInit, Renderer2, ViewChild} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {combineLatest, filter, switchMap, tap} from 'rxjs';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { Usuario } from 'src/app/model/usuario-bean';
import { generarPdf } from 'src/app/transversal/utils/funciones';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ProcesoElectoralResponseBean} from '../../../../../model/procesoElectoralResponseBean';
import {EleccionResponseBean} from '../../../../../model/eleccionResponseBean';
import {CentroComputoBean} from '../../../../../model/centroComputoBean';
import {AmbitoBean} from '../../../../../model/ambitoBean';
import {MonitoreoNacionService} from '../../../../../service/monitoreo-nacion.service';
import {AuthComponent} from '../../../../../helper/auth-component';
import {ReporteOmisosAusentismoService} from '../../../../../service/reporte/reporte-omisos-ausentismo.service';
import {FiltroOmisosAusentismoBean} from '../../../../../model/filtroOmisosAusentismoBean';


@Component({
  selector: 'app-omisos-ausentismo',
  templateUrl: './omisos-ausentismo.component.html',
})
export class OmisosAusentismoComponent extends AuthComponent implements OnInit {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;
  public form: FormGroup;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listOdpes: Array<AmbitoBean>;
  public listTipoReporte: any[];
  public usuario: Usuario;
  public isShowReporte: boolean;

  private readonly mensajeDefault: string = 'Por favor, presione la opción CONSULTAR para realizar la búsqueda.';
  public mensaje: string = this.mensajeDefault;

  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly tituloAlert = "Reporte de Comparación Omisos Ausentismo";

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly utilityService: UtilityService,
    private readonly renderer: Renderer2,
    private readonly reporteOmisosAusentismoService: ReporteOmisosAusentismoService,
  ) {
    super();
    this.form = this.formBuilder.group({
      proceso: [{ value: '0', disabled: false }],
      eleccion: [{ value: '0', disabled: false }],
      tipoReporte: [{ value: 0, disabled: false }],
      ambitoElectoral: [{ value: '-1', disabled: false }],
      centroComputo: [{ value: '-1', disabled: false }],
    });
    this.listTipoReporte = [{ id: 1, nombre: 'TODOS' }];
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.inicializarPeticiones();
    this.eventChanged();
    this.form.get('tipoReporte').setValue(this.listTipoReporte[0]);
  }

  eventChanged(): void {
    this.valueChangedProceso();
    this.valueChangedEleccion();
    this.valueChangedCentroComputo();
  }

  inicializarPeticiones() {
    sessionStorage.setItem('loading', 'true');
    this.monitoreoService.obtenerProcesosElectorales()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => { this.obtenerProcesosCorrecto(result) },
        error: (error) => sessionStorage.setItem('loading', 'false')
      });
  }

  obtenerProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>) {
    if (response.success) {
      this.listProceso = response.data;
      let primerElemento = this.listProceso[0];
      this.form.get('proceso').setValue(primerElemento);
    }
    sessionStorage.setItem('loading', 'false')
  }

  valueChangedProceso(): void {
    this.form.get('proceso').valueChanges
      .pipe(
        tap(() => {
          this.form.get('eleccion').setValue('0', { emitEvent: false });
          this.form.get('ambitoElectoral').setValue('-1', { emitEvent: false });
          this.form.get('centroComputo').setValue('-1', { emitEvent: false });
        }),
        filter(value => {
          this.listEleccion = [];
          this.listCentrosComputo = [];
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
            ])
          }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([elecciones]) => {
          this.obtenerEleccionesCorrecto(elecciones);
        },
      })
  }

  valueChangedEleccion(): void {
    this.form.get('eleccion').valueChanges
      .pipe(
        tap(() => {
          this.form.get('centroComputo').setValue('-1', { emitEvent: false });
        }),
        filter(value => {
          this.listCentrosComputo = [];
          if (value == undefined) {
            return false;
          }
          if (value == 0) {
            return false;
          } else {
            return true;
          }
        }),
        switchMap(eleccion => this.monitoreoService.obtenerCentroComputoPorIdEleccion(
          eleccion.id,
          this.form.get('proceso').value.nombreEsquemaPrincipal,
          this.form.get('proceso').value.acronimo
        )),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerCentrosComputoCorrecto.bind(this)
      })
  }

  valueChangedCentroComputo(): void {
    this.form.get('centroComputo').valueChanges
      .pipe(
        tap(() => {
          this.form.get('ambitoElectoral').setValue('-1', { emitEvent: false });
        }),
        filter(value => {
          this.listOdpes = [];
          if (value == 0) {
            return false;
          } else {
            return true;
          }
        }),
        switchMap(centroComputo => {
            return combineLatest([
              this.monitoreoService.obtenerAmbitoElectoralPorIdCentroComputo(
                centroComputo.id,
                this.form.get('proceso').value.nombreEsquemaPrincipal,
                this.form.get('proceso').value.acronimo)
            ])
          }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([ambitoElectoral]) => {
          this.obtenerAmbitoElectoralCorrecto(ambitoElectoral);
        }
      });
  }

  obtenerAmbitoElectoralCorrecto(response) {
    if (response.success) {
      this.listOdpes = response.data;
      let primerElemento = this.listOdpes[0];
      this.form.get('ambitoElectoral').setValue(primerElemento);
    }
  }

  obtenerEleccionesCorrecto(response: GenericResponseBean<Array<EleccionResponseBean>>) {
    if (response.success) {
      this.listEleccion = response.data;
      let primerElemento = this.listEleccion[0];
      this.form.get('eleccion').setValue(primerElemento);
    }
  }

  obtenerCentrosComputoCorrecto(response: GenericResponseBean<Array<CentroComputoBean>>) {
    if (response.success) {
      this.listCentrosComputo = response.data;
      let primerElemento = this.listCentrosComputo[0];
      this.form.get('centroComputo').setValue(primerElemento);
    }
  }

  buscarReporte(): void {
    if (!this.sonValidosLosDatosMinimos()) return;

    this.mensaje = '';
    let filtros: FiltroOmisosAusentismoBean = this.mapearCampos();
    let acronimo = this.form.get('proceso').value.acronimo
    this.isShowReporte = true;
    sessionStorage.setItem('loading', 'true');

    this.reporteOmisosAusentismoService.obtenerReporteOmisosAusentismo(filtros, acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getReporteAvanceMesaPdfCorrecto.bind(this),
        error: this.getReporteAvanceMesaPdfIncorrecto.bind(this)
      });

  }

  getReporteAvanceMesaPdfCorrecto(response: GenericResponseBean<string>) {
    sessionStorage.setItem('loading', 'false');
    if (response.success) {
      this.generarReporte(response)
    } else {
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      this.mensaje = this.mensajeDefault;
    }
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

  getReporteAvanceMesaPdfIncorrecto(error: any) {
    this.isShowReporte = false;
    sessionStorage.setItem('loading', 'false');
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte Comparación Omisos Ausentismo.", IconPopType.ERROR);
  }

  mapearCampos(): FiltroOmisosAusentismoBean {
    let filtros: FiltroOmisosAusentismoBean = new FiltroOmisosAusentismoBean();
    filtros.esquema = this.form.get('proceso').value.nombreEsquemaPrincipal
    filtros.idProceso = this.form.get('proceso').value.id;
    filtros.proceso = this.form.get('proceso').value.nombre;
    filtros.idEleccion = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.id;
    filtros.preferencial = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.preferencial;
    filtros.eleccion = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.nombre;
    filtros.esquema = this.form.get('proceso').value == 0 ? null : this.form.get('proceso').value.nombreEsquemaPrincipal;
    filtros.idAmbito = this.form.get('ambitoElectoral').value.id;
    filtros.ambitoElectoral = this.form.get('ambitoElectoral').value.nombre;
    filtros.codigoAmbitoElectoral = this.form.get('ambitoElectoral').value.codigo;
    filtros.idCentroComputo = this.form.get('centroComputo').value.id;
    filtros.centroComputo = this.form.get('centroComputo').value.nombre;
    filtros.codigoCentroComputo = this.form.get('centroComputo').value.codigo;
    return filtros;
  }

  sonValidosLosDatosMinimos(): boolean {

    if (!this.form.get('proceso').value ||
      this.form.get('proceso').value === '0') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un Proceso", IconPopType.ALERT);
      return false;
    }
    if (!this.form.get('eleccion').value ||
      this.form.get('eleccion').value === '0') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una Elección", IconPopType.ALERT);
      return false;
    }


    if (this.form.get('centroComputo').value === '-1') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un Centro de Cómputo", IconPopType.ALERT);
      return false;
    }

    if ('-1' === this.form.get('ambitoElectoral').value.toString()) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una ODPE", IconPopType.ALERT);
      return false;
    }

    return true;
  }
}
