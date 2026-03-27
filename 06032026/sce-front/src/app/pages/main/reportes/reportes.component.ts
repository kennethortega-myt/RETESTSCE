import {AuthComponent} from "../../../helper/auth-component";
import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {Usuario} from "../../../model/usuario-bean";
import {GeneralService} from "../../../service/general-service.service";
import {MatDialog} from "@angular/material/dialog";
import {ReportesService} from "../../../service/reportes.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {ProcesoElectoralResponseBean} from "../../../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../../../model/eleccionResponseBean";
import {FormBuilder, FormGroup} from "@angular/forms";
import { forkJoin, switchMap, tap} from "rxjs";
import {AmbitoBean} from "../../../model/ambitoBean";
import {ProcesoAmbitoBean} from "../../../model/procesoAmbitoBean";
import {CentroComputoBean} from "../../../model/centroComputoBean";
import {FiltroUbigeoDepartamentoBean} from "../../../model/FiltroUbigeoDepartamentoBean";
import {UbigeoDepartamentoBean} from "../../../model/UbigeoDepartamentoBean";
import {UbigeoProvinciaBean} from "../../../model/ubigeoProvinciaBean";
import {UbigeoDistritoBean} from "../../../model/ubigeoDistritoBean";
import {FiltroUbigeoProvinciaBean} from "../../../model/filtroUbigeoProvinciaBean";
import {FiltroUbigeoDistritoBean} from "../../../model/filtroUbigeoDistritoBean";
import {UtilityService} from '../../../helper/utilityService';
import {IconPopType} from '../../../model/enum/iconPopType';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
})
export class ReportesComponent extends AuthComponent implements OnInit {

  destroyRef:DestroyRef = inject(DestroyRef);

  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listAmbitos: Array<AmbitoBean>;
  public listDepartamento: Array<UbigeoDepartamentoBean>;
  public listProvincia: Array<UbigeoProvinciaBean>;
  public listDistrito: Array<UbigeoDistritoBean>;
  public ambito: ProcesoAmbitoBean;
  public listCentrosComputo: Array<CentroComputoBean>;
  public formGroupReporte: FormGroup;

  public usuario: Usuario;
  constructor(
    private generalService : GeneralService,
    private reportesService: ReportesService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
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
    this.reportesService.getListProcesos()
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

  getCentrosComputoCorrecto(response: GenericResponseBean<Array<CentroComputoBean>>){
    if (response.success){
      this.listCentrosComputo= response.data;
    }else{
      this.utilityService.mensajePopup("Reportes", response.message, IconPopType.ALERT);
    }
  }

  getCentrosComputoIncorrecto(error: any){
    this.utilityService.mensajePopup("Reportes", "No fue posible cargar los centros de computo", IconPopType.ERROR);
  }

  getListProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>){
    if (response.success){
      this.listProceso = response.data;
    }else{
      this.utilityService.mensajePopup("Reportes", response.message, IconPopType.ALERT);
    }
  }

  getListProcesosIncorrecto(error: any){
    this.utilityService.mensajePopup("Reportes", "No fue posible cargar los procesos", IconPopType.ERROR);
  }

  onProcesoChanged():void{
    const procesoControl = this.formGroupReporte.get('procesoFormControl');
    if (procesoControl){
      procesoControl.valueChanges
        .pipe(
          tap(() => {
            this.formGroupReporte.get('eleccionFormControl').setValue('0');
          }),
          switchMap(idProceso => this.reportesService.obtenerElecciones(idProceso)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: this.obtenerEleccionesCorrecto.bind(this),
          error: this.obtenerEleccionesIncorrecto.bind(this),
          complete: () => console.info("completo en obtenerElecciones")
        });
    }

  }

  onEleccionChanged():void{
    const eleccionControl = this.formGroupReporte.get('eleccionFormControl');
    if (eleccionControl){
      eleccionControl.valueChanges
        .pipe(
          tap(() => {
            this.formGroupReporte.get('ambitoFormControl').setValue('0');
          }),
          switchMap(idEleccion => {
            return forkJoin([
              this.reportesService.getListAmbitos(),
              this.reportesService.getTipoAmbitoPorProceso(this.formGroupReporte.get('procesoFormControl').value)
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
    const ambitoControl = this.formGroupReporte.get('ambitoFormControl');
    if (ambitoControl){
      ambitoControl.valueChanges
        .pipe(
          tap(() => {
            this.formGroupReporte.get('centroComputoFormControl').setValue('0');
          }),
          switchMap(idAmbito => this.reportesService.getCentrosComputo()),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: this.getCentrosComputoCorrecto.bind(this),
          error: this.getCentrosComputoIncorrecto.bind(this)
        });
    }

  }

  onCentroComputoChanged(): void{
    const centComControl = this.formGroupReporte.get('centroComputoFormControl');
    if (centComControl){
      centComControl.valueChanges
        .pipe(
          tap(() => {
            this.formGroupReporte.get('departamentoFormControl').setValue('0');
          }),
          switchMap(idCentroComputo => {
            let filtro: FiltroUbigeoDepartamentoBean = new FiltroUbigeoDepartamentoBean();
            filtro.idEleccion = this.formGroupReporte.get('eleccionFormControl').value;
            filtro.idAmbito = this.formGroupReporte.get('ambitoFormControl').value;
            filtro.idCentroComputo = this.formGroupReporte.get('centroComputoFormControl').value;
            return this.reportesService.getDepartamento(filtro);
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
    const deparControl = this.formGroupReporte.get('departamentoFormControl');
    if (deparControl){
      deparControl.valueChanges
        .pipe(
          tap(() => {
            this.formGroupReporte.get('provinciaFormControl').setValue('0');
          }),
          switchMap(idCentroComputo => {
            let filtro: FiltroUbigeoProvinciaBean = new FiltroUbigeoProvinciaBean();
            filtro.idEleccion = this.formGroupReporte.get('eleccionFormControl').value;
            filtro.idAmbito = this.formGroupReporte.get('ambitoFormControl').value;
            filtro.idCentroComputo = this.formGroupReporte.get('centroComputoFormControl').value;
            filtro.departamento = this.formGroupReporte.get('departamentoFormControl').value;
            return this.reportesService.getProvincia(filtro);
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
    const provControl = this.formGroupReporte.get('provinciaFormControl');
    if (provControl){
      provControl.valueChanges
        .pipe(
          tap(() => {
            this.formGroupReporte.get('distritoFormControl').setValue('0');
          }),
          switchMap(idCentroComputo => {
            let filtro: FiltroUbigeoDistritoBean = new FiltroUbigeoDistritoBean();
            filtro.idEleccion = this.formGroupReporte.get('eleccionFormControl').value;
            filtro.idAmbito = this.formGroupReporte.get('ambitoFormControl').value;
            filtro.idCentroComputo = this.formGroupReporte.get('centroComputoFormControl').value;
            filtro.departamento = this.formGroupReporte.get('departamentoFormControl').value;
            filtro.provincia = this.formGroupReporte.get('provinciaFormControl').value;
            return this.reportesService.getDistrito(filtro);
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: this.getDistritoCorrecto.bind(this),
          error: this.getDistritoIncorrecto.bind(this)
        });
    }
  }

  getDistritoCorrecto(response: GenericResponseBean<Array<UbigeoDistritoBean>>){
    if (response){
      this.listDistrito = response.data;
    }else{
      this.utilityService.mensajePopup("Reportes", response.message, IconPopType.ALERT);
    }
  }

  getDistritoIncorrecto(error: any){
    this.utilityService.mensajePopup("Reportes", "No fue posible cargar los distritos", IconPopType.ERROR);
  }

  getDepartamentoCorrecto(response: GenericResponseBean<Array<UbigeoDepartamentoBean>>){
    if (response){
      this.listDepartamento = response.data;
    }else{
      this.utilityService.mensajePopup("Reportes", response.message, IconPopType.ALERT);
    }
  }

  getDepartamentoIncorrecto(error: any){
    this.utilityService.mensajePopup("Reportes", "No fue posible cargar los departamentos", IconPopType.ERROR);
  }

  getProvinciaCorrecto(response: GenericResponseBean<Array<UbigeoProvinciaBean>>){
    if (response){
      this.listProvincia = response.data;
    }else{
      this.utilityService.mensajePopup("Reportes", response.message, IconPopType.ALERT);
    }
  }

  getProvinciaIncorrecto(error: any){
    this.utilityService.mensajePopup("Reportes", "No fue posible cargar las provincias", IconPopType.ERROR);
  }

  obtenerAmbitosCorrecto(response){
    this.listAmbitos = response[0].data;
    this.ambito = response[1].data;

  }
  obtenerAmbitosIncorrecto(error: any){}

  obtenerEleccionesCorrecto(response:GenericResponseBean<Array<EleccionResponseBean>>){
    this.listEleccion = response.data;
  }
  obtenerEleccionesIncorrecto(error: any){
    this.utilityService.mensajePopup("Reportes", "No fue posible cargar las elecciones", IconPopType.ERROR);
  }

}
