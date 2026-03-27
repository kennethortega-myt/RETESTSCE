import {Component, OnInit, OnDestroy, ViewChild, Renderer2, DestroyRef, inject} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {firstValueFrom, Subject} from 'rxjs';
import { PopControlSCComponent } from './pop-control-sc/pop-control-sc.component';
import { GeneralService } from 'src/app/service/general-service.service';
import { Constantes } from 'src/app/helper/constantes';
import { Utility } from 'src/app/helper/utility';
import {ControlDigitalizacionService} from "../../../service/control-digitalizacion.service";
import {ProcesoElectoralResponseBean} from "../../../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../../../model/eleccionResponseBean";
import {DigitizationListActasItemBean} from "../../../model/digitizationListActasItemBean";
import {DigitizationApproveMesaRequestBean} from "../../../model/digitizationApproveMesaRequestBean";
import {DigitizationRejectMesaRequestBean} from "../../../model/digitizationRejectMesaRequestBean";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {DigitizationSummaryResponseBean} from "../../../model/digitizationSummaryResponseBean";
import {DigitizationGetFilesResponse} from "../../../model/digitizationGetFilesResponse";
import {DialogoConfirmacionComponent} from "../dialogo-confirmacion/dialogo-confirmacion.component";
import {PopMensajeData} from "../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../shared/pop-mensaje/pop-mensaje.component";
import {HttpErrorResponse} from '@angular/common/http';
import {VerActaService} from '../../../helper/verActaService';
import {IconPopType} from '../../../model/enum/iconPopType';

@Component({
  selector: 'app-control-sc',
  templateUrl: './control-sc.component.html'
})
export class ControlSCComponent implements OnInit, OnDestroy {

  @ViewChild("txtProceso") txtProceso: any;
  @ViewChild("txtEleccion") txtEleccion: any;
  @ViewChild("txtEstadoEscaneo") txtEstadoEscaneo: any;

  destroy$: Subject<boolean> = new Subject<boolean>();
  destroyRef:DestroyRef = inject(DestroyRef);

  listProceso: Array<ProcesoElectoralResponseBean>;
  listEleccion: Array<EleccionResponseBean>;
  listaActas: Array<DigitizationListActasItemBean>;

  aprobarMesaBean: DigitizationApproveMesaRequestBean;
  rechazarMesaBean: DigitizationRejectMesaRequestBean;
  actaSeleccionada: DigitizationListActasItemBean;
  indiceActaSeleccionada: number = 0;

  idProceso: number;
  codigoEleccion: string;
  constantes = Constantes;

  totalActasValidadas: string;
  totalActasParaRedigitalizar: string;
  TotalActasPorVerificar:string;
  nroMesa: string;
  tamanioEscrutinio: number = 100;
  tamanioInstalacion: number = 100;
  anguloActaInstalacion: number = 0;
  anguloActaEscrutinio: number = 0;
  titulo: string = "Sin documentos cargados";
  pngImageUrlAE: string="";
  pngImageUrlAI: string="";

  isVisibleResumen: boolean;
  isVisibleListaActas: boolean;
  isVisibleBtnAprobar: boolean;
  isVisibleBtnFinalizarAtencion: boolean;
  isVisibleBtnRechazar: boolean;
  isVisibleBtnCargarDocumentos: boolean;
  //isVerAnuncio: boolean
  isDigitalizarActa: boolean;
  flagErrorConversionInstalacion: boolean;
  flagErrorConversionEscrutinio: boolean;


  constructor(
    public dialog: MatDialog,
    private readonly generalService: GeneralService,
    private readonly controlDigitalizacionService:ControlDigitalizacionService,
    private readonly renderer: Renderer2,
    private readonly verActaService: VerActaService
  ) {
    this.listProceso = [];
    this.listEleccion = [];
    this.listaActas = [];
    this.idProceso = 0;
    this.codigoEleccion = '0';
    this.totalActasValidadas = Utility.rellenarCerosAIzquierda(0,4);
    this.totalActasParaRedigitalizar = Utility.rellenarCerosAIzquierda(0,4);
    this.TotalActasPorVerificar = Utility.rellenarCerosAIzquierda(0,4);
    this.nroMesa = "000000";
    this.aprobarMesaBean = new DigitizationApproveMesaRequestBean();
    this.rechazarMesaBean = new DigitizationRejectMesaRequestBean();
    this.isVisibleResumen = false;
    this.isVisibleListaActas = false;
    this.isDigitalizarActa = false;
    this.isVisibleBtnAprobar = false;
    this.isVisibleBtnFinalizarAtencion = false;
    this.isVisibleBtnRechazar = false;
    this.isVisibleBtnCargarDocumentos = true;
    this.actaSeleccionada = new DigitizationListActasItemBean();

    this.flagErrorConversionInstalacion = false;
    this.flagErrorConversionEscrutinio = false;
  }

  ngOnInit(): void {
    this.inicializarPeticiones();
  }

  openDialogCtrl(tipoActa:string) {
    let imgActa="";
    let nroMesa = this.nroMesa;
    let txtLeyenda :boolean = false;
    if(tipoActa=="AE"){
      imgActa=this.pngImageUrlAE;
      txtLeyenda = this.actaSeleccionada.acta1Status == Constantes.CE_ESTADO_ACTA_VALIDADO;
    }else if(tipoActa=="AI"){
      imgActa=this.pngImageUrlAI;
      txtLeyenda = this.actaSeleccionada.acta2Status == Constantes.CE_ESTADO_ACTA_VALIDADO;
    }
    const dialogRef = this.dialog.open(PopControlSCComponent, {
      width: '1360px',
      maxWidth: '98%',
      disableClose: true,
      data:{
        imgActa: imgActa,
        tipoActa:tipoActa,
        nroMesa:nroMesa,
        isVisibleTxtLeyenda: txtLeyenda
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  inicializarPeticiones() {
    this.generalService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.obtenerProcesosCorrecto.bind(this),
        error: this.obtenerProcesosIncorrecto.bind(this)
      });
  }

  mensajePopup(title:string , mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:title,
      mensaje:mensaje,
      icon:icon,
      success:true
    }
    this.dialog.open(PopMensajeComponent, {
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          //aceptar
        }
      });
  }

  obtenerProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>){
    if(response.success){
      this.listProceso= response.data;
    }else{
      this.mensajePopup("Control de Digitalización", "Ocurrió un error al cargar la lista de actas. ", IconPopType.ALERT);
    }
  }
  obtenerProcesosIncorrecto(response: any){
    this.mensajePopup("Control de Digitalización", "Ocurrió un error para obtener la lista de procesos.", IconPopType.ERROR);
  }

  verActa(acta: DigitizationListActasItemBean){
    sessionStorage.setItem('loading','false');
    this.actaSeleccionada = acta;
    this.indiceActaSeleccionada = this.listaActas.findIndex(x=>x.mesa==this.actaSeleccionada.mesa);
    this.pngImageUrlAI = "";
    this.pngImageUrlAE = "";
    this.flagErrorConversionInstalacion = false;
    this.flagErrorConversionEscrutinio = false;
    this.isVisibleBtnAprobar = false;

    this.cargarImagenes(this.actaSeleccionada.acta1FileId, this.actaSeleccionada.acta2FileId);

    this.nroMesa = this.actaSeleccionada.mesa;

    this.actualizarBotones(this.actaSeleccionada.acta1Status, this.actaSeleccionada.acta2Status,
      this.actaSeleccionada.estado);

    this.isDigitalizarActa = true;

  }


  cargarImagenes(acta1FileId: number, acta2FileId: number){
    sessionStorage.setItem('loading','true');
    if(acta1FileId == null){
      this.flagErrorConversionEscrutinio = true;
      this.isVisibleBtnAprobar = true;
      this.isVisibleBtnRechazar = true;
    }
    if(acta2FileId == null ){
      this.flagErrorConversionInstalacion = true;
      this.isVisibleBtnAprobar = true;
      this.isVisibleBtnRechazar = true;
    }
    this.controlDigitalizacionService.getFilesPng(acta1FileId,acta2FileId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getFilesPngCorrecto.bind(this),
        error: this.getFilesPngIncorrecto.bind(this)
      });
  }

  getFilesPngCorrecto(response: GenericResponseBean<DigitizationGetFilesResponse>){
    sessionStorage.setItem('loading','true');
    if (!response.success){
      this.errorGetFilesControles();
      this.mensajePopup("Control de Digitalización", response.message, IconPopType.ALERT);
    }
    else{
      if (response.data.acta1File=== null){
        this.flagErrorConversionEscrutinio = true;
        this.isVisibleBtnAprobar = true;
        this.isVisibleBtnRechazar = true;
        this.mensajePopup("Control de Digitalización", response.message, IconPopType.ALERT);
      }else{
        let pngBlobAE = Utility.base64toBlob(response.data.acta1File,'image/png');
        this.pngImageUrlAE = URL.createObjectURL(pngBlobAE);
        this.reiniciarAnguloActaEscrutinio();
      }
      if (response.data.acta2File === null){
        this.flagErrorConversionInstalacion = true;
        this.isVisibleBtnAprobar = true;
        this.isVisibleBtnRechazar=true;
        this.mensajePopup("Control de Digitalización", response.message, IconPopType.ALERT);
      }else{
        let pngBlobAI = Utility.base64toBlob(response.data.acta2File,'image/png');
        this.pngImageUrlAI = URL.createObjectURL(pngBlobAI);
        this.reiniciarAnguloActaInstalacion();
      }
    }

    sessionStorage.setItem('loading','false');
  }
  getFilesPngIncorrecto(reason: any){
    this.errorGetFilesControles();
    this.mensajePopup("Control de Digitalización", reason.error.message, IconPopType.ERROR);
  }

  errorGetFilesControles(){
    this.isVisibleBtnAprobar = false;
    this.isVisibleBtnRechazar = false;

    this.flagErrorConversionEscrutinio = true;

    this.flagErrorConversionInstalacion = true;
    sessionStorage.setItem('loading','false');
  }

  actualizarBotones(acta1Status: string, acta2Status: string, estado: string){

    if(estado == Constantes.CE_ESTADO_MESA_DIGITALIZADO || estado == Constantes.CE_ESTADO_MESA_DIGITALIZADO_PARCIAL){
      if(acta1Status == Constantes.CE_ESTADO_ACTA_VALIDADO && acta2Status == Constantes.CE_ESTADO_ACTA_VALIDADO){
        this.isVisibleBtnAprobar = true;
      }else{
        this.isVisibleBtnAprobar = false;
      }
      this.isVisibleBtnRechazar = true;
    }else{
      this.isVisibleBtnAprobar = false;
      this.isVisibleBtnRechazar = false;
    }
  }

  obtenerEleccion() {
    if (!this.idProceso || this.idProceso == 0) {
      this.limpiarDatos();
      this.listEleccion = [];
      this.codigoEleccion = "0";
      return;
    }
    if (this.idProceso > 0) {
      this.generalService.obtenerElecciones(this.idProceso)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: this.obtenerEleccionesCorrecto.bind(this),
          error: this.obtenerEleccionesIncorrecto.bind(this)
        });
    }
  }

  obtenerEleccionesCorrecto(response: GenericResponseBean<Array<EleccionResponseBean>>){
    if (response.success){
      this.listEleccion = response.data;
      this.codigoEleccion= '0';
      this.limpiarDatos();
    }else{
      this.mensajePopup("Control de Digitalización", "Ocurrió un error para obtener la lista de elecciones.", IconPopType.ALERT);
    }

  }
  obtenerEleccionesIncorrecto(response: any){
    this.mensajePopup("Control de Digitalización", "Ocurrió un error para obtener la lista de elecciones.", IconPopType.ERROR);
  }

  sonValidosLosDatos():boolean{
    if(!this.idProceso || this.idProceso === 0){
      this.mensajePopup("Control de Digitalización", "Seleccione el proceso.", IconPopType.ALERT);
      return false;
    }
    if(!this.codigoEleccion || this.codigoEleccion === "0"){
      this.mensajePopup("Control de Digitalización", "Seleccione la elección", IconPopType.ALERT);
      return false;
    }
    return true;
  }

  confirmarAprobarMesa(): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        disableClose: true,
        data: `¿Está seguro de continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.aprobarMesa();
        }
      });
  }

  aprobarMesa(){
    sessionStorage.setItem('loading','true');
    this.aprobarMesaBean.actaId=this.actaSeleccionada.actaId;
    this.aprobarMesaBean.fileId1=this.actaSeleccionada.acta1FileId;
    this.aprobarMesaBean.fileId2=this.actaSeleccionada.acta2FileId;
    this.aprobarMesaBean.estado = this.actaSeleccionada.estado;

    this.controlDigitalizacionService.aprobarMesaCeleste(this.codigoEleccion,this.aprobarMesaBean)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.aprobarMesaCorrecto.bind(this),
        error: this.aprobarMesaIncorrecto.bind(this),
        complete: () => console.info("completo en aprobarMesa")
      });
  }

  aprobarMesaCorrecto(response: GenericResponseBean<boolean>){
    sessionStorage.setItem('loading','false');
    if(response.success){
      let popMensaje :PopMensajeData= {
        title:"Control de Digitalización",
        mensaje:response.message,
        icon:IconPopType.CONFIRM,
        success:true
      }
      this.dialog.open(PopMensajeComponent, {
        disableClose: true,
        data: popMensaje
      })
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {
            this.siguienteActaAsync();
          }
        });

    }else{
      console.log("estado de aprobacion error");
      this.mensajePopup("Control de Digitalización", response.message, IconPopType.ERROR);
    }
  }

  async siguienteActaAsync(){
    await this.cargarDocumentos();
    if(this.listaActas.length!==0){
      let acta = this.siguienteActa2();
      this.verActa(acta);
    }
  }
  aprobarMesaIncorrecto(response: HttpErrorResponse){
    sessionStorage.setItem('loading','false');
    if (response.error?.message) {
      this.mensajePopup("Control de Digitalización",response.error.message, IconPopType.ERROR);
    } else {
      this.mensajePopup("Control de Digitalización", "Ocurrió un error interno al aprobar la mesa.", IconPopType.ERROR);
    }

  }

  confirmarFinalizarAtencion(): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.finalizarAtencion();
        }
      });
  }

  finalizarAtencion(){
    this.controlDigitalizacionService.finalizarAtencion(this.codigoEleccion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.finalizarAtencionCorrecto.bind(this),
        error: this.finalizarAtencionIncorrecto.bind(this)
      });
  }

  finalizarAtencionCorrecto(response: GenericResponseBean<string>){
    if (!response.success){
      this.mensajePopup("Control de Digitalización", response.message, IconPopType.ALERT);
    }else{
      this.limpiarDatos();
    }
  }

  finalizarAtencionIncorrecto(response: HttpErrorResponse){

    if (response.error?.message) {
      this.mensajePopup("Control de Digitalización",response.error.message, IconPopType.ERROR);
    } else {
      this.mensajePopup("Control de Digitalización", "Ocurrió un error interno al finalizar la atención", IconPopType.ERROR);
    }
  }

  siguienteActa2(){
    if(this.indiceActaSeleccionada+1>this.listaActas.length){
      this.indiceActaSeleccionada=0;
    }
    return this.listaActas[this.indiceActaSeleccionada];
  }

  async cargarDocumentos(){
    if(!this.sonValidosLosDatos()) return;
    this.cargarResumen();
    await this.obtenerListaActasAsync();

    if (this.listaActas.length===0){
      this.mensajePopup("Control de Digitalización", "No existen registros", IconPopType.ALERT);
      this.limpiarDatos();
    }else{
      if (this.listaActas.length > 1){
        this.listaActas = this.listaActas.filter(acta => {
          return acta.estado != Constantes.CE_ESTADO_MESA_PENDIENTE &&
            acta.estado != Constantes.CE_ESTADO_MESA_OBSERVADO_RESOLUCION &&
            acta.estado != Constantes.CE_ESTADO_MESA_APROBADO_RESOLUCION;
        });
        this.listaActas.sort(this.compararPorEstadoYMesa);
      }
      let documentoCargado= this.listaActas.length == 1 ? " Documento Cargado" : " Documentos Cargados";
      this.titulo= this.listaActas.length+documentoCargado;
      this.isVisibleBtnFinalizarAtencion = this.listaActas.length !== 0;
      this.isVisibleListaActas = true;
      this.isVisibleBtnCargarDocumentos = true;

      console.log("fin cargarDocumentos")
    }
  }

  async obtenerListaActasAsync(){
    try {
      this.listaActas = await firstValueFrom(this.controlDigitalizacionService.obtenerActasCeleste(this.codigoEleccion));
    }catch (error){
      this.mensajePopup("Control de Digitalización", "Ocurrió un error para obtener la lista de actas.", IconPopType.ALERT);
      this.listaActas = [];
    }
  }

  cargarResumen(): void{
    this.controlDigitalizacionService.obtenerResumenACeleste(this.codigoEleccion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.obtenerResumenCorrecto.bind(this),
        error: this.obtenerResumenIncorrecto.bind(this)
      });
  }

  obtenerResumenCorrecto(response: DigitizationSummaryResponseBean){
    this.totalActasValidadas = Utility.rellenarCerosAIzquierda(response.approved,4);
    this.totalActasParaRedigitalizar = Utility.rellenarCerosAIzquierda(response.rejected,4);
    this.TotalActasPorVerificar = Utility.rellenarCerosAIzquierda(response.pending,4);
    this.isVisibleResumen = true;
  }

  obtenerResumenIncorrecto(error: any){
    this.mensajePopup("Control de Digitalización", "Ocurrió un error para cargar el resumen.", IconPopType.ERROR);
  }

  compararPorEstadoYMesa(a:DigitizationListActasItemBean, b:DigitizationListActasItemBean): number{
    const ordenEstado = { D: 1, Q: 2, Z: 3, U: 4, C: 5 };
    const estadoA = a.estado.toUpperCase();
    const estadoB = b.estado.toUpperCase();
    const ordenMesaA = parseInt(a.mesa);
    const ordenMesaB = parseInt(b.mesa);

    if (ordenEstado[estadoA] !== ordenEstado[estadoB]) {
      return ordenEstado[estadoA] - ordenEstado[estadoB]; // Ordenar por estado
    } else {
      return ordenMesaA - ordenMesaB; // Si el estado es igual, ordenar por número de mesa ascendente
    }
  }

  limpiarDatos(){
    this.titulo = "Sin documentos cargados"
    this.isVisibleListaActas = false;
    this.isVisibleResumen = false;
    this.isDigitalizarActa = false;

    this.isVisibleBtnCargarDocumentos = true;
    this.isVisibleBtnRechazar = false;
    this.isVisibleBtnAprobar = false;
    this.isVisibleBtnFinalizarAtencion = false;
    this.nroMesa = "000000";
    this.indiceActaSeleccionada = 0;
    this.listaActas=[]
  }

  reiniciarAnguloActaEscrutinio(){
    this.anguloActaEscrutinio = 0;
    this.tamanioEscrutinio = 100;
    const tamanioPorcentaje = `${this.tamanioEscrutinio}%`;
    const imagen= document.getElementById('actaLadoEscrutinio');
    this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
    this.renderer.setStyle(imagen,'transform',`rotate(${this.anguloActaEscrutinio}deg)`); //transform-origin:
    this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaEscrutinio, this.tamanioEscrutinio)); //CS New

  }

  reiniciarAnguloActaInstalacion(){
    this.anguloActaInstalacion = 0;
    this.tamanioInstalacion = 100;
    const tamanioPorcentaje = `${this.tamanioInstalacion}%`;
    const imagen= document.getElementById('actaLadoInstalacion');
    this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
    this.renderer.setStyle(imagen,'transform',`rotate(${this.anguloActaInstalacion}deg)`); //transform-origin:
    this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaInstalacion, this.tamanioInstalacion));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  rechazarMesa(){
    sessionStorage.setItem('loading','true');
    this.rechazarMesaBean.actaId = this.actaSeleccionada.actaId;
    this.rechazarMesaBean.type = 1;
    this.rechazarMesaBean.comments="-";

    this.controlDigitalizacionService.rechazarMesaCeleste(this.codigoEleccion,this.rechazarMesaBean)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.rechazarMesaCorrecto.bind(this),
        error: this.rechazarMesaIncorrecto.bind(this)
      });
  }

  confirmarRechazarMesa(): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        disableClose: true,
        data: `¿Está seguro de rechazar el acta?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.rechazarMesa();
        }
      });
  }

  rechazarMesaCorrecto(response: boolean){
    sessionStorage.setItem('loading','false');
    if (response){
      let popMensaje :PopMensajeData= {
        title:"Control de Digitalización",
        mensaje:"Se rechazó el acta correctamente.",
        icon:IconPopType.CONFIRM,
        success:true
      }
      this.dialog.open(PopMensajeComponent, {
        disableClose: true,
        data: popMensaje
      })
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {
            this.siguienteActaAsync();
          }
        });
    }else{
      this.mensajePopup("Control de Digitalización", "Ocurrió un error para rechazar.", IconPopType.ALERT);
    }
  }


  rechazarMesaIncorrecto(erro: any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup("Control de Digitalización", "Ocurrió un error para rechazar.", IconPopType.ALERT);
  }

  zoomInActaEscrutinio(){
    const tamanioMaximo = 250;
    if(this.tamanioEscrutinio + 50 <= tamanioMaximo){
      this.tamanioEscrutinio += 50;
      const tamanioPorcentaje = `${this.tamanioEscrutinio}%`;
      const imagen= document.getElementById('actaLadoEscrutinio');
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaEscrutinio, this.tamanioEscrutinio)); //CS New
    }
  }

  zoomOutActaEscrutinio(){
    const tamanioMinimo=100;
    if(this.tamanioEscrutinio - 50 >= tamanioMinimo){
      this.tamanioEscrutinio -= 50;
      const tamanioPorcentaje = `${this.tamanioEscrutinio}%`;
      const imagen= document.getElementById('actaLadoEscrutinio');
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaEscrutinio, this.tamanioEscrutinio)); //CS New
    }
  }

  rotarActaEscrutinio(){
    this.anguloActaEscrutinio+=90;
    const imagen= document.getElementById('actaLadoEscrutinio');
    this.renderer.setStyle(imagen,'transform',`rotate(${this.anguloActaEscrutinio}deg)`); //transform-origin:
    this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaEscrutinio, this.tamanioEscrutinio));
  }

  zoomInActaInstalacion(){
    const tamanioMaximo = 250;
    if(this.tamanioInstalacion + 50 <= tamanioMaximo){
      this.tamanioInstalacion += 50;
      const tamanioPorcentaje = `${this.tamanioInstalacion}%`;
      const imagen= document.getElementById('actaLadoInstalacion');
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaInstalacion, this.tamanioInstalacion));
    }
  }

  zoomOutActaInstalacion(){
    const tamanioMinimo=100;
    if(this.tamanioInstalacion - 50 >= tamanioMinimo){
      this.tamanioInstalacion -= 50;
      const tamanioPorcentaje = `${this.tamanioInstalacion}%`;
      const imagen= document.getElementById('actaLadoInstalacion');
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaInstalacion, this.tamanioInstalacion));
    }
  }

  rotarActaInstalacion(){
    this.anguloActaInstalacion+=90;
    const imagen= document.getElementById('actaLadoInstalacion');
    this.renderer.setStyle(imagen,'transform',`rotate(${this.anguloActaInstalacion}deg)`); //transform-origin:
    this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaInstalacion, this.tamanioInstalacion));
  }

  protected readonly Constantes = Constantes;
}
