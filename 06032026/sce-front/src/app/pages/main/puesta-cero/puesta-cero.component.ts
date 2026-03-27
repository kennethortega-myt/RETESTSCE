import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {PopResultadoPuestaCeroComponent} from "./pop-resultado-puesta-cero/pop-resultado-puesta-cero.component";
import {PopReportePuestaCeroComponent} from "./pop-reporte-puesta-cero/pop-reporte-puesta-cero.component";
import {PuestaCeroService} from "../../../service/puesta-cero.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {AuthComponent} from "../../../helper/auth-component";
import {TabAutorizacionBean} from "../../../model/tabAutorizacionBean";
import {UtilityService} from "../../../helper/utilityService";
import {IconPopType} from "../../../model/enum/iconPopType";
import { PopMensajeData } from "src/app/interface/popMensajeData.interface";
import { PopMensajeComponent } from "../../shared/pop-mensaje/pop-mensaje.component";
import { DialogoConfirmacionComponent } from "../dialogo-confirmacion/dialogo-confirmacion.component";
import { Router } from "@angular/router";
import {PopAutorizacionComponent} from './pop-autorizacion/pop-autorizacion.component';
import {Login} from '../../../model/login';
import {Usuario} from '../../../model/usuario-bean';
import {AuthService} from '../../../service/auth-service.service';

@Component({
  selector: 'app-puesta-cero',
  templateUrl: './puesta-cero.component.html'
})
export class PuestaCeroComponent extends AuthComponent implements OnInit {

  destroyRef:DestroyRef = inject(DestroyRef);

  puestaCeroGeneralInicio: string;
  puestaCeroGeneralFin: string;

  puestaCeroTransmisionInicio: string;
  puestaCeroTransmisionFin: string;

  habilitarBtn: boolean;

  mensajeAcceso: string;
  idAutorizacion:string;
  login = new Login();
  private usuario: Usuario;

  public tituloComponent: string = "Puesta a Cero";
    constructor( private readonly puestaCeroService: PuestaCeroService,
                 private readonly utilityService: UtilityService,
                 public readonly router: Router,
                 public readonly dialog: MatDialog,
                 public readonly authenticationService: AuthService) {

      super();
      this.reiniciarValoresLabels();
      this.habilitarBtn = false;

    }

  ngOnInit() {
    this.usuario = this.authentication();
    this.validaAutorizacionIngresoModulo();
  }

  iniciarPuestaCero(){
    this.habilitarBtn = false;
    this.puestaCeroGeneralInicio = "Realizando puesta a cero de centro de cómputo...";

    this.utilityService.setLoading(true);

    this.puestaCeroService.puestaCeroOmisos(this.idAutorizacion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.puestaCeroGeneralCorrecto.bind(this),
        error: this.puestaCeroGeneralIncorrecto.bind(this)
      });
  }

  errorPuestaCero(mensaje: string){
    this.utilityService.mensajePopup(this.tituloComponent,mensaje,IconPopType.ALERT);
    //this.habilitarBtn=false;
  }

  puestaCeroGeneralCorrecto(response: GenericResponseBean<string>) {
    this.utilityService.setLoading(false);
    if (response.success) {
      this.habilitarBtn = false;
      this.puestaCeroGeneralFin = response.message;
      this.puestaCeroTransmisionInicio = "Realizando la transmisión de la puesta a cero a nación...";
      this.utilityService.setLoading(true);
      this.puestaCeroService.puestaCeroTransmision()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: this.puestaCeroTransmisionCorrecto.bind(this),
          error: this.puestaCeroTransmisionIncorrecto.bind(this)
        });
    } else {
      this.habilitarBtn = true;
      this.puestaCeroGeneralFin = response.message;
      this.errorPuestaCero(response.message);
    }
  }

  puestaCeroTransmisionCorrecto(response: GenericResponseBean<string>){
    this.utilityService.setLoading(false);
    this.puestaCeroTransmisionFin = response.message;
    this.generarReporte();
  }

  puestaCeroTransmisionIncorrecto(response: GenericResponseBean<string>){
    this.utilityService.setLoading(false);
    this.puestaCeroTransmisionFin = response.message;
    this.generarReporte();
  }

  puestaCeroGeneralIncorrecto(error){
    this.habilitarBtn = true;
    this.utilityService.setLoading(false);
    let mensaje = this.utilityService.manejarMensajeError(error);
    this.puestaCeroGeneralFin = mensaje;
    this.errorPuestaCero(mensaje);
  }


  generarReporte(): void{
    const dialogRef = this.dialog.open(PopResultadoPuestaCeroComponent, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.utilityService.setLoading(true);
        this.puestaCeroService.getReportePuestaCeroBase64()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: this.getReportePuestaCeroBase64Correcto.bind(this),
            error: this.getReportePuestaCeroBase64Incorrecto.bind(this)
          });
      }
    });
  }

  getReportePuestaCeroBase64Correcto(response: GenericResponseBean<string>){
    this.utilityService.setLoading(false);
      if (response.success){
        const dialogRef = this.dialog.open(PopReportePuestaCeroComponent, {
          width: '1200px',
          maxWidth: '80vw',
          disableClose: true,
          data : {
            dataBase64: response.data,
            success: true
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          //this.reiniciarValoresLabels();
          this.habilitarBtn = false;
        });
      }else{
        this.utilityService.mensajePopup(this.tituloComponent,response.message,IconPopType.ALERT);
        this.habilitarBtn = false;
      }
  }

  reiniciarValoresLabels(){
    this.puestaCeroGeneralInicio = "";
    this.puestaCeroGeneralFin = "";
    this.puestaCeroTransmisionInicio = "";
    this.puestaCeroTransmisionFin = "";
  }

  getReportePuestaCeroBase64Incorrecto(error: any){
    this.utilityService.setLoading(false);
    this.utilityService.mensajePopup(this.tituloComponent,"No fue posible cargar el reporte puesta a cero",IconPopType.ERROR)
    this.habilitarBtn = false;
  }



  validaAutorizacionIngresoModulo() {

    this.habilitarBtn = false;

    this.puestaCeroService.validarAccesoAlModulo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.success) return;

          this.idAutorizacion = response.data.idAutorizacion;
          this.mensajeAcceso = response.data.mensaje;

          if(response.data.fromCentroComputo) {
            this.popPopIngresarContraseniaParaPuestaCero();
          }else if (response.data.autorizado) {
            this.utilityService.mensajePopup(
              this.tituloComponent,
              "Su autorización desde nación fue aprobada, puede proceder con la puesta cero de centro de cómputo.",
              IconPopType.CONFIRM
            );
            this.habilitarBtn = true;
          } else {
            console.log("No está autorizado desde nación.");
            if (response.data.solicitudGenerada) {
              const popMensaje: PopMensajeData = {
                title: this.tituloComponent,
                mensaje: response.data.mensaje,
                icon: IconPopType.ALERT,
                success: true
              };

              this.dialog.open(PopMensajeComponent, {data: popMensaje})
                .afterClosed()
                .subscribe((confirmado: boolean) => {
                  if (confirmado) {
                    this.router.navigateByUrl('/principal');
                  }
                });
            } else {
              this.dialog.open(DialogoConfirmacionComponent, {
                data: 'Para continuar debe solicitar acceso, ¿Desea generar una solicitud ahora?'
              }).afterClosed().subscribe((confirmado: boolean) => {
                this.accesoActions.get(confirmado)();
              });

            }
          }

        }, error: (error) => {
          this.utilityService.mensajePopup(
              this.tituloComponent,
            this.utilityService.manejarMensajeError(error),
              IconPopType.ALERT
            );
        }
      });
  }



  popPopIngresarContraseniaParaPuestaCero() {

    const dialogRef = this.dialog.open(PopAutorizacionComponent, {
      disableClose: true,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.success) {
        this.validarContrasenia(result.claveAutorizacion);
      }else{
        this.habilitarBtn = false;
      }
    });

  }


  validarContrasenia(clave: string): void {
    this.login.username = this.usuario.nombre.toUpperCase();
    this.login.password = clave;
    this.authenticationService.getToken( this.login)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.validacionContraseniaCorrecta.bind(this),
        error: this.validacionContraseniaIncorrecta.bind(this)
      });

  }

  validacionContraseniaCorrecta(response: GenericResponseBean<TabAutorizacionBean>) {
    if (!response) {
      this.dialog.open(PopMensajeComponent, {
        data: {
          mensaje: response.message,
          title:this.tituloComponent,
          icon:IconPopType.ALERT,
          success:true
        }
      })
        .afterClosed()
        .subscribe(value => {
          this.validaAutorizacionIngresoModulo();
        });

    } else {
      this.utilityService.mensajePopup(
        this.tituloComponent,
        "Validación correcta, puede continuar con la puesta cero en centro de cómputo.",
        IconPopType.CONFIRM
      );

      this.habilitarBtn = true;
    }
  }

  async validacionContraseniaIncorrecta(response: any) {

    if(response == 'El usuario ya cuenta con una sesión activa.'){
      this.utilityService.mensajePopup(
        this.tituloComponent,
        "Validación correcta, puede continuar con la puesta cero en centro de cómputo.",
        IconPopType.CONFIRM
      );
      this.habilitarBtn = true;
    } else {
      this.dialog.open(PopMensajeComponent, {
        data: {
          mensaje: response,
          title:this.tituloComponent,
          icon:IconPopType.ALERT,
        }
      })
        .afterClosed()
        .subscribe(value => {
          this.validaAutorizacionIngresoModulo();
        });
    }
  }



  private readonly accesoActions = new Map<boolean, () => void>([
    [true, () => this.onAccesoConfirmado()],
    [false, () => this.onAccesoRechazado()]
  ]);


  private onAccesoConfirmado(): void {
    this.puestaCeroService.solicitarAccesoAlModulo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(response => {
        if (response.success) {
          this.validaAutorizacionIngresoModulo();
        }
      });
  }

  private onAccesoRechazado(): void {
    this.router.navigateByUrl('/principal');
  }


}
