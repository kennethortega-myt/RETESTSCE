import { CifraRepartidoraType } from './../../../model/enum/cifraRepartidoraType';
import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatRadioModule} from '@angular/material/radio';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { CommonModule } from '@angular/common';
import { merge, switchMap, tap } from 'rxjs';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { DistritoElectoralResponseBean } from 'src/app/model/distritoElectoralResponseBean';
import { CifraRepartidoraService } from 'src/app/service/cifraRepartidoraService';
import { Usuario } from 'src/app/model/usuario-bean';
import { AuthComponent } from 'src/app/helper/auth-component';
import { ConsolidarVotosAgrupacionRequestBean } from 'src/app/model/consolidarVotosAgrupacionRequestBean';
import { ReparteCurulesRequestBean } from 'src/app/model/reparteCurulesRequestBean';
import { ConsultaCifraRepartidoraRequestBean } from 'src/app/model/consultaCifraRepartidoraRequestBean';
import { ReporteResultadosBean } from 'src/app/model/reporteResultadosBean';
import { MatPaginator } from '@angular/material/paginator';
import { ConsultaCifraRepartidoraResponseBean } from 'src/app/model/consultaCifraRepartidoraResponseBean';
import { ModalGenericoReporteComponent } from '../../shared/modal-generico-reporte/modal-generico-reporte.component';
import { MatDialog } from '@angular/material/dialog';
import { Constantes } from 'src/app/helper/constantes';
import { DistritoParaGrabar, PopupCifraRepartidoraComponent } from './popup-cifra-repartidora/popup-cifra-repartidora.component';
import { DistritoElectoralEmpateBean } from 'src/app/model/distritoElectoralEmpateBean';
import { PopEmpateVotosData } from 'src/app/interface/popEmpateVotosData';
import { ActualizarResolucionRequestBean } from 'src/app/model/actualizarResolucionRequestBean';
import { ActualizarResolucionResponseBean } from 'src/app/model/actualizarResolucionResponseBean';


@Component({
  selector: 'app-cifra-repartidora',
  standalone: true,
  imports: [FormsModule, MatInputModule, MatSelectModule,
    MatFormFieldModule, MatRadioModule, MatTableModule,
    ReactiveFormsModule, CommonModule, MatPaginator],
  templateUrl: './cifra-repartidora.component.html',
})
export class CifraRepartidoraComponent extends AuthComponent implements OnInit {

  displayedColumns1: string[] = ['descripcionAgrupacionPolitica', 'votosValidos', 'division', 'cocienteObtenido', 'nroRepresentantes', 'observaciones'];
  dataSource: MatTableDataSource<ReporteResultadosBean>;
  @ViewChild('paginator') paginator: MatPaginator;

  public formGroupFiltro: FormGroup;
  public formGroupResumen: FormGroup;
  public destroyRef:DestroyRef = inject(DestroyRef);
  public tituloComponent: string = "Cifra Repartidora";
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listDistritoElectoral: Array<DistritoElectoralResponseBean>;
  public listEstado: Array<{id: string, descEstado: string}>;
  public listEmpate: Array<DistritoElectoralEmpateBean>;
  public usuario: Usuario;
  public totalVotosValidosTxt: string;
  public distritoElectoralNacion: DistritoElectoralResponseBean;

  public flagConsolidado: boolean;
  public flagProcesado: boolean;
  public flagEmpate: boolean;
  public flagImprimir: boolean;
  public disableCrInicial: boolean;

  protected readonly CifraRepartidoraType = CifraRepartidoraType;

  constructor(
    private readonly fb: FormBuilder,
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly utilityService:UtilityService,
    private readonly cifraRepartidoraService: CifraRepartidoraService,
    private readonly dialog: MatDialog
  ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listDistritoElectoral = [];
    this.listEmpate = [];
    this.totalVotosValidosTxt = '0';
    this.flagConsolidado = false;
    this.flagProcesado = false;
    this.flagEmpate = false;
    this.flagImprimir = false;
    this.disableCrInicial = false;
    this.distritoElectoralNacion = new DistritoElectoralResponseBean();
    this.dataSource = new MatTableDataSource([]);
    if(this.paginator) this.dataSource.paginator = this.paginator;
    this.listEstado = [
      {id: '', descEstado: 'TODOS'},
      {id: '3', descEstado: 'SIN CUPOS'},
      {id: '4', descEstado: 'EMPATE EN PRIMER LUGAR'},
      {id: '5', descEstado: 'EMPATE'},
      {id: '6', descEstado: 'NORMAL'}
    ];
    this.formGroupFiltro = this.fb.group({
      procesoFormControl: [{ value: '0', disabled: false }],
      eleccionFormControl: [{ value: '0', disabled: false }],
      distritoElectoralFormControl: [{ value: '0', disabled: false }],
      estadoFormControl: [{ value: '', disabled: false }],
      crFormControl: [{ value: CifraRepartidoraType.INICIAL, disabled: false }]
    });

    this.formGroupResumen = this.fb.group({
      cifraRepartidoraControl: [{ value: '', disabled: true }],
      totalEscaniosControl: [{ value: '', disabled: true }],
      avanceControl: [{ value: '', disabled: true }],
      horaProcesoControl: [{ value: '', disabled: true }],
      estadoControl: [{ value: '', disabled: true }],
      vallaVotosControl: [{ value: '', disabled: true }],
      vallaMiembrosControl: [{ value: '', disabled: true }],
    });
   }

  get procesoFormControl() {
    return this.formGroupFiltro.get('procesoFormControl');
  }

  get eleccionFormControl() {
    return this.formGroupFiltro.get('eleccionFormControl');
  }

  get distritoElectoralFormControl() {
    return this.formGroupFiltro.get('distritoElectoralFormControl');
  }

  get estadoFormControl() {
    return this.formGroupFiltro.get('estadoFormControl');
  }

  get crFormControl() {
    return this.formGroupFiltro.get('crFormControl');
  }

  get cifraRepartidoraControl() {
    return this.formGroupResumen.get('cifraRepartidoraControl');
  }
  get totalEscaniosControl() {
    return this.formGroupResumen.get('totalEscaniosControl');
  }

  get avanceControl() {
    return this.formGroupResumen.get('avanceControl');
  }

  get horaProcesoControl() {
    return this.formGroupResumen.get('horaProcesoControl');
  }

  get estadoControl() {
    return this.formGroupResumen.get('estadoControl');
  }

  get vallaVotosControl() {
    return this.formGroupResumen.get('vallaVotosControl');
  }

  get vallaMiembrosControl() {
    return this.formGroupResumen.get('vallaMiembrosControl');
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.inicializarPeticiones();
    this.eventChanged();
    this.setupControlListeners();
  }

setupControlListeners(): void {
  merge(
    this.procesoFormControl.valueChanges,
    this.eleccionFormControl.valueChanges,
    this.distritoElectoralFormControl.valueChanges
  )
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(() => {
    this.flagConsolidado = false;
    this.flagProcesado = false;
    this.reiniciarValores();
  });

  merge(
    this.estadoFormControl.valueChanges,
    this.crFormControl.valueChanges
  )
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(() => {
    this.reiniciarValores();
  });
}

  inicializarPeticiones() {
    this.utilityService.setLoading(true);
    this.monitoreoService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.obtenerProcesosCorrecto.bind(this),
        error: (error) => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(this.tituloComponent, "Ocurrió un error para cargar los procesos", IconPopType.ERROR);
        }
      });
  }

  eventChanged(): void {
    this.onProcesoChanged();
    this.onEleccionChanged();
  }

  onProcesoChanged():void{
    this.utilityService.setLoading(true);
    this.procesoFormControl.valueChanges
      .pipe(
        tap((idProceso) => {
          this.eleccionFormControl.setValue('0');
          this.distritoElectoralFormControl.setValue('0');
          this.listEleccion = [];
          this.listDistritoElectoral = [];
        }),
        switchMap((idProceso) => {
          if (idProceso === '0') {
            return [];
          }
          const procesoSeleccionado = this.listProceso.find(p => p.id === idProceso);
          const acronimo = procesoSeleccionado ? procesoSeleccionado.acronimo : '';
          return this.monitoreoService.obtenerEleccionesPreferencialesNacion(idProceso, acronimo);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.utilityService.setLoading(false);
          if (Array.isArray(response)) {
            this.listEleccion = [];
            this.listDistritoElectoral = [];
          } else {
            this.listEleccion = response.data;
          }
        },
        error: (error) => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(this.tituloComponent, "Ocurrió un error para cargar lista de elecciones preferenciales", IconPopType.ERROR);
        }
      });
  }

  onEleccionChanged():void{
    this.utilityService.setLoading(true);
    this.eleccionFormControl.valueChanges
      .pipe(
        tap((codEleccion) => {
          this.distritoElectoralFormControl.setValue('0');
          this.listDistritoElectoral = [];
          this.distritoElectoralNacion = new DistritoElectoralResponseBean();

          if (codEleccion == Constantes.COD_ELEC_PAR){
            this.crFormControl.setValue(CifraRepartidoraType.FINAL);
            this.disableCrInicial = true;
          }else{
            this.disableCrInicial = false;
          }
        }),
        switchMap((codEleccion) => {
          if (codEleccion === '0') {
            return [];
          }
          return this.cifraRepartidoraService.obtenerListdistritoElectoral(this.getAcronimo(),codEleccion);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.utilityService.setLoading(false);
          if (Array.isArray(response)) {
            this.listDistritoElectoral = [];
          } else {
            this.obtenerListdistritoElectoralCorrecto(response);
          }
        },
        error: (error) => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(this.tituloComponent, "Ocurrió un error para cargar lista de distritos electorales", IconPopType.ERROR);
        }
      });
  }

  private obtenerProcesosCorrecto(response:GenericResponseBean<Array<ProcesoElectoralResponseBean>>): void {
    this.utilityService.setLoading(false)
    if(!response.success){
      this.utilityService.mensajePopup(this.tituloComponent, response.message, IconPopType.ALERT);
    }else{
      this.listProceso = response.data;
    }
  }

  private obtenerListdistritoElectoralCorrecto(response:GenericResponseBean<Array<DistritoElectoralResponseBean>>){
    if(!response.success){
      this.utilityService.mensajePopup(this.tituloComponent, response.message, IconPopType.ALERT);
    }else{
      this.listDistritoElectoral = response.data;
      if(this.eleccionFormControl.value == Constantes.COD_ELEC_DIPUTADOS){
        this.distritoElectoralNacion = this.listDistritoElectoral.find(distrito => distrito.nombre == Constantes.NOMBRE_NACION_DISTRITO_ELECTORAL);
      }
    }
  }

  requisitosMinimosCR(): boolean{
    if(this.procesoFormControl.value == '0'){
      this.utilityService.mensajePopup(this.tituloComponent,"Seleccione un proceso",IconPopType.ALERT);
      return false;
    }
    if(this.eleccionFormControl.value == '0'){
      this.utilityService.mensajePopup(this.tituloComponent,"Seleccione una elección",IconPopType.ALERT);
      return false;
    }
    if(this.distritoElectoralFormControl.value == '0'){
      this.utilityService.mensajePopup(this.tituloComponent,"Seleccione un distrito electoral",IconPopType.ALERT);
      return false;
    }
    return true;
  }

  public consolidarCR(){

    if(!this.requisitosMinimosCR()) return;

    this.utilityService.setLoading(true);
    const request = new ConsolidarVotosAgrupacionRequestBean();
    request.codEleccion = this.eleccionFormControl.value;
    request.codDistritoElectoral = this.distritoElectoralFormControl.value;
    request.codigoUsuario = this.usuario.nombre;
    request.nombrePc = this.usuario.nombre
    this.cifraRepartidoraService.consolidarCR(this.getAcronimo(), request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.consolidarCRCorrecto.bind(this),
        error: (error) => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(this.tituloComponent, "Ocurrió un error al consolidar la Cifra Repartidora", IconPopType.ERROR);
        }
      });
  }

  consolidarCRCorrecto(response: GenericResponseBean<any>){
    this.utilityService.setLoading(false);
    if(!response.success){
      this.utilityService.mensajePopup(this.tituloComponent, response.message, IconPopType.ALERT);
    }else{
      this.flagConsolidado = true;
      this.flagProcesado = false;
      this.reiniciarValores();
      this.utilityService.mensajePopup(this.tituloComponent, response.message, IconPopType.CONFIRM);
    }
  }

  private getAcronimo(): string {
    const proceso = this.listProceso.find(proceso => proceso.id === this.procesoFormControl.value);
    return proceso ? proceso.acronimo || '' : '';
  }

  public procesarCR(){
    this.utilityService.setLoading(true);
    const request = new ReparteCurulesRequestBean();
    request.codEleccion = this.eleccionFormControl.value.toString();
    request.codDistritoElectoral = this.distritoElectoralFormControl.value;
    request.codigoUsuario = this.usuario.nombre;
    request.nombrePc = this.usuario.nombre;
    this.cifraRepartidoraService.reparteCurules(this.getAcronimo(),request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.reparteCurulesCorrecto.bind(this),
        error: (error) => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(this.tituloComponent, "Ocurrió un error al procesar la Cifra Repartidora", IconPopType.ERROR);
        }
      });
  }

  reparteCurulesCorrecto(response: GenericResponseBean<any>){
    this.utilityService.setLoading(false);
    if(!response.success){
      if(response.data && response.data == 2) this.flagEmpate = true;

      this.utilityService.mensajePopup(this.tituloComponent, response.message, IconPopType.ALERT);
    }else{
      this.flagProcesado = true;
      this.flagEmpate = false;
      this.utilityService.mensajePopup(this.tituloComponent, response.message, IconPopType.CONFIRM);
    }
  }

  public consultarCR(){
    if(!this.requisitosMinimosCR()) return;

    if (this.flagConsolidado && !this.flagProcesado) {
      this.utilityService.mensajePopup(this.tituloComponent, 'Debe realizar el procesamiento antes de consultar.', IconPopType.ALERT);
      return;
    }

    if(this.eleccionFormControl.value == Constantes.COD_ELEC_DIPUTADOS &&
      this.distritoElectoralFormControl.value == this.distritoElectoralNacion.codigo){
        const mensaje='Ha seleccionado un tipo de consulta que no puede ser mostrada por pantalla. ¿Desea generar un reporte múltiple?';
        this.utilityService.popupConfirmacionConAcciones(
          null,
          mensaje,
          ()=> {this.imprimirCR()},
          ()=> {return;}
        );
        return;
    }

    this.utilityService.setLoading(true);
    this.cifraRepartidoraService.obtenerConsultaCR(this.getAcronimo(),this.cifraRepartidoraRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.obtenerConsultaCRCorrecto.bind(this),
        error: error => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(this.tituloComponent, "Ocurrió un error al consultar la Cifra Repartidora", IconPopType.ERROR);
        }
      });
  }

  private obtenerConsultaCRCorrecto(response: GenericResponseBean<ConsultaCifraRepartidoraResponseBean>){
    this.utilityService.setLoading(false);
    if(!response.success){
      this.utilityService.mensajePopup(this.tituloComponent, response.message, IconPopType.ALERT);
      this.reiniciarValores()
    }else{
      this.utilityService.mensajePopup(this.tituloComponent, response.message, IconPopType.CONFIRM);
      this.dataSource.data = response.data.listReporteResultados;
      if(this.paginator) this.dataSource.paginator = this.paginator;
      this.cifraRepartidoraControl.setValue(response.data.consultaResumen.cifraRepartidora);
      this.totalEscaniosControl.setValue(response.data.consultaResumen.totalEscanios);
      this.horaProcesoControl.setValue(response.data.consultaResumen.horaProceso);
      this.estadoControl.setValue(response.data.consultaResumen.estado);
      this.avanceControl.setValue(response.data.porcentajeAvance + ' %');
      this.vallaVotosControl.setValue(response.data.consultaResumen.vallaPorcentajeVotos + ' %');
      this.vallaMiembrosControl.setValue(response.data.consultaResumen.vallaNumeroMiembros);
      this.totalVotosValidosTxt = response.data.consultaResumen.totalVotosValidos.toString() || '0';
      this.flagImprimir = true;
    }
  }

  imprimirCR() {
    if(!this.requisitosMinimosCR()) return;

    this.utilityService.setLoading(true);
    this.cifraRepartidoraService.obtenerReporteCifraRepartidora(this.getAcronimo(),this.cifraRepartidoraRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.descargarPdf.bind(this),
        error: error => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(this.tituloComponent, "No fue posible obtener el reporte de cifra repartidora.", IconPopType.ERROR);
        }
      });
  }

  descargarPdf(response: GenericResponseBean<string>) {
    this.utilityService.setLoading(false);
      if (response.success) {
        this.flagImprimir=true;
        setTimeout(() => {
          this.dialog.open(ModalGenericoReporteComponent, {
            width: '1200px',
            maxWidth: '80vw',
            disableClose: true,
            data: {
              pdfBlob: response.data,
              nombreArchivoDescarga: 'Cifra-repartidora.pdf',
              success: true
            }
          });

        }, 300);

      } else {
        this.utilityService.mensajePopup(this.tituloComponent, response.message, IconPopType.ALERT);
      }
    }

  get cifraRepartidoraRequest(): ConsultaCifraRepartidoraRequestBean {
    const request = new ConsultaCifraRepartidoraRequestBean();
    request.codEleccion = this.eleccionFormControl.value;
    request.codDistritoElectoral = this.distritoElectoralFormControl.value;
    request.estadoCifra = this.estadoFormControl.value;
    request.tipoCifra = this.crFormControl.value;
    request.idProceso = this.procesoFormControl.value;

    return request
  }

  private reiniciarValores(){
    this.dataSource.data = [];
    if(this.paginator) this.dataSource.paginator = this.paginator;
    this.cifraRepartidoraControl.setValue('');
    this.totalEscaniosControl.setValue('');
    this.horaProcesoControl.setValue('');
    this.estadoControl.setValue('');
    this.avanceControl.setValue('');
    this.vallaVotosControl.setValue('');
    this.vallaMiembrosControl.setValue('');
    this.totalVotosValidosTxt = '0';
    this.flagImprimir = false;
    this.flagEmpate = false;
  }

  obtenerListaEmpate(){
    this.utilityService.setLoading(true);
    this.cifraRepartidoraService.obtenerVotosEmpate(this.getAcronimo(),this.cifraRepartidoraRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.obtenerVotosEmpateCorrecto.bind(this),
        error: error => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(this.tituloComponent, "No fue posible obtener el reporte de cifra repartidora.", IconPopType.ERROR);
        }
      });
  }

  obtenerVotosEmpateCorrecto(response: GenericResponseBean<Array<DistritoElectoralEmpateBean>>) {
    this.utilityService.setLoading(false);
    if(!response.success){
      this.utilityService.mensajePopup(this.tituloComponent, response.message, IconPopType.ALERT);
    }else{
      this.listEmpate = response.data;
      this.openModalEmpates();
    }
  }

  openModalEmpates() {
    const procesoSeleccionado = this.listProceso.find(p => p.id === this.procesoFormControl.value);
    const tipoEleccionSeleccionado = this.listEleccion.find(p => p.codigo === this.eleccionFormControl.value);

    const data: PopEmpateVotosData = {
      proceso: procesoSeleccionado,
      tipoEleccion: tipoEleccionSeleccionado,
      listEmpate: this.listEmpate
    };

    this.dialog.open(PopupCifraRepartidoraComponent,{
      panelClass: 'popup-cifra',
      disableClose: true,
      data
    }).afterClosed().subscribe((listaParaGrabar: DistritoParaGrabar[])=>{
      if(listaParaGrabar && listaParaGrabar.length > 0){
        this.grabarResoluciones(listaParaGrabar);
      }
    });
  }

  grabarResoluciones(listaParaGrabar: DistritoParaGrabar[]){
    this.utilityService.setLoading(true);

    const request: ActualizarResolucionRequestBean= {
      usuario: this.usuario.nombre,
      resoluciones: listaParaGrabar.map(distrito => {
        return {
          distritoElectoral: distrito.distritoElectoral,
          tipoEleccion: distrito.tipoEleccion,
          agrupacionesPoliticasGanadoras: distrito.agrupacionesPoliticasGanadoras,
          numeroResolucion: distrito.numeroResolucion
        }
      })
    }

    this.cifraRepartidoraService.actualizarResolucion(this.getAcronimo(),request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.actualizarResolucionCorrecto.bind(this),
        error: error => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(this.tituloComponent, "Ocurrió un error al actualizar las resoluciones.", IconPopType.ERROR);
        }
      });
  }

  actualizarResolucionCorrecto(response: GenericResponseBean<ActualizarResolucionResponseBean>) {
    this.utilityService.setLoading(false);
    if(!response.success){
      this.utilityService.mensajePopup(this.tituloComponent, response.message, IconPopType.ALERT);
      return;
    }

    const data = response.data;
    if(data.resolucionesFallidas > 0){
      const mensaje = `${data.mensajeResumen}\n\nDetalles:\n${data.mensajeCompleto}`;
      this.utilityService.mensajePopup(this.tituloComponent, mensaje, IconPopType.ALERT);
    }else{
      this.utilityService.mensajePopup(this.tituloComponent, data.mensajeResumen, IconPopType.CONFIRM);
    }
  }

}
