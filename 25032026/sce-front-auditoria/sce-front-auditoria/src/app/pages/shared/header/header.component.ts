import {Component, DestroyRef, OnInit, inject} from '@angular/core';
import {AuthComponent} from "../../../helper/auth-component";
import {Usuario} from "../../../model/usuario-bean";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth-service.service';
import { GeneralService } from 'src/app/service/general-service.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import {UtilityService} from '../../../helper/utilityService';
import {IconPopType} from '../../../model/enum/iconPopType';
import {Constantes} from '../../../helper/constantes';
import {RSAEncryptionService} from '../../../service/rsa-encryption.service';
import { MatDialog } from '@angular/material/dialog';
import { NuevaContraseniaModalComponent } from '../nueva-contrasenia-modal/nueva-contrasenia-modal.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent extends AuthComponent implements OnInit{

  public usuario: Usuario;
  destroyRef:DestroyRef = inject(DestroyRef);
  constructor(private readonly generalService: GeneralService,
    public Router:Router,
    private readonly authService: AuthService,
    private readonly utilityService: UtilityService,
    private readonly rsaEncryptionService: RSAEncryptionService,
    private readonly dialog: MatDialog,
  ) {
    super();
    this.usuario = new Usuario();
  }

  ngOnInit() {
    this.usuario = this.authentication();
  }


  public cerrar():void{
    this.cerrarSession();
  }

  public cerrarSession(): void {
    sessionStorage.setItem('loading','true');
    this.rsaEncryptionService.clearPublicKey(); // Limpiar claves RSA
    this.generalService.cerrarSesion(this.usuario.nombre)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.cerrarSesionCorrecto.bind(this),
        error: this.cerrarSesionIncorrecto.bind(this)
      });
  }

  public actualizarContrasenia(): void {
    const dialogRef = this.dialog.open(NuevaContraseniaModalComponent, {
      backdropClass: 'modalBackdrop',
      panelClass: 'modalPanel',
      width: '350px',
      autoFocus: false,
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!!result) {
        sessionStorage.setItem('loading', 'true');
        this.authService
          .cambiarContrasena({
            claveActual: result.actualContrasena,
            claveNueva: result.nuevaContrasena,
          })
          .subscribe({
            next: (res) => {},
            complete: () => {
              sessionStorage.setItem('loading', 'false');
            },
            error: () => {
              sessionStorage.setItem('loading', 'false');
            },
          });
      }
    });
  }

  cerrarSesionCorrecto(response: GenericResponseBean<string>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup("SCE",response.message,IconPopType.ALERT);
    }
    this.authService.logout();
    this.removerToken();
  }

  cerrarSesionIncorrecto(reason: any){
    sessionStorage.setItem('loading','false');
    let mensaje = this.utilityService.manejarMensajeError(reason);
    if(mensaje==Constantes.TOKEN_INVALIDO_NO_COINCIDE_TOKEN_ACTIVO_REDIS){
      this.authService.logout();
      this.removerToken();
    } else {
      this.utilityService.mensajePopup("SCE","error al cerrar sesión.",IconPopType.ERROR)
    }
  }

  get centroComputoLabel(): string {
  const c = this.usuario?.codigoCentroComputo?.trim();
  const n = this.usuario?.nombreCentroComputo?.trim();
  return c && n ? `${c} - ${n}` : (c || n || '');
}


}
