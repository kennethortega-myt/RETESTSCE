import {Component, DestroyRef, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {AuthComponent} from "../../../helper/auth-component";
import {ProcesoElectoralResponseBean} from "../../../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../../../model/eleccionResponseBean";
import {AmbitoBean} from "../../../model/ambitoBean";
import {ProcesoAmbitoBean} from "../../../model/procesoAmbitoBean";
import {CentroComputoBean} from "../../../model/centroComputoBean";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Usuario} from "../../../model/usuario-bean";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {forkJoin, switchMap, tap} from "rxjs";
import {FiltroAvanceMesaBean} from "../../../model/filtroAvanceMesaBean";
import {ReporteAvanceMesaNacionService} from "../../../service/reporte-avance-mesa-nacion.service";
import {MonitoreoNacionService} from "../../../service/monitoreo-nacion.service";
import {UbigeoDTO} from "../../../model/ubigeoElectoralBean";
import {UtilityService} from '../../../helper/utilityService';
import {IconPopType} from '../../../model/enum/iconPopType';
import {Utility} from 'src/app/helper/utility';

@Component({
  selector: 'app-reporte-avance-mesa-nacion',
  templateUrl: './reporte-avance-mesa-nacion.component.html',
})
export class ReporteAvanceMesaNacionComponent extends AuthComponent implements OnInit {

  @ViewChild('idDivImagen', { static: true }) midivReporte: ElementRef<HTMLDivElement>;
  destroyRef: DestroyRef = inject(DestroyRef);

  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listAmbitos: Array<AmbitoBean>;
  public listDepartamento: Array<UbigeoDTO>;
  public listProvincia: Array<UbigeoDTO>;
  public listDistrito: Array<UbigeoDTO>;
  public ambito: ProcesoAmbitoBean;
  public listCentrosComputo: Array<CentroComputoBean>;
  public formGroupReporte: FormGroup;
  public isShowReporte: boolean;
  public urlReportePdf: string;
  public pdfBlob: Blob;
  public tituloComponente = "Reporte avance mesa nación";

  public usuario: Usuario;
  constructor(
    private reporteAvanceMesaService: ReporteAvanceMesaNacionService,
    private monitoreoService: MonitoreoNacionService,
    private formBuilder: FormBuilder,
    private utilityService: UtilityService
  ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listAmbitos = [];
    this.listDepartamento = [];
    this.listProvincia = [];
    this.listDistrito = [];
    this.ambito = new ProcesoAmbitoBean();
    this.ambito.nombreTipoAmbito = "ODPE";
    this.listCentrosComputo = [];
    this.isShowReporte = false;
    this.urlReportePdf = "";
    this.formGroupReporte = this.formBuilder.group({
      procesoFormControl: ['0'],
      eleccionFormControl: ['0'],
      ambitoFormControl: ['0'],
      centroComputoFormControl: ['0'],
      departamentoFormControl: ['0'],
      provinciaFormControl: ['0'],
      distritoFormControl: ['0'],
      numeroMesaFormControl: [{ value: '', disabled: false }]
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

    //listeners para los combos
    this.onProcesoChanged();
    this.onEleccionChanged();
    this.onAmbitoChanged();
    this.onCentroComputoChanged();
    this.onDepartamentoChanged();
    this.onProvinciaChanged();

  }

  getCentrosComputoCorrecto(response: GenericResponseBean<Array<CentroComputoBean>>) {
    if (response.success) {
      this.listCentrosComputo = response.data;
    } else {
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
  }

  getCentrosComputoIncorrecto(error: any) {
    this.utilityService.mensajePopup(this.tituloComponente,"No fue posible cargar los centros de computo",IconPopType.ERROR);
  }

  getListProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>){
    if (response.success){
      this.listProceso = response.data;
    } else {
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
  }

  getListProcesosIncorrecto(error: any) {
    this.utilityService.mensajePopup(this.tituloComponente,"No fue posible cargar los procesos",IconPopType.ERROR);
  }

  onProcesoChanged(): void {
    this.formGroupReporte.get('procesoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('eleccionFormControl').setValue({ id: '0' });
        }),
        switchMap(proceso => this.monitoreoService.obtenerEleccionesNacion(proceso.id, proceso.acronimo)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerEleccionesCorrecto.bind(this),
        error: this.obtenerEleccionesIncorrecto.bind(this),
        complete: () => console.info("completo en obtenerElecciones")
      });
  }

  onEleccionChanged(): void {
    this.formGroupReporte.get('eleccionFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('ambitoFormControl').setValue('0');
        }),
        switchMap(idEleccion => {
          return forkJoin([
            this.monitoreoService.getListAmbitos(this.formGroupReporte.get('procesoFormControl').value.acronimo),
            this.monitoreoService.getTipoAmbitoPorProceso(this.formGroupReporte.get('procesoFormControl').value.id, this.formGroupReporte.get('procesoFormControl').value.acronimo)
          ])
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerAmbitosCorrecto.bind(this),
        error: this.obtenerAmbitosIncorrecto.bind(this)
      });
  }

  onAmbitoChanged(): void {
    this.formGroupReporte.get('ambitoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('centroComputoFormControl').setValue('0');
        }),
        switchMap(idAmbito => this.monitoreoService.getCentrosComputo(this.formGroupReporte.get('procesoFormControl').value.acronimo)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.getCentrosComputoCorrecto.bind(this),
        error: this.getCentrosComputoIncorrecto.bind(this)
      });
  }

  onCentroComputoChanged(): void {
    this.formGroupReporte.get('centroComputoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('departamentoFormControl').setValue('0');
        }),
        switchMap(idCentroComputo => this.monitoreoService.obtenerDepartamentosNacion(this.formGroupReporte.get('eleccionFormControl').value.id, this.formGroupReporte.get('procesoFormControl').value.acronimo)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.getDepartamentoCorrecto.bind(this),
        error: this.getDepartamentoIncorrecto.bind(this)
      });
  }

  onDepartamentoChanged() {
    this.formGroupReporte.get('departamentoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('provinciaFormControl').setValue('0');
        }),
        switchMap(idCentroComputo => this.monitoreoService.obtenerProvinciasNacion(
          this.formGroupReporte.get('departamentoFormControl').value,
          this.formGroupReporte.get('eleccionFormControl').value.id,
          this.formGroupReporte.get('procesoFormControl').value.acronimo,
          this.formGroupReporte.get('proceso').value.nombreEsquemaPrincipal,
          this.formGroupReporte.get('ambitoElectoral').value.id)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.getProvinciaCorrecto.bind(this),
        error: this.getProvinciaIncorrecto.bind(this)
      });
  }

  onProvinciaChanged() {
    this.formGroupReporte.get('provinciaFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('distritoFormControl').setValue('0');
        }),
        switchMap(idCentroComputo => this.monitoreoService.obtenerDistritosNacion(
          this.formGroupReporte.get('provinciaFormControl').value,
          this.formGroupReporte.get('eleccionFormControl').value.id,
          this.formGroupReporte.get('procesoFormControl').value.acronimo,
          this.formGroupReporte.get('proceso').value.nombreEsquemaPrincipal,
          this.formGroupReporte.get('ambitoElectoral').value.id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.getDistritoCorrecto.bind(this),
        error: this.getDistritoIncorrecto.bind(this)
      });
  }

  getDistritoCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
    if (response) {
      this.listDistrito = response as any;
    } else {
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
  }

  getDistritoIncorrecto(error: any) {
    this.utilityService.mensajePopup(this.tituloComponente,"No fue posible cargar los distritos",IconPopType.ERROR);
  }

  getDepartamentoCorrecto(response: GenericResponseBean<any>) {
    if (response) {
      this.listDepartamento = response as any;
    } else {
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
  }

  getDepartamentoIncorrecto(error: any) {
    this.utilityService.mensajePopup(this.tituloComponente,"No fue posible cargar los departamentos",IconPopType.ERROR);
  }

  getProvinciaCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
    if (response) {
      this.listProvincia = response as any;
    } else {
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
  }

  getProvinciaIncorrecto(error: any) {
    this.utilityService.mensajePopup(this.tituloComponente,"No fue posible cargar las provincias",IconPopType.ERROR);
  }

  obtenerAmbitosCorrecto(response) {
    this.listAmbitos = response[0].data;
    if (response[1].data == null) {
      this.ambito = new ProcesoAmbitoBean();
    } else {
      this.ambito = response[1].data;
    }
  }
  obtenerAmbitosIncorrecto(error: any) {
    this.utilityService.mensajePopup(this.tituloComponente,"No se pudo obtener los ambitos.",IconPopType.ERROR);
  }

  obtenerEleccionesCorrecto(response:GenericResponseBean<Array<EleccionResponseBean>>){
    this.listEleccion = response.data;
  }
  obtenerEleccionesIncorrecto(error: any) {
    this.utilityService.mensajePopup(this.tituloComponente,"No fue posible cargar las elecciones",IconPopType.ERROR);
  }

  buscarReporteMesa() {
    if (!this.sonValidosLosDatosMinimos()) return;

    let filtroAvanceMesaBean: FiltroAvanceMesaBean = new FiltroAvanceMesaBean();
    filtroAvanceMesaBean.idProceso = this.formGroupReporte.get('procesoFormControl').value.id;
    filtroAvanceMesaBean.schema = this.formGroupReporte.get('procesoFormControl').value.nombreEsquemaPrincipal;
    filtroAvanceMesaBean.idAmbito = this.formGroupReporte.get('ambitoFormControl').value;
    filtroAvanceMesaBean.idCentroComputo = this.formGroupReporte.get('centroComputoFormControl').value;

    filtroAvanceMesaBean.departamento = this.formGroupReporte.get('departamentoFormControl').value === '0' ? null :
      this.formGroupReporte.get('departamentoFormControl').value;
    filtroAvanceMesaBean.provincia = this.formGroupReporte.get('provinciaFormControl').value === '0' ? null :
      this.formGroupReporte.get('provinciaFormControl').value;
    filtroAvanceMesaBean.idUbigeo = this.formGroupReporte.get('distritoFormControl').value === '0' ? null :
      this.formGroupReporte.get('distritoFormControl').value;
    filtroAvanceMesaBean.distrito = this.formGroupReporte.get('distritoFormControl').value === '0' ? null :
      this.formGroupReporte.get('distritoFormControl').value;

    filtroAvanceMesaBean.mesa = this.formGroupReporte.get('numeroMesaFormControl').value;
    filtroAvanceMesaBean.eleccion = this.formGroupReporte.get('eleccionFormControl').value.nombre;
    filtroAvanceMesaBean.idEleccion = this.formGroupReporte.get('eleccionFormControl').value.id;
    filtroAvanceMesaBean.proceso = this.formGroupReporte.get('procesoFormControl').value.nombre;
    this.isShowReporte = true;

    this.reporteAvanceMesaService.getReporteAvanceMesaPdf(filtroAvanceMesaBean)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getReporteAvanceMesaPdfCorrecto.bind(this),
        error: this.getReporteAvanceMesaPdfIncorrecto.bind(this)
      });
  }

  sonValidosLosDatosMinimos(): boolean {
    if (!this.formGroupReporte.get('procesoFormControl').value ||
      this.formGroupReporte.get('procesoFormControl').value === '0') {
      this.utilityService.mensajePopup(this.tituloComponente,"Seleccione un proceso",IconPopType.ALERT);
      return false;
    }
    if (!this.formGroupReporte.get('eleccionFormControl').value ||
      this.formGroupReporte.get('eleccionFormControl').value.id === '0') {
      this.utilityService.mensajePopup(this.tituloComponente,"Seleccione un eleccion",IconPopType.ALERT);
      return false;
    }
    if (!this.formGroupReporte.get('ambitoFormControl').value ||
      this.formGroupReporte.get('ambitoFormControl').value === '0') {
      this.utilityService.mensajePopup(this.tituloComponente,"Seleccione una " + this.ambito.nombreTipoAmbito,IconPopType.ALERT);
      return false;
    }
    if (!this.formGroupReporte.get('centroComputoFormControl').value ||
      this.formGroupReporte.get('centroComputoFormControl').value === '0') {
      this.utilityService.mensajePopup(this.tituloComponente,"Seleccione un centro de cómputo ",IconPopType.ALERT);
      return false;
    }
    return true;
  }

  getReporteAvanceMesaPdfCorrecto(response: GenericResponseBean<string>) {
    if (response.success) {
      this.midivReporte.nativeElement.innerHTML = '';

      this.pdfBlob = Utility.base64toBlob(response.data, 'application/pdf')

      const blobUrl = URL.createObjectURL(this.pdfBlob);
      const object = document.createElement("object");
      object.setAttribute("width", "100%");
      object.setAttribute("height", "620");
      object.setAttribute("data", blobUrl);

      this.midivReporte.nativeElement.insertAdjacentElement('afterbegin', object);

    } else {
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
  }

  getReporteAvanceMesaPdfIncorrecto(error: any) {
    this.isShowReporte = false;
    this.utilityService.mensajePopup(this.tituloComponente,"No fue posible obtener el reporte de avance de mesas.",IconPopType.ERROR);
  }
}
