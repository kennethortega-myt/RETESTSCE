import {Component, DestroyRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {takeUntil} from "rxjs/operators";
import {FormControl, Validators} from "@angular/forms";
import {Utility} from "../../../../helper/utility";
import {Subject} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {ActaBean, ActaJeeBean} from "../../../../model/resoluciones/acta-jee-bean";
import {ProcesoElectoralResponseBean} from "../../../../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../../../../model/eleccionResponseBean";
import {MatPaginator} from "@angular/material/paginator";
import {AuthComponent} from "../../../../helper/auth-component";
import {ResolucionService} from "../../../../service/resolucion.service";
import {GeneralService} from "../../../../service/general-service.service";
import {MatDialog} from "@angular/material/dialog";
import {Usuario} from "../../../../model/usuario-bean";
import {saveAs} from "file-saver/src/FileSaver";
import {PopReporteCargoEntregaComponent} from "./pop-reporte-cargo-entrega/pop-reporte-cargo-entrega.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {IGenericInterface} from "../../../../interface/general.interface";
import {Constantes} from "../../../../helper/constantes";
import {UtilityService} from "../../../../helper/utilityService";
import {IconPopType} from "../../../../model/enum/iconPopType";
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { DigitizationGetFilesResponse } from 'src/app/model/digitizationGetFilesResponse';
import { ACCIONES_TABLA } from 'src/app/pages/shared/tabla-actas/tabla-actas-acciones.constant';
import { VentanaEmergenteService } from 'src/app/service/ventana-emergente.service';
import { PopVerActaSobreComponent } from './pop-ver-acta-sobre/pop-ver-acta-sobre.component';

@Component({
  selector: 'app-envio-actas',
  templateUrl: './envio-actas.component.html',
  styleUrls: ['./envio-actas.component.scss']
})
export class EnvioActasComponent extends AuthComponent implements OnInit, OnDestroy{

  destroyRef:DestroyRef = inject(DestroyRef);

  eleccionFormControl = new FormControl("0");
  procesoFormControl = new FormControl("0");
  actaFormControl = new FormControl({value:"", disabled:false}, Validators.minLength(6));
  copiaFormControl = new FormControl({value:"", disabled:false}, Validators.minLength(3));
  totalActasNormales = Utility.rellenarCerosAIzquierda(0, 4);
  totalActasObservadas = Utility.rellenarCerosAIzquierda(0, 4);
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataSource: MatTableDataSource<ActaBean>;
  resultadoPrevio:string = "sinmodificar";
  listProceso: Array<ProcesoElectoralResponseBean>;
  listEleccion: Array<EleccionResponseBean>;
  @ViewChild('paginator') paginator: MatPaginator;
  listProcesoTab2: Array<ProcesoElectoralResponseBean>;
  actaJeeBean: ActaJeeBean;
  @ViewChild('refNumeCopia') refNumeCopia;
  @ViewChild('refNumeActa') refNumeActa;
  displayedColumns: string[] = ['position', 'acta', 'copia','eleccion', 'estado', 'acciones'];
  ACCIONES_TABLA = ACCIONES_TABLA;
  isVisible:boolean=false;
  nombreArchivo = "";
  tituloAlert = "Envío de Actas al JEE/JNE"
  isLoadingBtn = {
    btnBuscar: false,
    btnGenerar: false
  }


  public usuario: Usuario;
  constructor(
    private readonly resolucionService: ResolucionService,
    private readonly generalService : GeneralService,
    private readonly utilityService: UtilityService,
    private readonly ventanaEmergenteService: VentanaEmergenteService,
    private readonly dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.usuario = this.authentication();

    this.dataSource = new MatTableDataSource([]);
    this.generalService.obtenerProcesos().pipe(takeUntil(this.destroy$)).subscribe(
      (response)=>{
        if(response.success){
          this.listProceso= response.data;
          this.listProcesoTab2 = response.data;
        }else{
          this.utilityService.mensajePopup(this.tituloAlert, "Hubo un problema al cargar la lista de procesos.", IconPopType.ALERT);
        }
      });

    if(this.paginator) this.dataSource.paginator = this.paginator;
  }


  obtenerEleccion() {
    this.limpiarDatos();
    if (!this.procesoFormControl.value || this.procesoFormControl.value == '0') {
      this.isVisible=false;
      this.listEleccion = [];
      this.actaFormControl.disable();
      this.copiaFormControl.disable();
      return;
    }
    if (+this.procesoFormControl.value > 0) {
      this.generalService.obtenerElecciones(Number(this.procesoFormControl.value)).pipe(takeUntil(this.destroy$))
        .subscribe((response) => {
          this.listEleccion = [];
          this.listEleccion = response.data;
        });
    }
  }

  listarResumenActasEnviadasAlJurado(){

    this.limpiarDatos();

    if (!this.eleccionFormControl.value || this.eleccionFormControl.value == '0') {
      this.isVisible=false;
      this.actaFormControl.disable();
      this.copiaFormControl.disable();
      return;
    }
    this.actaFormControl.enable();
    this.copiaFormControl.enable();

    this.utilityService.setLoading(true);
    //RESUMEN DE ACTAS
    this.resolucionService.obtenerActasEnvioJee(Number(this.eleccionFormControl.value))
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.utilityService.setLoading(false);
        if(response.success){
          this.isVisible=true;
          this.actaJeeBean = response.data;
          this.totalActasNormales = Utility.rellenarCerosAIzquierda(this.actaJeeBean.totalNormales, 4);
          this.totalActasObservadas = Utility.rellenarCerosAIzquierda(this.actaJeeBean.totalObservadas, 4);
        }else{
          this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
        }
    });

  }


  limpiarDatos() {
    this.resultadoPrevio = "sinmodificar";
    this.actaFormControl.reset();
    this.copiaFormControl.reset();
    this.totalActasNormales = Utility.rellenarCerosAIzquierda(0, 4);
    this.totalActasObservadas = Utility.rellenarCerosAIzquierda(0, 4);
    this.dataSource.data = [];
    if(this.paginator) this.dataSource.paginator = this.paginator;
    if (this.refNumeActa) this.refNumeActa.nativeElement.focus();
  }

  onKeyNumeActa(event){
    if(event.keyCode != 8 && event.keyCode != 9){//BACKSPACE
      if(event.target.value.length ===6){
        if(this.refNumeCopia)
          this.refNumeCopia.nativeElement.focus();
      }
    }
  }

  agregarActaOn(event) {
    if (event.keyCode === 13) {
      this.agregarActa();
    }
  }

  agregarActa() {
    if (this.isLoadingBtn.btnBuscar) return;

    this.isLoadingBtn.btnBuscar = true;


    let nroActa = this.actaFormControl.value;
    let nroCopia = this.copiaFormControl.value;

    if (!nroActa || nroActa == '') {
      this.utilityService.mensajePopup(this.tituloAlert, "Ingrese un número de acta.", IconPopType.ALERT);
      this.limpiarInputs();
      return;
    }

    if (nroActa.length != 6) {
      this.utilityService.mensajePopup(this.tituloAlert, "El número de acta no cuenta con 6 dígitos.", IconPopType.ALERT);
      this.limpiarInputs();
      return;
    }

    if (!nroCopia || nroCopia == '') {
      this.utilityService.mensajePopup(this.tituloAlert, "Ingrese un número de copia.", IconPopType.ALERT);
      this.limpiarInputs();
      return;
    }

    if (nroCopia.length != 3) {
      this.utilityService.mensajePopup(this.tituloAlert, "El número de copia no cuenta con 3 dígitos.", IconPopType.ALERT);
      this.limpiarInputs();
      return;
    }

    const regex = /^\d*$/;
    const onlyNumbers = regex.test(nroCopia.substring(0,2)); // true
    if(!onlyNumbers){
      this.utilityService.mensajePopup(this.tituloAlert, "Los dos primeros dígitos de la copia deben ser números.", IconPopType.ALERT);
      this.limpiarInputs();
      return;
    }

    const regex2 = /^[a-zA-Z]+$/;
    const onlyNumbers2 = regex2.test(nroCopia.substring(2,3)); // true
    if(!onlyNumbers2){
      this.utilityService.mensajePopup(this.tituloAlert, "El último dígito de la copia debe ser una letra.", IconPopType.ALERT);
      this.limpiarInputs();
      return;
    }

    const actabean: ActaBean | undefined = this.dataSource.data.find(e => e.mesa === nroActa && e.copia === nroCopia);
    if (actabean) {
      this.utilityService.mensajePopup(this.tituloAlert, "El acta " + nroActa +"-" +  nroCopia + " ya se encuentra clasificada.", IconPopType.ALERT);
      this.limpiarInputs();
      return;
    }


    this.utilityService.setLoading(true);
    this.resolucionService.obtenerActaEnvioJee(nroActa, nroCopia)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.obtenerActaEnvioJeeCorrecto.bind(this),
        error: this.obtenerActaEnvioJeeIncorrecto.bind(this)
      });
  }

  obtenerActaEnvioJeeCorrecto(response:IGenericInterface<ActaBean>){
    this.utilityService.setLoading(false);
    this.limpiarInputs();
    if(response.success){
      this.dataSource.data = [...this.dataSource.data, response.data];
      if(this.paginator) this.dataSource.paginator = this.paginator;
      if(this.refNumeActa)this.refNumeActa.nativeElement.focus();
    } else {
      if(this.refNumeActa)this.refNumeActa.nativeElement.focus();
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  limpiarInputs(){
    this.copiaFormControl.reset();
    this.actaFormControl.reset();
    this.isLoadingBtn.btnBuscar = false;
    if(this.refNumeActa)this.refNumeActa.nativeElement.focus();
  }

  obtenerActaEnvioJeeIncorrecto(e: any){
    this.utilityService.setLoading(false);
    this.limpiarInputs();
    if(this.refNumeActa)this.refNumeActa.nativeElement.focus();
    let mensaje = this.utilityService.manejarMensajeError(e);
    this.utilityService.mensajePopup(this.tituloAlert, mensaje, IconPopType.ALERT);
  }

  eliminarActaParaEnvio(indice: number) {

    let actaBean: ActaBean = this.dataSource.data[indice];

    this.utilityService.popupConfirmacionConAccion(
      null,
      `¿Desea eliminar el acta ` + actaBean.mesa + `-` + actaBean.copia + ` de la lista?`,
      ()=> this.confirmarEliminarActaParaEnvio(indice, actaBean)
    );
  }

  confirmarEliminarActaParaEnvio(indice:number, actaBean: ActaBean){
    this.dataSource.data = this.dataSource.data.filter((_, i) => i !== indice);
    if(this.paginator) this.dataSource.paginator = this.paginator;
    this.utilityService.mensajePopup(this.tituloAlert, "Se eliminó el acta "+ actaBean.mesa + '-' + actaBean.copia+".", IconPopType.CONFIRM);
  }

  generarCargoEntregaManual() {
    if (this.isLoadingBtn.btnGenerar) return;

    this.isLoadingBtn.btnGenerar = true;

    if(this.dataSource.data.length == 0){
      this.utilityService.mensajePopup(this.tituloAlert, "No se han agregado actas para envío al JEE/JNE", IconPopType.ALERT);
      this.isLoadingBtn.btnGenerar = false;
      return;
    }

    let cantActasParaEnvio = this.dataSource.data.some(acta => acta.estadoActa === Constantes.ESTADO_ACTA_PARA_ENVIO_AL_JURADO)
    if (!cantActasParaEnvio){
      this.utilityService.mensajePopup(this.tituloAlert, "Ninguna acta está observada para envío al jurado.", IconPopType.ALERT);
      this.isLoadingBtn.btnGenerar = false;
      return;
    }

    let mensajeCargoEntre = "";
    if (this.dataSource.data.length == 1){
    mensajeCargoEntre = `¿Desea generar el cargo de entrega para la acta enviada al JEE?`;
    }else{
      mensajeCargoEntre = `¿Desea generar el cargo de entrega para las actas enviadas al JEE?`;
    }

    this.utilityService.popupConfirmacionConAcciones(
      null,
      mensajeCargoEntre,
      ()=> this.confirmarGenerarCargoEntrega(),
      ()=> this.cancelarGenerarCargoEntrega()
    );
  }

  generarCargoEntrega(event: { acta: ActaBean}) {

    if (this.isLoadingBtn.btnGenerar) return;

    this.isLoadingBtn.btnGenerar = true;

    this.resolucionService.verificarDocumentoEnvioJEE(event.acta, 'CARGO').subscribe({
      next: (res) => {
        this.isLoadingBtn.btnGenerar = false;
        if (res.success && res.data) {
          this.dialog.open(PopReporteCargoEntregaComponent, {
            width: '1200px',
            maxWidth: '80vw',
            disableClose: true,
            data: {
              dataBase64: res.data,
              success: true,
              nombreArchivoDescarga: "Reporte_cargo_entrega_actas_enviadas_jee.pdf"
            }
          });
        } else {
          const mensaje = `¿Desea generar el cargo de entrega para la acta enviada al JEE?`;
          this.utilityService.popupConfirmacionConAcciones(
            null,
            mensaje,
            () => this.confirmarGenerarCargoEntregaOficio(event.acta),
            () => this.cancelarGenerarCargoEntrega()
          );
        }
      },
      error: (err) => {
        this.isLoadingBtn.btnGenerar = false;
        const msg = this.utilityService.manejarMensajeError(err);
        this.utilityService.mensajePopup(this.tituloAlert, msg, IconPopType.ALERT);
      }});
  }

  verSobreActa(event: { acta: ActaBean, tipoSobre: string }) {
    sessionStorage.setItem('loading', 'true');
    this.resolucionService.getArchivosSobre(event.acta, event.tipoSobre)
        .subscribe({
          next: (response: GenericResponseBean<DigitizationGetFilesResponse>) => {
            this.mostrarActaSobre(response);
          },
          error: (error) => {
            sessionStorage.removeItem('loading');
            this.utilityService.mensajePopup(
            this.tituloAlert,
            error.error.message,
            IconPopType.ALERT
            );
          }
    });
  }


  generarOficio(event: { acta: ActaBean}) {

    if (this.isLoadingBtn.btnGenerar) return;

    this.isLoadingBtn.btnGenerar = true;

    const acta = event.acta;
    if (acta.estadoActa !== Constantes.ESTADO_ACTA_PARA_ENVIO_AL_JURADO) {
      this.utilityService.mensajePopup(this.tituloAlert, "El acta seleccionada no está observada para envío al jurado.", IconPopType.ALERT);
      this.isLoadingBtn.btnGenerar = false;
      return;
    }

    this.resolucionService.verificarDocumentoEnvioJEE(acta, 'OFICIO').subscribe({
    next: (res) => {
      this.isLoadingBtn.btnGenerar = false;
      if (res.success && res.data) {
        this.dialog.open(PopReporteCargoEntregaComponent, {
          width: '1200px',
          maxWidth: '80vw',
          disableClose: true,
          data: {
            dataBase64: res.data,
            success: true,
            nombreArchivoDescarga: "Oficio.pdf"
          }
        });
      } else {
        const mensaje = `¿Desea generar el oficio para el JEE?`;
        this.utilityService.popupConfirmacionConAcciones(
          null,
          mensaje,
          () => this.confirmarGenerarOficio(acta),
          () => this.cancelarGenerarOficio()
        );
      }
    },
    error: (err) => {
      this.isLoadingBtn.btnGenerar = false;
      const msg = this.utilityService.manejarMensajeError(err);
      this.utilityService.mensajePopup(this.tituloAlert, msg, IconPopType.ALERT);
    }});
  }

  mostrarActaSobre(response: GenericResponseBean<DigitizationGetFilesResponse>) {
    sessionStorage.removeItem('loading');
    if (response.success) {
    const base64File1 = response.data.acta1File;
    const base64File2 = response.data.acta2File;
    const base64File3 = response.data.acta3File;
    this.dialog.open(PopVerActaSobreComponent, {
      width: '1200px',
      maxWidth: '80vw',
      disableClose: true,
      data: {
        dataBase64: base64File1,
        dataBase642: base64File2,
        dataBase643: base64File3,
        success: true,
        nombreArchivoDescarga: "Acta_Sobre.png"
      }
    });
  } else {
    this.utilityService.mensajePopup(
      this.tituloAlert,
      response.message,
      IconPopType.ALERT
    );
  }
  }

  transmitirOficio(event: { acta: ActaBean}){
    if (this.isLoadingBtn.btnGenerar) return;

    this.isLoadingBtn.btnGenerar = true;
    const actaSeleccionada = event.acta;
    if (actaSeleccionada.estadoActa !== Constantes.ESTADO_ACTA_PARA_ENVIO_AL_JURADO){
      this.utilityService.mensajePopup(this.tituloAlert, "Ninguna acta está observada para envío al jurado.", IconPopType.ALERT);
      this.isLoadingBtn.btnGenerar = false;
      return;
    }

    let mensajeCargoEntre = `¿Desea transmitir el oficio para el JEE?`;
    this.utilityService.popupConfirmacionConAcciones(
      null,
      mensajeCargoEntre,
      ()=> this.confirmarTransmitirOficio(actaSeleccionada),
      ()=> this.cancelarGenerarOficio()
    );
  }

  confirmarGenerarCargoEntrega(){
    this.utilityService.setLoading(true);
    this.resolucionService.generarCargoEntregaV2(this.dataSource.data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.generarCargoEntregaV2Correcto(res, true),
        error: (err) => this.generarIncorrecto(err)
      });
  }

  confirmarGenerarCargoEntregaOficio(acta: ActaBean){
    this.utilityService.setLoading(true);
    this.resolucionService.generarCargoEntregaOficio(acta)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.generarCargoEntregaV2Correcto(res, false),
        error: (err) => this.generarIncorrecto(err)
      });
  }

  confirmarGenerarOficio(acta: ActaBean){
    this.utilityService.setLoading(true);
    this.resolucionService.generarOficio([acta])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.generaOficioCorrecto.bind(this),
        error: this.generarIncorrecto.bind(this)
      });
  }

  confirmarTransmitirOficio(acta: ActaBean){
    this.utilityService.setLoading(true);
    this.resolucionService.transmitirOficio(acta)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.transmitirOficioCorrecto.bind(this),
        error: this.generarIncorrecto.bind(this)
      });
  }

  cancelarGenerarCargoEntrega(){
    this.isLoadingBtn.btnGenerar = false;
  }

  cancelarGenerarOficio(){
    this.isLoadingBtn.btnGenerar = false;
  }

  generarCargoEntregaV2Correcto(res: any,manual: boolean){
    this.utilityService.setLoading(false);
    this.isLoadingBtn.btnGenerar = false;
    if(res.success){
      const dialogRef = this.dialog.open(PopReporteCargoEntregaComponent, {
        width: '1200px',
        maxWidth: '80vw',
        disableClose: true,
        data: {
          dataBase64: res.data,
          success: true,
          nombreArchivoDescarga : "Reporte_cargo_entrega_actas_enviadas_jee.pdf"
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if(manual){
          this.limpiarDatos();
        }
      });
    }else{
      this.isLoadingBtn.btnGenerar = false;
      this.utilityService.mensajePopup(this.tituloAlert, res.message, IconPopType.ALERT);

    }
  }

  generaOficioCorrecto(res){
    this.utilityService.setLoading(false);
    this.isLoadingBtn.btnGenerar = false;
    if(res.success){
      this.dialog.open(PopReporteCargoEntregaComponent, {
        width: '1200px',
        maxWidth: '80vw',
        disableClose: true,
        data: {
          dataBase64: res.data,
          success: true,
          nombreArchivoDescarga : "Oficio.pdf"
        }
      });
    }else{
      this.isLoadingBtn.btnGenerar = false;
      this.utilityService.mensajePopup(this.tituloAlert, res.message, IconPopType.ALERT);

    }
  }

  transmitirOficioCorrecto(res){
    this.utilityService.setLoading(false);
    this.isLoadingBtn.btnGenerar = false;
    if(res.success){
      this.utilityService.mensajePopup(
        this.tituloAlert,
        res.message || "Transmisión iniciada exitosamente.",
        IconPopType.CONFIRM
      );
      this.limpiarDatos();
    }else{
      this.isLoadingBtn.btnGenerar = false;
      this.utilityService.mensajePopup(this.tituloAlert, res.message, IconPopType.ALERT);
    }
  }

  generarIncorrecto(e: any){
    this.isLoadingBtn.btnGenerar = false;
    this.utilityService.setLoading(false);
    let mensaje = this.utilityService.manejarMensajeError(e);
    this.utilityService.mensajePopup(this.tituloAlert, mensaje, IconPopType.ALERT);
  }

  getFileCorrecto(res){
    saveAs(res , this.nombreArchivo);
  }
  getFileIncorrecto(){
    this.utilityService.mensajePopup(this.tituloAlert, "Archivo no encontrado", IconPopType.ALERT);
  }

  descargar(e:any){
    this.nombreArchivo = e.nombreArchivo;

    this.resolucionService.getFile(e.idArchivo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getFileCorrecto.bind(this),
        error: this.getFileIncorrecto.bind(this)
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  protected readonly visualViewport = visualViewport;
}
