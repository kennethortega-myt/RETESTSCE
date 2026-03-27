import {DestroyRef, inject, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {UtilityService} from '../helper/utilityService';
import {IconPopType} from '../model/enum/iconPopType';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PopMensajeData} from '../interface/popMensajeData.interface';
import {PopMensajeComponent} from '../pages/shared/pop-mensaje/pop-mensaje.component';
import {DialogoConfirmacionComponent} from '../pages/main/dialogo-confirmacion/dialogo-confirmacion.component';
import {AutorizacionGenericaService} from './autorizacion-generica.service';

@Injectable({
  providedIn: 'root'
})
export class AutorizacionWrapperService {
  destroyRef:DestroyRef = inject(DestroyRef);
  private readonly autorizadoSubject = new BehaviorSubject<boolean>(false);
  autorizado$ = this.autorizadoSubject.asObservable();

  private readonly mensajeAccesoSubject = new BehaviorSubject<string>('');
  mensajeAcceso$ = this.mensajeAccesoSubject.asObservable();

  constructor(
    private readonly autorizacionGenericaService: AutorizacionGenericaService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly utilityService: UtilityService
  ) {}

  validaAutorizacionIngresoModulo(tituloComponent: string, tipo: string): void {
    this.autorizacionGenericaService.autorizacion(tipo).subscribe({
      next: response => {
        if (response.success) {
          this.mensajeAccesoSubject.next(response.data.mensaje);
          if (response.data.autorizado) {
            this.autorizadoSubject.next(true);
          } else {
            this.autorizadoSubject.next(false);
            if (response.data.solicitudGenerada) {
              this.mostrarDialogoAlerta(tituloComponent, response.data.mensaje);
            } else {
              this.mostrarDialogoConfirmacion(tituloComponent, tipo);
            }
          }
        }
      },
      error: error => {
        console.error("Error en validación de autorización", error);
        if (error.error?.message) {
          this.utilityService.mensajePopup(
            tituloComponent,
            error.error.message,
            IconPopType.ALERT
          );
        } else {
          this.utilityService.mensajePopup(
            tituloComponent,
            "Error interno al llamar al servicio de autorizaciones de nación.",
            IconPopType.ERROR
          );
        }
      }
    });
  }

  private mostrarDialogoAlerta(titulo: string, mensaje: string): void {
    const popMensaje: PopMensajeData = {
      title: titulo,
      mensaje,
      icon: IconPopType.ALERT,
      success: true
    };
    this.dialog.open(PopMensajeComponent, { data: popMensaje })
      .afterClosed()
      .subscribe(confirmado => {
        if (confirmado) {
          this.router.navigateByUrl('/principal');
        }
      });
  }

  private mostrarDialogoConfirmacion(titulo: string, tipo: string): void {
    this.dialog.open(DialogoConfirmacionComponent, {
      data: 'Para continuar debe solicitar acceso, ¿desea generar una solicitud ahora?'
    })
      .afterClosed()
      .subscribe(confirmado => {
        if (confirmado) {
          this.solicitarAccesoNacion(titulo, tipo);
        } else {
          this.router.navigateByUrl('/principal');
        }
      });
  }

  solicitarAccesoNacion(titulo: string, tipo: string){
    this.autorizacionGenericaService.solicitarAcceso(tipo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(response => {
        if (response.success) {
          this.validaAutorizacionIngresoModulo(titulo, tipo);
        }
      });
  }
}
