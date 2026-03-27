import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {AuthComponent} from "../../../helper/auth-component";
import {Usuario} from "../../../model/usuario-bean";
import {Subject} from "rxjs";
import {FormControl} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TabAutorizacionBean} from "../../../model/tabAutorizacionBean";
import {PopMensajeComponent} from "../../shared/pop-mensaje/pop-mensaje.component";
import {
  PopResultadoPuestaCeroComponent
} from "../puesta-cero/pop-resultado-puesta-cero/pop-resultado-puesta-cero.component";
import {PopReportePuestaCeroComponent} from "../puesta-cero/pop-reporte-puesta-cero/pop-reporte-puesta-cero.component";
import {PuestaCeroNacionService} from "../../../service/puesta-cero-nacion.service";
import {PopAutorizacionComponent} from "../puesta-cero/pop-autorizacion/pop-autorizacion.component";
import {GeneralService} from "../../../service/general-service.service";
import {takeUntil} from "rxjs/operators";
import {ProcesoElectoralResponseBean} from "../../../model/procesoElectoralResponseBean";
import {MonitoreoNacionService} from "../../../service/monitoreo-nacion.service";
import {AuthService} from "../../../service/auth-service.service";
import {Login} from "../../../model/login";
import {UtilityService} from '../../../helper/utilityService';
import {IconPopType, TitlePop} from '../../../model/enum/iconPopType';

@Component({
  selector: 'app-puesta-cero-nacion',
  templateUrl: './puesta-cero-nacion.component.html',
})
export class PuestaCeroNacionComponent extends AuthComponent implements OnInit {

  destroyRef: DestroyRef = inject(DestroyRef);
  procesoFormControl = new FormControl();
  puestaCeroDigitacionInicio: string;
  puestaCeroDigitacionFin: string;
  puestaCeroDigitalizacionInicio: string;
  puestaCeroDigitalizacionFin: string;
  acronimo: string;
  private usuario: Usuario;
  listProceso: Array<ProcesoElectoralResponseBean>;
  public contador: number = 0;
  destroy$: Subject<boolean> = new Subject<boolean>();
  proceso: any;
  isVerAnuncio: boolean;
  login = new Login();

  constructor(private readonly puestaCeroService: PuestaCeroNacionService,
              private readonly monitoreoService: MonitoreoNacionService,
              private readonly utilityService: UtilityService,
              private readonly dialog: MatDialog,
              private readonly generalService: GeneralService,
              private readonly authenticationService: AuthService) {

    super();
    this.isVerAnuncio = true;
    this.reiniciarValoresLabels();
    this.listProceso = [];

  }

  ngOnInit() {
    this.usuario = this.authentication();
    this.monitoreoService
      .obtenerProcesos().pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response.success) {
        this.listProceso = response.data;
      }
    });
  }

  verificarAutorizacion() {
    if (this.procesoFormControl.value == null) {
      this.utilityService.mensajePopup("Puesta cero nación","Seleccionar un proceso",IconPopType.ALERT);
      return;
    }
    const dialogRef = this.dialog.open(PopAutorizacionComponent, {
      disableClose: true,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.success) {
        this.procesarPuestaCero(result.claveAutorizacion);
      }
    });

  }

  procesarPuestaCero(clave: string): void {
    this.login.username = this.usuario.nombre.toUpperCase();
    this.login.password = clave;
    this.authenticationService.getToken( this.login)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.autorizacionCorrecto.bind(this),
        error: this.autorizacionIncorrecto.bind(this)
      });

  }

  autorizacionCorrecto(response: GenericResponseBean<TabAutorizacionBean>) {
    if (response) {
      this.isVerAnuncio = false;
      this.puestaCeroDigitacionInicio = "Realizando Puesta a Cero...";
      sessionStorage.setItem('loading', 'true');
      this.puestaCeroService.puestaCero({
        acronimo: this.acronimo,
        esquema: this.proceso.nombreEsquemaPrincipal,
        usuario: this.usuario.nombre
      })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: this.puestaCeroOmisosCorrecto.bind(this),
          error: this.puestaCeroDigitacionIncorrecto.bind(this)
        });
    } else {
      this.dialog.open(PopMensajeComponent, {
        data: {
          mensaje: response.message
        }
      })
        .afterClosed()
        .subscribe(value => {
          this.isVerAnuncio = true;
        });
    }
  }

 async autorizacionIncorrecto(response: any) {
    await this.generalService.openDialogoGeneral({mensaje:response,icon:IconPopType.ALERT,title:TitlePop.INFORMATION,success:false});
    this.isVerAnuncio = true;
  }


  async puestaCeroOmisosCorrecto(response: GenericResponseBean<any>) {
    sessionStorage.setItem('loading', 'false');

    if (response.success) {
      this.puestaCeroDigitacionFin = "Puesta a Cero realizado con éxito";
      this.generarReporte(response);
    } else if(!response.success && response.message){
      await this.generalService.openDialogoGeneral({mensaje:response.message,icon:IconPopType.ALERT,title:TitlePop.INFORMATION,success:false});
    } else{
      await this.generalService.openDialogoGeneral({mensaje:"No se pudo procesar la Puesta a Cero",icon:IconPopType.ALERT,title:TitlePop.INFORMATION,success:false});
    }
  }


  puestaCeroDigitacionIncorrecto(error: any) {

    if (error?.error) {
      this.generalService.openDialogoGeneral({
        mensaje: error?.error?.message ?? "",
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: true
      });
    } else {
      this.puestaCeroDigitacionFin = "Error al realizar Puesta a Cero.";
    }
    sessionStorage.setItem('loading', 'false');
  }

  generarReporte(data:any): void {

    const dialogRef = this.dialog.open(PopResultadoPuestaCeroComponent, {});

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        sessionStorage.setItem('loading', 'true');
        this.puestaCeroDigitalizacionInicio = "Generando reporte Puesta a Cero ...";
        this.puestaCeroService.getReportePuestaCeroBase64(this.acronimo, this.proceso.id, this.proceso.nombreEsquemaPrincipal, data.data.idPuestaCeroStae, data.data.idPuestaCeroVd)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: this.getReportePuestaCeroBase64Correcto.bind(this),
            error: this.getReportePuestaCeroBase64Incorrecto.bind(this)
          });
      }
    });
  }

  getReportePuestaCeroBase64Correcto(response: GenericResponseBean<string>) {
    sessionStorage.setItem('loading', 'false');

    if (response.success) {
      this.puestaCeroDigitalizacionFin = "Generando reporte Puesta a Cero terminado";
      const dialogRef = this.dialog.open(PopReportePuestaCeroComponent, {
        width: '1200px',
        maxWidth: '80vw',
        data: {
          dataBase64: response.data,
          success: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        this.reiniciarValoresLabels();
      });
    }

  }

  reiniciarValoresLabels() {
    this.isVerAnuncio = true;
    this.puestaCeroDigitacionInicio = "";
    this.puestaCeroDigitacionFin = "";
    this.puestaCeroDigitalizacionInicio = "";
    this.puestaCeroDigitalizacionFin = "";

  }

  getReportePuestaCeroBase64Incorrecto(error: any) {
    sessionStorage.setItem('loading', 'false');
    this.utilityService.mensajePopup("Puesta cero nación","No fue posible cargar el reporte Puesta a Cero",IconPopType.ERROR);
  }


  seleccionarProceso() {

    if (+this.procesoFormControl.value.id > 0) {
      console.log(this.procesoFormControl);
      this.proceso = this.procesoFormControl.value;
      this.acronimo = this.procesoFormControl.value.acronimo;


    }
  }
}
