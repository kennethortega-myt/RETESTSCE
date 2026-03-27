import {Component, DestroyRef, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
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
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {filter, forkJoin, switchMap, tap} from "rxjs";
import {FiltroUbigeoDepartamentoBean} from "../../../model/FiltroUbigeoDepartamentoBean";
import {FiltroUbigeoProvinciaBean} from "../../../model/filtroUbigeoProvinciaBean";
import {FiltroUbigeoDistritoBean} from "../../../model/filtroUbigeoDistritoBean";
import {ReporteAvanceMesaService} from "../../../service/reporte-avance-mesa.service";
import {FiltroAvanceMesaBean} from "../../../model/filtroAvanceMesaBean";
import {Utility} from "../../../helper/utility";
import {UtilityService} from "../../../helper/utilityService";
import {IconPopType} from "../../../model/enum/iconPopType";

@Component({
  selector: 'app-reporte-verificacion-digitacion-cc',
  templateUrl: './reporte-verificacion-digitacion-cc.component.html',
})
export class ReporteVerificacionDigitacionCcComponent extends AuthComponent implements OnInit {

  @ViewChild('idDivImagen',{ static: true }) midivReporte: ElementRef<HTMLDivElement>;

  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listAmbitos: Array<AmbitoBean>;
  public listDepartamento: Array<UbigeoDepartamentoBean>;
  public listProvincia: Array<UbigeoProvinciaBean>;
  public listDistrito: Array<UbigeoDistritoBean>;
  public ambito: ProcesoAmbitoBean;
  public listCentrosComputo: Array<CentroComputoBean>;
  public readonly formGroupReporte: FormGroup;
  public isShowReporte: boolean;
  public urlReportePdf: string;
  public pdfBlob: Blob;
  public usuario: Usuario;

  private readonly tituloAlert = "Avance de mesa por mesa";
  private readonly destroyRef:DestroyRef = inject(DestroyRef);

  constructor(
    private readonly generalService : GeneralService,
    private readonly reporteAvanceMesaService: ReporteAvanceMesaService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService
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
      numeroMesaFormControl: [{value:'',disabled: false}]
    });
  }

  ngOnInit() {
    this.usuario = this.authentication();
    this.generalService.obtenerProcesos()
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
    this.onDistritoChanged();
    this.onChangeMesa();

  }

  onChangeMesa(){
    this.formGroupReporte.get('numeroMesaFormControl')!.valueChanges
      .subscribe(mesa => {
        this.isShowReporte = false;
      })
    ;
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
    this.formGroupReporte.get('procesoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('eleccionFormControl').setValue('0');
          this.isShowReporte = false;
          this.listEleccion = [];
        }),
        filter(value => value != '0'),
        switchMap(idProceso => this.generalService.obtenerElecciones(idProceso)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerEleccionesCorrecto.bind(this),
        error: this.obtenerEleccionesIncorrecto.bind(this),
        complete: () => console.info("completo en obtenerElecciones")
      });
  }

  onEleccionChanged():void{
    this.formGroupReporte.get('eleccionFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('ambitoFormControl').setValue('0');
          this.isShowReporte = false;
          this.listAmbitos = [];
        }),
        filter(value => value != '0'),
        switchMap(idEleccion => {
          return forkJoin([
            this.generalService.getListAmbitos(),
            this.generalService.getTipoAmbitoPorProceso(this.formGroupReporte.get('procesoFormControl').value)
          ])
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.obtenerAmbitosCorrecto.bind(this),
        error: this.obtenerAmbitosIncorrecto.bind(this)
      });
  }

  onAmbitoChanged():void{
    this.formGroupReporte.get('ambitoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('centroComputoFormControl').setValue('0');
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

  onCentroComputoChanged(): void{
    this.formGroupReporte.get('centroComputoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('departamentoFormControl').setValue('0');
          this.isShowReporte = false;
          this.listDepartamento = [];
        }),
        filter(value => value != '0'),
        switchMap(idCentroComputo => {
          let filtro: FiltroUbigeoDepartamentoBean = new FiltroUbigeoDepartamentoBean();
          filtro.idEleccion = this.formGroupReporte.get('eleccionFormControl').value;
          filtro.idAmbito = this.formGroupReporte.get('ambitoFormControl').value;
          filtro.idCentroComputo = this.formGroupReporte.get('centroComputoFormControl').value;
          return this.generalService.getDepartamento(filtro);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.getDepartamentoCorrecto.bind(this),
        error: this.getDepartamentoIncorrecto.bind(this)
      });
  }

  onDepartamentoChanged(){
    this.formGroupReporte.get('departamentoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('provinciaFormControl').setValue('0');
          this.isShowReporte = false;
          this.listProvincia = [];
        }),
        filter(value => value != '0'),
        switchMap(idCentroComputo => {
          let filtro: FiltroUbigeoProvinciaBean = new FiltroUbigeoProvinciaBean();
          filtro.idEleccion = this.formGroupReporte.get('eleccionFormControl').value;
          filtro.idAmbito = this.formGroupReporte.get('ambitoFormControl').value;
          filtro.idCentroComputo = this.formGroupReporte.get('centroComputoFormControl').value;
          filtro.departamento = this.formGroupReporte.get('departamentoFormControl').value;
          return this.generalService.getProvincia(filtro);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.getProvinciaCorrecto.bind(this),
        error: this.getProvinciaIncorrecto.bind(this)
      });
  }

  onDistritoChanged():void{
    this.formGroupReporte.get('distritoFormControl')!.valueChanges
      .subscribe(mesa => {
        this.isShowReporte = false;
        this.formGroupReporte.get('numeroMesaFormControl').setValue('');
      })
    ;
  }
  onProvinciaChanged(){
    this.formGroupReporte.get('provinciaFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('distritoFormControl').setValue('0');
          this.isShowReporte = false;
          this.listDistrito = [];
        }),
        filter(value => value != '0'),
        switchMap(idCentroComputo => {
          let filtro: FiltroUbigeoDistritoBean = new FiltroUbigeoDistritoBean();
          filtro.idEleccion = this.formGroupReporte.get('eleccionFormControl').value;
          filtro.idAmbito = this.formGroupReporte.get('ambitoFormControl').value;
          filtro.idCentroComputo = this.formGroupReporte.get('centroComputoFormControl').value;
          filtro.departamento = this.formGroupReporte.get('departamentoFormControl').value;
          filtro.provincia = this.formGroupReporte.get('provinciaFormControl').value;
          return this.generalService.getDistrito(filtro);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: this.getDistritoCorrecto.bind(this),
        error: this.getDistritoIncorrecto.bind(this)
      });
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
  }
  obtenerAmbitosIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No se pudo obtener los ambitos.", IconPopType.ERROR);
  }

  obtenerEleccionesCorrecto(response:GenericResponseBean<Array<EleccionResponseBean>>){
    this.listEleccion = response.data;
  }
  obtenerEleccionesIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar las elecciones", IconPopType.ALERT);
  }

  buscarReporteMesa(){
    if(!this.sonValidosLosDatosMinimos()) return;

    let filtroAvanceMesaBean: FiltroAvanceMesaBean = new FiltroAvanceMesaBean();
    filtroAvanceMesaBean.idProceso = this.formGroupReporte.get('procesoFormControl').value;
    filtroAvanceMesaBean.idEleccion = this.formGroupReporte.get('eleccionFormControl').value;

    filtroAvanceMesaBean.idAmbito = this.formGroupReporte.get('ambitoFormControl').value === '0' ? null :
      this.formGroupReporte.get('ambitoFormControl').value;
    filtroAvanceMesaBean.idCentroComputo = this.formGroupReporte.get('centroComputoFormControl').value === '0' ? null :
      this.formGroupReporte.get('centroComputoFormControl').value;
    filtroAvanceMesaBean.departamento = this.formGroupReporte.get('departamentoFormControl').value === '0' ? null :
      this.formGroupReporte.get('departamentoFormControl').value;
    filtroAvanceMesaBean.provincia = this.formGroupReporte.get('provinciaFormControl').value === '0' ? null :
      this.formGroupReporte.get('provinciaFormControl').value;
    filtroAvanceMesaBean.idUbigeo = this.formGroupReporte.get('distritoFormControl').value === '0' ? null :
      this.formGroupReporte.get('distritoFormControl').value;
    filtroAvanceMesaBean.mesa = this.formGroupReporte.get('numeroMesaFormControl').value === '' ? null :
      this.formGroupReporte.get('numeroMesaFormControl').value

    sessionStorage.setItem('loading','true');
    this.isShowReporte = true;

    this.reporteAvanceMesaService.getReporteAvanceMesaPdf(filtroAvanceMesaBean)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getReporteAvanceMesaPdfCorrecto.bind(this),
        error: this.getReporteAvanceMesaPdfIncorrecto.bind(this)
      });
  }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.formGroupReporte.get('procesoFormControl').value ||
      this.formGroupReporte.get('procesoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupReporte.get('eleccionFormControl').value ||
      this.formGroupReporte.get('eleccionFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección", IconPopType.ALERT);
      return false;
    }
    return true;
  }

  getReporteAvanceMesaPdfCorrecto(response: GenericResponseBean<string>){
    sessionStorage.setItem('loading','false');
    if (response.success){
      this.midivReporte.nativeElement.innerHTML = '';

      this.pdfBlob = Utility.base64toBlob(response.data,'application/pdf');

      const blobUrl = URL.createObjectURL(this.pdfBlob);
      const object = document.createElement("object");
      object.setAttribute("width", "100%");
      object.setAttribute("height", "620");
      object.setAttribute("data",blobUrl);

      this.midivReporte.nativeElement.insertAdjacentElement('afterbegin', object);

    }else{
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  getReporteAvanceMesaPdfIncorrecto(error: any){
    this.isShowReporte = false;
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de avance de mesas.", IconPopType.ERROR);
  }

}
