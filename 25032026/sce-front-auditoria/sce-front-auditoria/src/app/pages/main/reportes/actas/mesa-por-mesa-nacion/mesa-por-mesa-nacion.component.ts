import { Component, DestroyRef, ElementRef, inject, OnInit, Renderer2, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, FormGroup } from "@angular/forms";
import { catchError, combineLatest, filter, of, switchMap, tap } from "rxjs";
import { AuthComponent } from "src/app/helper/auth-component";
import { UtilityService } from "src/app/helper/utilityService";
import { AmbitoBean } from "src/app/model/ambitoBean";
import { CentroComputoBean } from "src/app/model/centroComputoBean";
import { IconPopType } from "src/app/model/enum/iconPopType";
import { FiltroAvanceMesaBean } from "src/app/model/filtroAvanceMesaBean";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import { EleccionResponseBean } from "src/app/model/eleccionResponseBean";
import { ProcesoElectoralResponseBean } from "src/app/model/procesoElectoralResponseBean";
import { UbigeoDTO } from "src/app/model/ubigeoElectoralBean";
import { Usuario } from "src/app/model/usuario-bean";
import { MonitoreoNacionService } from "src/app/service/monitoreo-nacion.service";
import { ReporteAvanceMesaNacionService } from "src/app/service/reporte-avance-mesa-nacion.service";
import { generarPdf } from "src/app/transversal/utils/funciones";
import { CodigoEleccionesEnum } from 'src/app/transversal/enums/tipo-reporte.enum';
import { Utility } from 'src/app/helper/utility';
import { NivelUbigeo } from 'src/app/model/enum/nivel-ubigeo.enum';
import { Constantes } from "src/app/helper/constantes";
@Component({
  selector: 'app-mesa-por-mesa-nacion',
  templateUrl: './mesa-por-mesa-nacion.component.html',
})
export class MesaPorMesaNacionComponent extends AuthComponent implements OnInit {
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

  private readonly mensajeDefault: string = 'Por favor, presione la opción CONSULTAR para realizar la búsqueda.';
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public isShowReporte: boolean;
  private readonly tituloAlert = "Reporte Avance de mesa por mesa";
  public mensaje: string = this.mensajeDefault;
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly utilityService: UtilityService,
    private readonly renderer: Renderer2,
    private readonly reporteAvanceMesaService: ReporteAvanceMesaNacionService,
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
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (elecciones) => {
          if(!elecciones){
            this.utilityService.mensajePopup(this.tituloAlert, 'No fue posible obtener las elecciones para el proceso seleccionado.', IconPopType.ERROR);
            this.listEleccion = [];
            return;
          }
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
            this.monitoreoService.obtenerUbigeoNivelUnoPorAmbitoElectoral(idEleccion, ambitoElectoral.id, this.form.get('proceso').value.nombreEsquemaPrincipal,
              this.form.get('proceso').value.acronimo)
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
    this.reporteAvanceMesaService.getReporteAvanceMesaPdf(filtros)
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
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de avance de mesas.", IconPopType.ERROR);
  }

  mapearCampos(): FiltroAvanceMesaBean {
    let filtros: FiltroAvanceMesaBean = new FiltroAvanceMesaBean();
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

    const eleccionSeleccionada = this.form.get('eleccion').value;
    if (!eleccionSeleccionada || eleccionSeleccionada === '0') {
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
      if(this.form.get('nivelUbigeoUno').value.toString() === '0'){
        this.utilityService.mensajePopup(this.tituloAlert, `Seleccione ${this.labelNivelUbigeoUno}.`, IconPopType.ALERT);
        return false;
      }
    }    

    if(CodigoEleccionesEnum.COD_ELEC_DIPUTADOS == eleccionSeleccionada.codigo || CodigoEleccionesEnum.COD_ELEC_DIST_MULTIPLE == eleccionSeleccionada.codigo  ) {
        const ubigeoUno = this.form.get('nivelUbigeoUno').value;
      if(ubigeoUno.toString() === '0'){
        this.utilityService.mensajePopup(this.tituloAlert, `Seleccione ${this.labelNivelUbigeoUno}.`, IconPopType.ALERT);
        return false;
      }

      if(Constantes.COD_UBIGEO_DPTO_LIMA === ubigeoUno.toString() && this.form.get('nivelUbigeoDos').value.toString() === '0'){
        this.utilityService.mensajePopup(this.tituloAlert, `Seleccione ${this.labelNivelUbigeoDos}.`, IconPopType.ALERT);
        return false;
      }

    }

    return true;
    
  }

  get labelNivelUbigeoUno(): string {
      const seleccionado = this.form.get('nivelUbigeoUno')?.value;
      if (seleccionado && seleccionado !== '0') {
        return Utility.labelFiltroUbigeo(seleccionado.toString(), NivelUbigeo.UNO, false);
      }
      return Utility.labelFiltroUbigeo(this.listNivelUbigeoUno, NivelUbigeo.UNO, false);
    }
  
    get labelNivelUbigeoDos(): string {
      const seleccionado = this.form.get('nivelUbigeoUno')?.value;
      if (seleccionado && seleccionado !== '0') {
        return Utility.labelFiltroUbigeo(seleccionado.toString(), NivelUbigeo.DOS, false);
      }
      return Utility.labelFiltroUbigeo(this.listNivelUbigeoUno, NivelUbigeo.DOS, false);
    }
  
    get labelNivelUbigeoTres(): string {
      const seleccionado = this.form.get('nivelUbigeoUno')?.value;
      if (seleccionado && seleccionado !== '0') {
        return Utility.labelFiltroUbigeo(seleccionado.toString(), NivelUbigeo.TRES, false);
      }
      return Utility.labelFiltroUbigeo(this.listNivelUbigeoUno, NivelUbigeo.TRES, false);
    }
}
