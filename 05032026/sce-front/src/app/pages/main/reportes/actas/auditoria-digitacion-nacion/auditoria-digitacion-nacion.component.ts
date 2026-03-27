import {Component, DestroyRef, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {combineLatest, filter, switchMap, tap} from 'rxjs';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { Usuario } from 'src/app/model/usuario-bean';
import { ReporteAuditoriaDigitacionService } from 'src/app/service/reporte/reporte-auditoria-digitacion.service';
import { generarPdf } from 'src/app/transversal/utils/funciones';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ProcesoElectoralResponseBean} from '../../../../../model/procesoElectoralResponseBean';
import {EleccionResponseBean} from '../../../../../model/eleccionResponseBean';
import {CentroComputoBean} from '../../../../../model/centroComputoBean';
import {AmbitoBean} from '../../../../../model/ambitoBean';
import {UbigeoDTO} from '../../../../../model/ubigeoElectoralBean';
import {MonitoreoNacionService} from '../../../../../service/monitoreo-nacion.service';
import {FiltroAvanceMesaBean} from '../../../../../model/filtroAvanceMesaBean';
import {AuthComponent} from '../../../../../helper/auth-component';
import {FiltroReporteAuditoriaDigitacion} from '../../../../../model/reportes/filtroReporteAuditoriaDigitacion';
import { Utility } from 'src/app/helper/utility';
import { NivelUbigeo } from 'src/app/model/enum/nivel-ubigeo.enum';
import { CodigoEleccionesEnum } from 'src/app/transversal/enums/tipo-reporte.enum';


@Component({
  selector: 'app-auditoria-digitacion-nacion',
  templateUrl: './auditoria-digitacion-nacion.component.html'
})
export class AuditoriaDigitacionNacionComponent extends AuthComponent implements OnInit {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;
  public form: FormGroup;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listOdpes: Array<AmbitoBean>;
  public listNivelUbigeoUno: Array<UbigeoDTO>;
  public listNivelUbigeoDos: Array<UbigeoDTO>;
  public listNivelUbigeoTres: Array<UbigeoDTO>;
  public usuario: Usuario;

  protected mensajeDefault: string = 'Por favor, presione la opción CONSULTAR para realizar la búsqueda.';
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public isShowReporte: boolean;
  public tituloAlert = "Reporte de Auditoria de Digitación";
  public mensaje: string = this.mensajeDefault;
  constructor(private formBuilder: FormBuilder,
              private monitoreoService: MonitoreoNacionService,
              private utilityService: UtilityService,                          
              private reporteAuditoriaDigitacionService: ReporteAuditoriaDigitacionService,
  ) {
    super();
    this.form = this.formBuilder.group({
      proceso: [{ value: '0', disabled: false }],
      eleccion: [{ value: '0', disabled: false }],
      tipoReporte: [{ value: 0, disabled: false }],
      ambitoElectoral: [{ value: '-1', disabled: false }],
      centroComputo: [{ value: '-1', disabled: false }],
      nivelUbigeoUno: [{ value: '0', disabled: false }],
      nivelUbigeoDos: [{ value: '0', disabled: false }],
      nivelUbigeoTres: [{ value: '0', disabled: false }],
      mesa: [{ value: null, disabled: false }]
    })
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.inicializarPeticiones();
    this.eventChanged();
  }

  eventChanged(): void {
    this.valueChangedProceso();
    this.valueChangedEleccion();
    this.valueChangedAmbitoElectoral();
    this.valueChangedNivelUbigeoUno();
    this.valueChangedNivelUbigeoDos();
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
          this.form.get('nivelUbigeoUno').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
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
          this.form.get('nivelUbigeoUno').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listNivelUbigeoUno = [];
          this.listNivelUbigeoDos = [];
          this.listNivelUbigeoTres = [];
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
          this.form.get('proceso').value.acronimo,
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
          this.form.get('nivelUbigeoUno').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listOdpes = [];
          this.listNivelUbigeoUno = [];
          this.listNivelUbigeoDos = [];
          this.listNivelUbigeoTres = [];
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

  valueChangedAmbitoElectoral() {
    this.form.get('ambitoElectoral').valueChanges
      .pipe(
        tap(() => {
          this.form.get('nivelUbigeoUno').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
        }),
        filter(value => {
            this.listNivelUbigeoUno = [];
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
            this.monitoreoService.obtenerUbigeoNivelUnoPorAmbitoElectoral(idEleccion, ambitoElectoral.id,
              this.form.get('proceso').value.nombreEsquemaPrincipal, this.form.get('proceso').value.acronimo)
          ])
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([nivelUbigeoUno]) => {
          this.obtenerUbigeoNivelUnoCorrecto(nivelUbigeoUno);
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
            this.form.get('centroComputo').value.id
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerUbigeoNivelDosCorrecto.bind(this),
      });
  }

  valueChangedNivelUbigeoDos() {
    this.form.get('nivelUbigeoDos')!.valueChanges
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
            this.form.get('centroComputo').value.id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerUbigeoNivelTresCorrecto.bind(this)
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
    let filtros: FiltroAvanceMesaBean = this.mapearCampos();
    this.isShowReporte = true;
    sessionStorage.setItem('loading', 'true');

    this.reporteAuditoriaDigitacionService.obtenerReporteAuditoriaDigitacionNacion(filtros)
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
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte Auditoría de Digitación del Acta.", IconPopType.ERROR);
  }

  mapearCampos(): FiltroAvanceMesaBean {
    let filtros: FiltroReporteAuditoriaDigitacion = new FiltroReporteAuditoriaDigitacion();
    filtros.schema = this.form.get('proceso').value.nombreEsquemaPrincipal
    filtros.idProceso = this.form.get('proceso').value.id;
    filtros.proceso = this.form.get('proceso').value.nombre;
    filtros.acronimo = this.form.get('proceso').value.acronimo;
    filtros.idEleccion = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.id;
    filtros.codigoEleccion = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.codigo;
    filtros.preferencial = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.preferencial;
    filtros.eleccion = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.nombre;
    filtros.schema = this.form.get('proceso').value == 0 ? null : this.form.get('proceso').value.nombreEsquemaPrincipal;
    filtros.idAmbito = this.form.get('ambitoElectoral').value.id;
    filtros.ambitoElectoral = this.form.get('ambitoElectoral').value.nombre;
    filtros.codigoAmbitoElectoral = this.form.get('ambitoElectoral').value.codigo;
    filtros.idCentroComputo = this.form.get('centroComputo').value.id;
    filtros.centroComputo = this.form.get('centroComputo').value.nombre;
    filtros.codigoCentroComputo = this.form.get('centroComputo').value.codigo;
    filtros.departamento = this.form.get('nivelUbigeoUno').value == "0" ? "000000" : this.form.get('nivelUbigeoUno').value;
    filtros.provincia = this.form.get('nivelUbigeoDos').value == "0" ? "000000" : this.form.get('nivelUbigeoDos').value;
    filtros.distrito = this.form.get('nivelUbigeoTres').value == "0" ? "000000" : this.form.get('nivelUbigeoTres').value;

    filtros.mesa = this.form.get('mesa').value;
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

    if(this.form.get('mesa').value) {
      return true;
    }

    if (this.form.get('centroComputo').value.id == 0) { //NACION
      //Por rendimiento, se debe seleccionar el dpto como mínimo
      if(this.form.get('nivelUbigeoUno').value.toString() == '0') {
        this.utilityService.mensajePopup(this.tituloAlert, "Seleccione Departamento", IconPopType.ALERT);
        return false;
      }
    } else {
      if(CodigoEleccionesEnum.COD_ELEC_DIPUTADOS == this.form.get('eleccion').value.codigo ||
        CodigoEleccionesEnum.COD_ELEC_DIST_MULTIPLE == this.form.get('eleccion').value.codigo  ) {
        if (this.form.get('nivelUbigeoUno').value.toString() == '0') {
          this.utilityService.mensajePopup(this.tituloAlert, "Seleccione Departamento", IconPopType.ALERT);
          return false;
        }
      }
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
}
