import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from 'src/app/model/login';
import { LoginService } from 'src/app/service-api/login.service';
import { AuthService } from 'src/app/service/auth-service.service';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {CambiarContrasenaComponent} from '../cambiar-contrasena/cambiar-contrasena.component';
import {first} from 'rxjs/operators';
import {GenericResponseBean} from '../../../model/genericResponseBean';
import {GeneralService} from '../../../service/general-service.service';
import {
  PopupReanudarActividadesComponent
} from '../../main/cierre-actividades/popup-reanudar-actividades/popup-reanudar-actividades.component';
import {ReaperturaCCModalResult} from '../../../interface/reaperturaCCModalResult.interface';
import {CierreActividadesService} from '../../../service/cierre-actividades.service';
import {ReaperturaCentroComputoResponseBean} from '../../../model/reaperturaCentroComputoResponseBean';
import {UtilityService} from '../../../helper/utilityService';
import {IconPopType} from '../../../model/enum/iconPopType';
import {
  PopupRequiereAutorizacionComponent
} from '../../main/cierre-actividades/popup-requiere-autorizacion/popup-requiere-autorizacion.component';
import {RequiereAutorizacionModalResult} from '../../../interface/requiereAutorizacionModalResult.interface';
import {PuestaCeroService} from '../../../service/puesta-cero.service';
import {AutorizacionNacionResponseBean} from '../../../model/autorizacionNacionResponseBean';
import {ReaperturaModalAction} from '../../../model/enum/reaperturaModalAction.enum';
import {ReporteCierreActividadesService} from '../../../service/reporte/reporte-cierre-actividades.service';
import {
  PopupReporteReanudarActividades
} from '../../main/cierre-actividades/popup-reporte-reanudar-actividades/popup-reporte-reanudar-actividades';
import {PopReanudarActividadesData} from '../../../interface/popReanudarActividadesData.interface';
import {finalize} from 'rxjs';
import {PopDataGenerico} from '../../../interface/popDataGenerico.interface';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit{

  public versionSistema: string;
  public generalService2 = inject(GeneralService);

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  destroyRef:DestroyRef = inject(DestroyRef);

  formGroupParent: FormGroup;
  public errorMessage: string = 'El usuario o contraseña no es válido';

  login = new Login();
  isLoading: boolean = false;

  tituloComponente: string = "Sistema de Cómputo Electoral";

  constructor(
    public formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly loginService:LoginService,
    private readonly authenticationService: AuthService,
    private readonly cierreActividadesService: CierreActividadesService,
    private readonly utilityService: UtilityService,
    private readonly puestaCeroService: PuestaCeroService,
    private readonly reporteCierreActividadesService: ReporteCierreActividadesService,
    private readonly dialog: MatDialog

) {
  this.formGroupParent = new FormGroup({});
}


ngOnInit() {
  this.errorMessage = null;
  this.formGroupParent = this.formBuilder.group({
      usuario: new FormControl('', [Validators.required]),
      clave: new FormControl('', [Validators.required])
  });

    this.seleccionarImagenAleatoria();

}

  openModal(): void {
    this.generalService2.cerrarSesion(this.authenticationService.currentUser()).pipe(first()).subscribe({
      next: (value: GenericResponseBean<string>)=> {
        this.authenticationService.cerrarSesion();
        const dialogRef = this.dialog.open(CambiarContrasenaComponent, {
          backdropClass: 'modalBackdrop',
          panelClass: 'modalPanel',
          width: '350px',
          autoFocus: false,
          maxHeight: '90vh',
          data: {
            Usuario: this.formGroupParent.get('usuario')?.value,
            Clave: this.formGroupParent.get('clave')?.value
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          this.formGroupParent.get('clave')?.reset();
          this.authenticationService.cerrarSesion();
        });
      },
      error: (error) => {
        this.authenticationService.logout();
      }
    });
  }

  openModalReapertura(usuarioCierre: string, fechaCierre: string): void {

    const data: PopReanudarActividadesData = { usuarioCierre, fechaCierre };
    const config: MatDialogConfig<PopReanudarActividadesData> = {
      width: '550px',
      maxWidth: '80vw',
      disableClose: true,
      autoFocus: false,
      restoreFocus: true,
      data
    };

    const dialogRef = this.dialog.open<
      PopupReanudarActividadesComponent,
      PopReanudarActividadesData,
      ReaperturaCCModalResult
    >(PopupReanudarActividadesComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      switch (result?.action) {
        case ReaperturaModalAction.REAPERTURA_REALIZADA:
          this.utilityService.mensajePopupCallback(
            this.tituloComponente,
            'Se realizó la reapertura del centro de cómputo con éxito.',
            IconPopType.CONFIRM,
            () => this.openModalReporteReapertura(
              this.formGroupParent.get('usuario')?.value,
              this.formGroupParent.get('clave')?.value,
              result.data.base64Pdf
              )
          );
          break;

        case ReaperturaModalAction.SOLICITAR_AUTORIZACION:
          this.solicitarEstdoAutorizacionNacion(result.data.usuario,result.data.clave);
          break;

        case ReaperturaModalAction.SALIR:
        default:
          // no-op
          break;
      }
    });

  }

  openModalReporteReapertura(usuario: string, password: string, base64DataPdf?: string): void {
    const data: PopDataGenerico= { base64Pdf: base64DataPdf}
    const dialogReporteReaperturaRef = this.dialog.open(PopupReporteReanudarActividades,
      {
        width: '1200px',
        maxWidth: '80vw',
        disableClose: true,
        data
      }
    );

    dialogReporteReaperturaRef.afterClosed().subscribe((result: any) => {
      let loginTemp: Login = new Login();
      loginTemp.username = usuario;
      loginTemp.password = password;
      this.authentica(loginTemp);
    });
  }

  mostrarModalParaAutorizacion(){
    const dialogAutorizacionRef = this.dialog.open(PopupRequiereAutorizacionComponent,
      {
        width: '550px',
        maxWidth: '80vw',
        disableClose: true
      });

    dialogAutorizacionRef.afterClosed().subscribe((result: RequiereAutorizacionModalResult) => {
      if (result.action == 'solicitar'){
        this.solicitarAutorizacionNacion();
      }else{
        this.cerrarSesionGeneral();
      }
    });
  }

  solicitarAutorizacionNacion(){
    //crea registro en nacion
    this.cierreActividadesService.solicitarAccesoNacion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.solicitarAccesoNacionCorrecto.bind(this),
        error: this.solicitarAccesoNacionIncorrecto.bind(this)
      });
  }

  solicitarAccesoNacionCorrecto(response: GenericResponseBean<boolean>){
    if (response.success){
      this.utilityService.mensajePopup(this.tituloComponente,"Se generó la solicitud.", IconPopType.CONFIRM);
      this.cerrarSesionGeneral();
    }
  }

  solicitarEstdoAutorizacionNacion(usuario: string, password: string){
    let loginTem = new Login();
    loginTem.username = usuario;
    loginTem.password = password;

    this.authenticationService.getToken( loginTem)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: number) => this.getTokenTemCorrecto(result, loginTem),
        error: this.getTokenTemIncorrecto.bind(this)
      });

  }

  getTokenTemCorrecto(result: number, loginTem: Login){
    if (result === 3){
      this.cierreActividadesService.solicitarEstadoAutorizacionNacion()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => this.solicitarEstadoAutorizacionNacionCorrecto(response, loginTem),
          error: this.solicitarEstadoAutorizacionNacionIncorrecto.bind(this)
        });
    }
  }

  getTokenTemIncorrecto(error: any){
    const mensaje = error?.error?.message || error?.message || 'Error de autenticación temporal';
    console.error('Error en autenticación temporal:', error);
    this.cerrarSesionGeneralMensaje(mensaje);
  }

  solicitarEstadoAutorizacionNacionCorrecto(
    response: GenericResponseBean<AutorizacionNacionResponseBean>,
    loginTem: Login
    ){
    if (response.success){
      if (!response.data.autorizado){
        if (response.data.solicitudGenerada){
          this.utilityService.mensajePopup(this.tituloComponente,response.data.mensaje,IconPopType.ALERT);
          this.cerrarSesionGeneral();
        }else{
          this.mostrarModalParaAutorizacion();
        }
      }else{
        this.reaperturaCC(loginTem, true);
      }
    }
  }

  solicitarEstadoAutorizacionNacionIncorrecto(error: any){
    const mensaje = error?.error?.message || error?.message || 'Error al consultar estado de autorización';
    console.error('Error al consultar autorización:', error);
    this.cerrarSesionGeneralMensaje(mensaje);
  }

  reaperturaCC(loginTem:Login, conAutorizacionNacion: boolean): void {

    this.cierreActividadesService.reabrirCC(conAutorizacionNacion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.reabrirCCCorrecto(response, loginTem),
        error: this.reabrirCCIncorrecto.bind(this)
      });
  }

  reabrirCCCorrecto(response: GenericResponseBean<ReaperturaCentroComputoResponseBean>, loginTem: Login){
    if (!response.success){
      this.errorMessage = response.message
    }else{
      sessionStorage.setItem('loading', 'true');
      this.reporteCierreActividadesService.obtenerReporteReaperturaCentroComputo()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => this.obtenerReporteReaperturaCentroComputoCorrecto(response, loginTem),
          error: this.obtenerReporteReaperturaCentroComputoIncorrecto.bind(this)
        });
    }
  }

  obtenerReporteReaperturaCentroComputoCorrecto(response: GenericResponseBean<any>, loginTem: Login){
    this.cerrarSesionSegura(undefined, () => {
      this.openModalReporteReapertura(loginTem.username, loginTem.password, response.data);
    });
  }

  obtenerReporteReaperturaCentroComputoIncorrecto(error: any){
    sessionStorage.setItem('loading', 'false');
    const mensaje = error?.error?.message || error?.message || 'Error al obtener el reporte de reapertura';
    console.error('Error al obtener reporte de reapertura:', error);
    this.utilityService.mensajePopup(this.tituloComponente, mensaje, IconPopType.ERROR);
  }

  reabrirCCIncorrecto(error: any){
    const mensaje = error?.error?.message || error?.message || 'Error al realizar la reapertura del centro de cómputo';
    console.error('Error en reapertura:', error);
    this.utilityService.mensajePopup(this.tituloComponente, mensaje, IconPopType.ERROR);
    this.cerrarSesionGeneral();
  }

  solicitarAccesoNacionIncorrecto(error: any){
    const mensaje = error?.error?.message || error?.message || 'Error al solicitar autorización a nación';
    console.error('Error al solicitar acceso a nación:', error);
    this.utilityService.mensajePopup(this.tituloComponente, mensaje, IconPopType.ERROR);
    this.cerrarSesionGeneral();
  }

ingresar(){
  this.errorMessage = null;
  localStorage.clear();

  if (this.formGroupParent.valid) {
    this.isLoading = true;
    const usuarioValue = this.formGroupParent.get('usuario').value;
    const claveValue = this.formGroupParent.get('clave').value;
    this.login.username = usuarioValue.toUpperCase();
    this.login.password = claveValue;
    this.authentica(this.login);
  } else {
    this.errorMessage = 'El usuario o contraseña es requerido';
  }
}

  getTokenCorrecto(result:number){
    if (result === 1){//cuando el login es correcto y no requiere cambio de password
      this.isLoading = false;
      sessionStorage.setItem("loading","false");
      if (!result){
        this.router.navigateByUrl('/main/principal');
      }else{
        sessionStorage.clear();
      }
    }
    else if (result === 2){ //en este caso deve cambiar su password
      this.isLoading = false;
      sessionStorage.setItem("loading","false");
      this.openModal();
    }else if (result === 3){
      this.isLoading = false;
      sessionStorage.setItem("loading","false");
      this.cerrarSesionParaReapertura();
    }
  }

  /**
   * Método centralizado para cerrar sesión de forma segura
   */
  private cerrarSesionSegura(
    mostrarMensaje?: string,
    callback?: () => void,
    mostrarLoading = true
  ): void {
    if (mostrarLoading) {
      sessionStorage.setItem('loading', 'true');
    }

    this.generalService2.cerrarSesion(this.authenticationService.currentUser())
      .pipe(
        first(),
        finalize(() => {
          if (mostrarLoading) {
            sessionStorage.setItem('loading', 'false');
          }
          this.authenticationService.cerrarSesion();
        })
      ).subscribe({
        next: () => {
          if (mostrarMensaje) {
            this.utilityService.mensajePopup(this.tituloComponente, mostrarMensaje, IconPopType.ERROR);
          }
          if (callback) {
            callback();
          }
        },
        error: (error) => {
          console.warn('Error al cerrar sesión del servidor:', error);
          if (mostrarMensaje) {
            this.utilityService.mensajePopup(this.tituloComponente, mostrarMensaje, IconPopType.ERROR);
          }
          if (callback) {
            callback();
          }
        }
      });
  }

  cerrarSesionParaReapertura(){
    const usuarioCierre = localStorage.getItem('usrcc') ?? '';
    const fechaCierre   = localStorage.getItem('datecc') ?? '';

    this.cerrarSesionSegura(
      undefined,
      () => this.openModalReapertura(usuarioCierre, fechaCierre),
      false
    );
  }

  cerrarSesionGeneral(){
    this.cerrarSesionSegura();
  }

  cerrarSesionGeneralMensaje(mensaje: string){
    this.cerrarSesionSegura(mensaje);
  }

  getTokenIncorrecto(error: any){
    this.isLoading = false;
    sessionStorage.setItem("loading","false");
    if(this.isErrorSesionActiva(error)){
      this.utilityService.popupConfirmacionConAccion(
        null,
        error,
        ()=> this.cerrarSesionActiva()
      );
    }else{
      this.errorMessage = error;
    }
  }

  authentica(login: Login){
    sessionStorage.setItem("loading","true");

    this.authenticationService.getToken( login)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getTokenCorrecto.bind(this),
        error: this.getTokenIncorrecto.bind(this)
      });
  }

  private cerrarSesionActiva(){
    this.utilityService.setLoading(true);
    const usuarioValue = this.formGroupParent.get('usuario').value;
    this.generalService2.cerrarSesionActiva(usuarioValue).pipe(first()).subscribe({
      next: (value: GenericResponseBean<string>)=> {
        this.utilityService.setLoading(false);
        this.utilityService.mensajePopup(this.tituloComponente,"Se cerró la sesión activa. Intente ingresar nuevamente.", IconPopType.CONFIRM);
      },
      error: (error) => {
        this.utilityService.setLoading(false);
        this.utilityService.mensajePopup(this.tituloComponente,"Error al cerrar sesión activa", IconPopType.ERROR);
      }
    })


  }

  private isErrorSesionActiva(error: string): boolean{
    return error.toLowerCase().includes("desea cerrar la sesión anterior?");
  }


  private readonly imagenes: string[] = [
    "../assets/img/fondo01.svg",
    "../assets/img/fondo02.svg",
    "../assets/img/fondo03.svg",
    "../assets/img/fondo04.svg",
    "../assets/img/fondo05.svg"
  ];

  imagenActual: string = '';


  seleccionarImagenAleatoria(): void {
    const indiceAleatorio = Math.floor(Math.random() * this.imagenes.length);
    this.imagenActual = this.imagenes[indiceAleatorio];
  }


}
