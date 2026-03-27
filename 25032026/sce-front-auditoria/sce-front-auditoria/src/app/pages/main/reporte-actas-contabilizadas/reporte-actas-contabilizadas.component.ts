import { Component, DestroyRef, inject, OnInit} from '@angular/core';
import {AuthComponent} from "../../../helper/auth-component";
import {ProcesoElectoralResponseBean} from "../../../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../../../model/eleccionResponseBean";
import {AmbitoBean} from "../../../model/ambitoBean";
import {UbigeoDepartamentoBean} from "../../../model/UbigeoDepartamentoBean";
import {UbigeoProvinciaBean} from "../../../model/ubigeoProvinciaBean";
import {UbigeoDistritoBean} from "../../../model/ubigeoDistritoBean";
import {ProcesoAmbitoBean} from "../../../model/procesoAmbitoBean";
import {CentroComputoBean} from "../../../model/centroComputoBean";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Usuario} from "../../../model/usuario-bean";
import {GeneralService} from "../../../service/general-service.service";
import {MatDialog} from "@angular/material/dialog";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {filter, forkJoin, switchMap, tap} from "rxjs";
import {FiltroUbigeoDepartamentoBean} from "../../../model/FiltroUbigeoDepartamentoBean";
import {FiltroUbigeoProvinciaBean} from "../../../model/filtroUbigeoProvinciaBean";
import {FiltroUbigeoDistritoBean} from "../../../model/filtroUbigeoDistritoBean";
import {ReporteContabilizacionActasService} from "../../../service/reporte-contabilizacion-actas.service";
import {FiltroContabilizacionActaBean} from "../../../model/filtroContabilizacionActaBean";
import {ActaContabilizadaResumenReporteBean} from "../../../model/actaContabilizadaResumenReporteBean";
import {ActaContabilizadaReporteBean} from "../../../model/actaContabilizadaReporteBean";
import {MesasAInstalarBean} from "../../../model/mesasAInstalarBean";
import {ActasProcesadasBean} from "../../../model/actasProcesadasBean";
import {ActasPorResolverJEEBean} from "../../../model/actasPorResolverJEEBean";
import {ActasAnuladasPorResolucionBean} from "../../../model/actasAnuladasPorResolucionBean";
import {ActaContabilizadaDetalleBean} from "../../../model/actaContabilizadaDetalleBean";
import {Utility} from "../../../helper/utility";
import {UtilityService} from "../../../helper/utilityService";
import {IconPopType} from "../../../model/enum/iconPopType";

@Component({
  selector: 'app-reporte-actas-contabilizadas',
  templateUrl: './reporte-actas-contabilizadas.component.html',
})
export class ReporteActasContabilizadasComponent extends AuthComponent implements OnInit {

  destroyRef:DestroyRef = inject(DestroyRef);

  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listAmbitos: Array<AmbitoBean>;
  public listDepartamento: Array<UbigeoDepartamentoBean>;
  public listProvincia: Array<UbigeoProvinciaBean>;
  public listDistrito: Array<UbigeoDistritoBean>;
  public ambito: ProcesoAmbitoBean;
  public listCentrosComputo: Array<CentroComputoBean>;
  public formGroupRepoActasContaFiltro: FormGroup;
  public usuario: Usuario;
  public ELEMENT_DATA: ActaContabilizadaReporteBean[];
  public ELEMENT_DATA2: ActaContabilizadaReporteBean[];
  public resumenMesaAInstalar: MesasAInstalarBean;
  public resumenActasProcesadas: ActasProcesadasBean;
  public resumenActasPorResolverJEE: ActasPorResolverJEEBean;
  public resumenActasAnuladasPorResolucion: ActasAnuladasPorResolucionBean;
  public resumenActasPorProcesar: ActaContabilizadaDetalleBean;
  public isShowReporte: boolean;
  public pdfBlob: Blob;
  public tituloAlert="Reporte actas contabilizadas";

  constructor(
    private generalService : GeneralService,
    private reporteContabilizacionActasService: ReporteContabilizacionActasService,
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
    this.formGroupRepoActasContaFiltro = this.formBuilder.group({
      procesoFormControl: ['0'],
      eleccionFormControl: ['0'],
      ambitoFormControl: ['0'],
      centroComputoFormControl: ['0'],
      departamentoFormControl: ['0'],
      provinciaFormControl: ['0'],
      distritoFormControl: ['0'],
      avanceFormControl: [{value:'',disabled: true}]
    });
    this.ELEMENT_DATA = [];
    this.ELEMENT_DATA2 = [];
    this.isShowReporte = false;
    this.resumenMesaAInstalar = new MesasAInstalarBean();
    this.resumenActasProcesadas = new ActasProcesadasBean();
    this.resumenActasPorResolverJEE = new ActasPorResolverJEEBean();
    this.resumenActasAnuladasPorResolucion = new ActasAnuladasPorResolucionBean();
    this.resumenActasPorProcesar = new ActaContabilizadaDetalleBean();
  }

  ngOnInit() {
    this.usuario = this.authentication();
    this.generalService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getListProcesosCorrecto.bind(this),
        error: this.getListProcesosIncorrecto.bind(this)
      });

    this.onProcesoChanged();
    this.onEleccionChanged();
    this.onAmbitoChanged();
    this.onCentroComputoChanged();
    this.onDepartamentoChanged();
    this.onProvinciaChanged();
    this.onDistritoChanged();

  }

  getCentrosComputoCorrecto(response: GenericResponseBean<Array<CentroComputoBean>>){
    if (response.success){
      this.listCentrosComputo= response.data;
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  getCentrosComputoIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los centros de cómputo", IconPopType.ERROR);
  }

  getListProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>){
    if (response.success){
      this.listProceso = response.data;
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  getListProcesosIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los procesos", IconPopType.ERROR);
  }

  onProcesoChanged():void{
    const procesoControl = this.formGroupRepoActasContaFiltro.get('procesoFormControl');
    if (procesoControl){
      procesoControl.valueChanges
        .pipe(
          tap(() => {
            this.formGroupRepoActasContaFiltro.get('eleccionFormControl').setValue('0');
            this.formGroupRepoActasContaFiltro.get('avanceFormControl').setValue('');
            this.isShowReporte = false;
            this.listEleccion = [];
          }),
          filter(value => value != '0'),
          switchMap(idProceso => this.generalService.obtenerElecciones(idProceso)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: this.obtenerEleccionesCorrecto.bind(this),
          error: this.obtenerEleccionesIncorrecto.bind(this)
        });
    }

  }

  onEleccionChanged():void{
    const eleccionControl = this.formGroupRepoActasContaFiltro.get('eleccionFormControl');
    if (eleccionControl){
      eleccionControl.valueChanges
        .pipe(
          tap(() => {
            this.formGroupRepoActasContaFiltro.get('ambitoFormControl').setValue('0');
            this.formGroupRepoActasContaFiltro.get('avanceFormControl').setValue('');
            this.isShowReporte = false;
            this.listAmbitos = [];
          }),
          filter(value => value != '0'),
          switchMap(idEleccion => {
            return forkJoin([
              this.generalService.getListAmbitos(),
              this.generalService.getTipoAmbitoPorProceso(this.formGroupRepoActasContaFiltro.get('procesoFormControl').value),
              this.reporteContabilizacionActasService.getPorcentajeActaContabilizada(idEleccion)
            ])
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: this.obtenerAmbitosCorrecto.bind(this),
          error: this.obtenerAmbitosIncorrecto.bind(this)
        });
    }

  }

  onAmbitoChanged():void{
    const ambitoControl = this.formGroupRepoActasContaFiltro.get('ambitoFormControl');
    if (ambitoControl){
      ambitoControl.valueChanges
        .pipe(
          tap(() => {
            this.formGroupRepoActasContaFiltro.get('centroComputoFormControl').setValue('0');
            this.isShowReporte = false;
            this.listCentrosComputo = [];
          }),
          filter(value => value != '0'),
          switchMap(idAmbito => this.generalService.getCentrosComputo()),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: this.getCentrosComputoCorrecto.bind(this),
          error: this.getCentrosComputoIncorrecto.bind(this)
        });
    }
  }

  onCentroComputoChanged(): void{
    const centroCompControl = this.formGroupRepoActasContaFiltro.get('centroComputoFormControl');
    if (centroCompControl){
      centroCompControl.valueChanges
        .pipe(
          tap(() => {
            this.formGroupRepoActasContaFiltro.get('departamentoFormControl').setValue('0');
            this.isShowReporte = false;
            this.listDepartamento = [];
          }),
          filter(value => value != '0'),
          switchMap(idCentroComputo => {
            let filtro: FiltroUbigeoDepartamentoBean = new FiltroUbigeoDepartamentoBean();
            filtro.idEleccion = this.formGroupRepoActasContaFiltro.get('eleccionFormControl').value;
            filtro.idAmbito = this.formGroupRepoActasContaFiltro.get('ambitoFormControl').value;
            filtro.idCentroComputo = this.formGroupRepoActasContaFiltro.get('centroComputoFormControl').value;
            return this.generalService.getDepartamento(filtro);
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: this.getDepartamentoCorrecto.bind(this),
          error: this.getDepartamentoIncorrecto.bind(this)
        });
    }

  }

  onDepartamentoChanged(){
    const departamentoControl = this.formGroupRepoActasContaFiltro.get('departamentoFormControl');
    if (departamentoControl){
      departamentoControl.valueChanges
        .pipe(
          tap(() => {
            this.formGroupRepoActasContaFiltro.get('provinciaFormControl').setValue('0');
            this.isShowReporte = false;
            this.listProvincia = [];
          }),
          filter(value => value != '0'),
          switchMap(idCentroComputo => {
            let filtro: FiltroUbigeoProvinciaBean = new FiltroUbigeoProvinciaBean();
            filtro.idEleccion = this.formGroupRepoActasContaFiltro.get('eleccionFormControl').value;
            filtro.idAmbito = this.formGroupRepoActasContaFiltro.get('ambitoFormControl').value;
            filtro.idCentroComputo = this.formGroupRepoActasContaFiltro.get('centroComputoFormControl').value;
            filtro.departamento = this.formGroupRepoActasContaFiltro.get('departamentoFormControl').value;
            return this.generalService.getProvincia(filtro);
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: this.getProvinciaCorrecto.bind(this),
          error: this.getProvinciaIncorrecto.bind(this)
        });
    }
  }

  onProvinciaChanged(){
    const provinciaControl = this.formGroupRepoActasContaFiltro.get('provinciaFormControl');
    if (provinciaControl){
      provinciaControl.valueChanges
        .pipe(
          tap(() => {
            this.formGroupRepoActasContaFiltro.get('distritoFormControl').setValue('0');
            this.isShowReporte = false;
            this.listDistrito = [];
          }),
          filter(value => value != '0'),
          switchMap(idCentroComputo => {
            let filtro: FiltroUbigeoDistritoBean = new FiltroUbigeoDistritoBean();
            filtro.idEleccion = this.formGroupRepoActasContaFiltro.get('eleccionFormControl').value;
            filtro.idAmbito = this.formGroupRepoActasContaFiltro.get('ambitoFormControl').value;
            filtro.idCentroComputo = this.formGroupRepoActasContaFiltro.get('centroComputoFormControl').value;
            filtro.departamento = this.formGroupRepoActasContaFiltro.get('departamentoFormControl').value;
            filtro.provincia = this.formGroupRepoActasContaFiltro.get('provinciaFormControl').value;
            return this.generalService.getDistrito(filtro);
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: this.getDistritoCorrecto.bind(this),
          error: this.getDistritoIncorrecto.bind(this)
        });
    }

  }

  onDistritoChanged(){

    const distritoControl = this.formGroupRepoActasContaFiltro.get('distritoFormControl');
    if (distritoControl) {
      distritoControl.valueChanges.subscribe(distrito => {
        this.isShowReporte = false;
      });
    }
  }

  getDistritoCorrecto(response: GenericResponseBean<Array<UbigeoDistritoBean>>){
    if (response){
      this.listDistrito = response.data;
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  getDistritoIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los distritos", IconPopType.ERROR);
  }

  getDepartamentoCorrecto(response: GenericResponseBean<Array<UbigeoDepartamentoBean>>){
    if (response){
      this.listDepartamento = response.data;
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  getDepartamentoIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los departamentos", IconPopType.ERROR);
  }

  getProvinciaCorrecto(response: GenericResponseBean<Array<UbigeoProvinciaBean>>){
    if (response){
      this.listProvincia = response.data;
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  getProvinciaIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar las provincias", IconPopType.ERROR);
  }

  obtenerAmbitosCorrecto(response){
    this.listAmbitos = response[0].data;
    if(response[1].data == null){
      this.ambito = new ProcesoAmbitoBean();
    } else{
      this.ambito = response[1].data;
    }
    this.formGroupRepoActasContaFiltro.get("avanceFormControl").setValue(response[2].data+ '%');
  }
  obtenerAmbitosIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No se pudieron obtener los ámbitos.", IconPopType.ERROR);
  }

  obtenerEleccionesCorrecto(response:GenericResponseBean<Array<EleccionResponseBean>>){
    this.listEleccion = response.data;
  }
  obtenerEleccionesIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar las elecciones.", IconPopType.ALERT);
  }

  buscarReporteActasContabilizadas(){
    if(!this.sonValidosLosDatosMinimos()) return;

    let filtroContabilizacionActaBean : FiltroContabilizacionActaBean = new FiltroContabilizacionActaBean();
    filtroContabilizacionActaBean.idProceso = this.formGroupRepoActasContaFiltro.get('procesoFormControl').value;
    filtroContabilizacionActaBean.idEleccion = this.formGroupRepoActasContaFiltro.get('eleccionFormControl').value;
    filtroContabilizacionActaBean.idAmbito = this.formGroupRepoActasContaFiltro.get('ambitoFormControl').value;
    filtroContabilizacionActaBean.idCentroComputo = this.formGroupRepoActasContaFiltro.get('centroComputoFormControl').value;

    filtroContabilizacionActaBean.departamento = this.formGroupRepoActasContaFiltro.get('departamentoFormControl').value;
    filtroContabilizacionActaBean.provincia = this.formGroupRepoActasContaFiltro.get('provinciaFormControl').value;
    filtroContabilizacionActaBean.idUbigeo = this.formGroupRepoActasContaFiltro.get('distritoFormControl').value;

    sessionStorage.setItem('loading','true');
    this.isShowReporte = true;

    this.reporteContabilizacionActasService.getReporteContabilizacionActa(filtroContabilizacionActaBean)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.reporteContabilizacionActasCorrecto.bind(this),
        error: this.reporteContabilizacionActasIncorrecto.bind(this)
      });

  }

  reporteContabilizacionActasCorrecto(response: GenericResponseBean<ActaContabilizadaResumenReporteBean>){
    sessionStorage.setItem('loading','false');
    if(response.success){
      this.ELEMENT_DATA = response.data.detalleValidos;
      this.ELEMENT_DATA2 = [];
      this.ELEMENT_DATA2.push(response.data.votosValidos, response.data.detalleNoValidos[0], response.data.detalleNoValidos[1], response.data.votosEmitidos);

      this.resumenMesaAInstalar = response.data.resumenMesasAInstalar;
      this.resumenActasProcesadas = response.data.resumenActasProcesadas;
      this.resumenActasPorResolverJEE = response.data.resumenActasPorResolverJEE;
      this.resumenActasAnuladasPorResolucion = response.data.resumenActasAnuladasPorResolucion;
      this.resumenActasPorProcesar = response.data.resumenActasPorProcesar;

    }else{
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  reporteContabilizacionActasIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.isShowReporte = false;
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de contabilización de actas.", IconPopType.ERROR);
  }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.formGroupRepoActasContaFiltro.get('procesoFormControl').value ||
      this.formGroupRepoActasContaFiltro.get('procesoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoActasContaFiltro.get('eleccionFormControl').value ||
      this.formGroupRepoActasContaFiltro.get('eleccionFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un eleccion", IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoActasContaFiltro.get('ambitoFormControl').value ||
      this.formGroupRepoActasContaFiltro.get('ambitoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una "+this.ambito.nombreTipoAmbito, IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoActasContaFiltro.get('centroComputoFormControl').value ||
      this.formGroupRepoActasContaFiltro.get('centroComputoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un centro de cómputo. ", IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoActasContaFiltro.get('departamentoFormControl').value ||
      this.formGroupRepoActasContaFiltro.get('departamentoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un departamento. ", IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoActasContaFiltro.get('provinciaFormControl').value ||
      this.formGroupRepoActasContaFiltro.get('provinciaFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una provincia. ", IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupRepoActasContaFiltro.get('distritoFormControl').value ||
      this.formGroupRepoActasContaFiltro.get('distritoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un distrito.", IconPopType.ALERT);
      return false;
    }
    return true;
  }

  descargarReporte(){

    let filtroContabilizacionActaBean : FiltroContabilizacionActaBean = new FiltroContabilizacionActaBean();
    filtroContabilizacionActaBean.idProceso = this.formGroupRepoActasContaFiltro.get('procesoFormControl').value;
    filtroContabilizacionActaBean.idEleccion = this.formGroupRepoActasContaFiltro.get('eleccionFormControl').value;
    filtroContabilizacionActaBean.idAmbito = this.formGroupRepoActasContaFiltro.get('ambitoFormControl').value;
    filtroContabilizacionActaBean.idCentroComputo = this.formGroupRepoActasContaFiltro.get('centroComputoFormControl').value;

    filtroContabilizacionActaBean.departamento = this.formGroupRepoActasContaFiltro.get('departamentoFormControl').value;
    filtroContabilizacionActaBean.provincia = this.formGroupRepoActasContaFiltro.get('provinciaFormControl').value;
    filtroContabilizacionActaBean.idUbigeo = this.formGroupRepoActasContaFiltro.get('distritoFormControl').value;

    this.reporteContabilizacionActasService.getReporteContabilizacionActaBase64(filtroContabilizacionActaBean)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.reporteContabilizacionActasBase64Correcto.bind(this),
        error: this.reporteContabilizacionActasBase64Incorrecto.bind(this)
      });
  }

  reporteContabilizacionActasBase64Correcto(response: GenericResponseBean<string>){
    if (response.success){
      this.pdfBlob = Utility.base64toBlob(response.data,'application/pdf');
      const blobUrl = URL.createObjectURL(this.pdfBlob);
      let a = document.createElement('a');
      a.href = blobUrl;
      a.target = '_blank';
      a.download = 'reporte_actas_contabilizadas.pdf';
      document.body.appendChild(a);
      a.click();
    }else{
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  reporteContabilizacionActasBase64Incorrecto(error: any){
    this.isShowReporte = false;
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible descargar el reporte de contabilización de actas.", IconPopType.ERROR);
  }

}
