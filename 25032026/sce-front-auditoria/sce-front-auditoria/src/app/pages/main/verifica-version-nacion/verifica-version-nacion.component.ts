import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {UtilityService} from "../../../helper/utilityService";
import {FormControl} from "@angular/forms";
import {Usuario} from "../../../model/usuario-bean";
import {AuthComponent} from "../../../helper/auth-component";
import {ProcesoElectoralResponseBean} from "../../../model/procesoElectoralResponseBean";
import {DialogoConfirmacionComponent} from "../dialogo-confirmacion/dialogo-confirmacion.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {IconPopType} from "../../../model/enum/iconPopType";
import {ModalReporteComponent} from "../verifica-version/modal-reporte/modal-reporte.component";
import {VerificaVersionNacionService} from "../../../service/verifica-version-nacion.service";
import {MonitoreoNacionService} from "../../../service/monitoreo-nacion.service";
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-verifica-version-nacion',
  templateUrl: './verifica-version-nacion.component.html'
})
export class VerificaVersionNacionComponent extends AuthComponent implements OnInit{

  destroyRef:DestroyRef = inject(DestroyRef);
  isVisibleBtnPuestaCero: boolean;
  isVisibleBtnProcesar: boolean;
  isVisibleBtnReporte: boolean;
  isVisiblePersonaje: boolean;
  mensajePersonaje: string
  tituloComponent: string = "Verificación de Versión";

  procesoFormControl = new FormControl();
  private usuario: Usuario;
  listProceso: Array<ProcesoElectoralResponseBean>;
  proceso: any;
  acronimo: string;

  constructor(
    public dialog: MatDialog,
    private readonly utilityService:UtilityService,
    private readonly verificaVersionNacionService: VerificaVersionNacionService,
    private readonly monitoreoService: MonitoreoNacionService,
  ) {
    super();
    this.isVisibleBtnPuestaCero = true;
    this.isVisibleBtnProcesar = false;
    this.isVisibleBtnReporte = false;
    this.isVisiblePersonaje = true;
    this.mensajePersonaje = "";
    this.listProceso = [];
  }

  ngOnInit() {
    this.usuario = this.authentication();
    this.mensajePersonaje = "Haga clic en Puesta a cero para realizar la verificación de versión."

    sessionStorage.setItem('loading','true');
    this.monitoreoService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.obtenerProcesosCorrecto.bind(this),
        error: this.obtenerProcesosIncorrecto.bind(this)
      });
  }

  obtenerProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>){
    sessionStorage.setItem('loading','false');
    if (response.success){
      this.listProceso = response.data;
    }else{
      this.utilityService.mensajePopup(this.tituloComponent,response.message, IconPopType.ALERT);
    }
  }

  obtenerProcesosIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup(this.tituloComponent,"Error interno al obtener los procesos.", IconPopType.ERROR);
  }

  seleccionarProceso() {

    if (+this.procesoFormControl.value.id > 0) {
      this.proceso = this.procesoFormControl.value;
      this.acronimo = this.procesoFormControl.value.acronimo;
    }
  }

  confirmarPuestaCeroVerificaNacion(): void {
    if (this.procesoFormControl.value == null) {
      this.utilityService.mensajePopup(this.tituloComponent,"Seleccionar un proceso", IconPopType.ALERT);
      return;
    }

    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de realizar la puesta a cero de Verificación de Versión?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.puestaCeroVerificaNacion();
        }
      });
  }

  puestaCeroVerificaNacion(){
    sessionStorage.setItem('loading','true');
    this.verificaVersionNacionService.puestaCeroVerificaNacion({
      acronimo: this.acronimo,
      esquema: this.proceso.nombreEsquemaPrincipal,
      usuario: this.usuario.nombre,
      procesoId: this.proceso.id
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.puestaCeroVerificaNacionCorrecto.bind(this),
        error: this.puestaCeroVerificaNacionIncorrecto.bind(this)
      });
  }

  puestaCeroVerificaNacionCorrecto(response: GenericResponseBean<string>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloComponent,response.message, IconPopType.ERROR);
    }else{
      this.utilityService.mensajePopup(this.tituloComponent,response.message,IconPopType.CONFIRM);
      this.isVisibleBtnPuestaCero = false;
      this.isVisibleBtnProcesar = true;
      this.mensajePersonaje = "Se realizó el llenado de nueva información en la base de datos."
      this.procesoFormControl.disable();
    }
  }
  puestaCeroVerificaNacionIncorrecto(response: HttpErrorResponse){
    sessionStorage.setItem('loading','false');
    if (response.error?.message) {
      this.utilityService.mensajePopup(this.tituloComponent,response.error.message, IconPopType.ALERT);
    } else {
      this.utilityService.mensajePopup(this.tituloComponent,"Error interno al realizar puesta cero.", IconPopType.ERROR);
    }
  }

  confirmarProcesarPuestaCeroNacion(): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de procesar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.procesarPuestaCeroNacion();
        }
      });
  }

  procesarPuestaCeroNacion(){
    sessionStorage.setItem('loading','true');
    this.verificaVersionNacionService.procesarVerificaVersionNacion({
      acronimo: this.acronimo,
      esquema: this.proceso.nombreEsquemaPrincipal,
      usuario: this.usuario.nombre,
      procesoId: this.proceso.id
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.procesarVerificaVersionNacionCorrecto.bind(this),
        error: this.procesarVerificaVersionNacionIncorrecto.bind(this)
      });
  }

  procesarVerificaVersionNacionCorrecto(response: GenericResponseBean<string>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloComponent,response.message, IconPopType.ERROR);
    }else{
      this.utilityService.mensajePopup(this.tituloComponent,response.message,IconPopType.CONFIRM);
      this.isVisibleBtnProcesar = false;
      this.isVisibleBtnReporte = true;
      this.isVisiblePersonaje = false;
    }
  }

  procesarVerificaVersionNacionIncorrecto(response: HttpErrorResponse){
    sessionStorage.setItem('loading','false');
    if (response.error?.message) {
      this.utilityService.mensajePopup(this.tituloComponent,response.error.message, IconPopType.ALERT);
    } else {
      this.utilityService.mensajePopup(this.tituloComponent,"Error interno al procesar.", IconPopType.ERROR);
    }

  }

  reporteVerificaVersionNacion(){
    sessionStorage.setItem('loading','true');
    this.verificaVersionNacionService.reporteVerificaVersionNacion({
      acronimo: this.acronimo,
      esquema: this.proceso.nombreEsquemaPrincipal,
      usuario: this.usuario.nombre,
      procesoId: this.proceso.id,
      nombre: this.procesoFormControl.value.nombre
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.reporteVerificaVersionNacionCorrecto.bind(this),
        error: this.reporteVerificaVersionNacionIncorrecto.bind(this)
      });
  }

  reporteVerificaVersionNacionCorrecto(response: GenericResponseBean<string>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloComponent,response.message,IconPopType.ALERT);
    }else{
      this.openModal2(response.data)
    }
  }

  reporteVerificaVersionNacionIncorrecto(response: HttpErrorResponse){
    sessionStorage.setItem('loading','false');
    if (response.error?.message) {
      this.utilityService.mensajePopup(this.tituloComponent,response.error.message, IconPopType.ALERT);
    } else {
      this.utilityService.mensajePopup(this.tituloComponent,"Error al generar el reporte.",IconPopType.ERROR);
    }

  }

  openModal2(data :any): void {
    const dialogRef = this.dialog.open(ModalReporteComponent, {
      backdropClass: 'modalBackdrop',
      width: '1200px',
      maxWidth: '80vw',
      maxHeight: '100vh',
      panelClass: 'modalPanel',
      data: {
        dataBase64: data,
        nombreArchivoDescarga: this.utilityService.formatNombreArchivoVerificaVersion("Reporte-Verificacion-Version"),
        success: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      //nada
    });
  }



}
