import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, defer, EMPTY, Observable, switchMap, tap, throwError } from 'rxjs';
import { catchError, filter, take } from 'rxjs/operators';
import { AuthService } from './auth-service.service';
import {GeneralService} from "./general-service.service";
import {GenericResponseBean} from "../model/genericResponseBean";
import {JwtResponseBean} from "../model/jwtResponseBean";
import {UtilityService} from '../helper/utilityService';
import {Constantes} from '../helper/constantes';
import {RSAEncryptionService} from './rsa-encryption.service';
import {IconPopType} from '../model/enum/iconPopType';



@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private isSessionBeingHandled = false;  // Nueva bandera
  private readonly sesionHandledSubject = new BehaviorSubject<string | null>(null);

  private readonly INVALID_TOKEN_MESSAGES = [
    Constantes.TOKEN_INVALIDO_NO_COINCIDE_TOKEN_ACTIVO_REDIS,
    Constantes.TOKEN_INVALIDO_BLACKLIST,
    Constantes.TOKEN_INVALIDO_JWT
  ];

  constructor(
    public auth: AuthService,
    public generalService: GeneralService,
    private readonly authenticationService: AuthService,
    private readonly utilityService:UtilityService,
    private readonly rsaEncryptionService: RSAEncryptionService
  ) { }

  private isInvalidTokenMessage(mensaje: string): boolean {
    return this.INVALID_TOKEN_MESSAGES.includes(mensaje);
  }

  private isPublicRoute(url: string): boolean {
    const publicRoutes = [
      Constantes.API_AUTH_LOGIN,
      Constantes.API_AUTH_PUBLIC_KEY,
      Constantes.CB_USUARIO_CONTROLLER_CERRAR_SESION_ACTIVA
    ];

    return publicRoutes.some(route => url.includes(route));
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const isPublicRoute = this.isPublicRoute(req.url);

    if (isPublicRoute) {
      return next.handle(req); // Sin modificar headers
    }

    const token = this.auth.getCToken();
    const idSession = this.auth.getIdSession();

    // Si no hay token, cerramos sesión
    if (!token && !this.isSessionBeingHandled) {
      this.isSessionBeingHandled = true;
      return this.manejarCerrarSesion();
    }

    // Si hay token y no está vencido, proceder directamente
    if (token && !this.auth.isExpiredToken()) {
      // Clonar el request con el token
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          IdSession: idSession,
        }
      });

      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          const mensajeDetallado = error?.error?.message || error.message;

          if (this.auth.isExpiredToken() && !this.isSessionBeingHandled) {
            this.isSessionBeingHandled = true;
            return this.handleTokenRefresh(req, next);
          }

          if (error.status === 0) {
            console.error("Error de red (status 0): no se pudo conectar con el servidor. Verifica tu conexión o si el backend está disponible. Detalle:", mensajeDetallado);
          } else if (error.status === 401) {
            console.warn("Sesión no autorizada (401): puede que el token esté vencido o no sea válido. Detalle:", mensajeDetallado);
          } else if (error.status === 403) {
            console.warn("Acceso denegado (403): no tienes permisos para esta acción. Detalle:", mensajeDetallado);
          } else if (error.status === 404) {
            console.warn("Recurso no encontrado (404): la ruta solicitada no existe. Detalle:", mensajeDetallado);
          } else if (error.status >= 500) {
            console.error(`Error del servidor (${error.status}): ${mensajeDetallado}`);
          } else {
            console.error(`Error inesperado (${error.status}): ${mensajeDetallado}`);
          }

          return throwError(() => error);
        }),
        catchError((err) => {
          let mensaje = this.utilityService.manejarMensajeError(err);
          console.error("catch error:", mensaje);

          if (this.isInvalidTokenMessage(mensaje)) {
            sessionStorage.setItem('loading', 'false');
            return defer(() =>
              this.generalService.openDialogoGeneral({
                mensaje: `Su sesión no es válida o fue cerrada remotamente. Inicie sesión nuevamente.`,
                icon: IconPopType.ALERT,
                title: "SCE",
                success: true
              })
            ).pipe(
              switchMap(resp => resp.afterClosed()),
              tap(() => {
                this.isSessionBeingHandled = false;
                this.auth.cerrarSesion();
              }),
              switchMap(() => EMPTY)
            );
          } else {
            console.error("Se produjo un error durante la ejecución de la solicitud:", mensaje || err);
            return throwError(() => err);
          }
        })
      );
    }

    // Si el token ya expiró y aún no se ha manejado
    if (this.auth.isExpiredToken() && !this.isSessionBeingHandled) {
      this.isSessionBeingHandled = true;
      return this.handleTokenRefresh(req, next);
    } else if (this.isSessionBeingHandled) {
      // El token esta en proceso de actualización refreshToken
      return this.sesionHandledSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => {
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
              IdSession: idSession,
            },
          });
          return next.handle(req);
        }),
      );
    }

    // Cualquier otro caso (poco probable), sigue el flujo normal
    return next.handle(req);
  }


  handleTokenRefresh(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.sesionHandledSubject.next(null);
    const refreshToken = this.auth.getCTokenRefresh();
    const idSession = this.auth.getIdSession();

    if (!refreshToken) {
      this.rsaEncryptionService.clearPublicKey();
      this.auth.cerrarSesion();
      this.isSessionBeingHandled = false;
      return  EMPTY;
    }

    if (this.auth.isExpiredRefreshToken()){
      this.rsaEncryptionService.clearPublicKey();
      this.auth.cerrarSesion();
      this.isSessionBeingHandled = false;
      return  EMPTY;
    }

    return this.authenticationService.getRefreshToken(refreshToken, idSession).pipe(
      catchError(err => {
        console.log("Error al refrescar el token. cerrando sesión ...", err);
        return this.manejarCerrarSesion();
      }),
      switchMap((response: GenericResponseBean<JwtResponseBean>) => {
        if (!response.success){
          return this.manejarCerrarSesion();
        }
        this.auth.saveNewTokens(response);
        this.sesionHandledSubject.next(response.data.token);
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${response.data.token}`,
            IdSession: idSession,
          }
        });
        this.isSessionBeingHandled = false;  // Restablecer la bandera
        return next.handle(req);
      }),
    );
  }

  manejarCerrarSesion():Observable<never>{
    return this.generalService.cerrarSesion(this.auth.currentUser()).pipe(
      switchMap(()=> {
        this.rsaEncryptionService.clearPublicKey(); // Limpiar claves RSA
        this.auth.cerrarSesion();
        this.isSessionBeingHandled = false;  // Restablecer la bandera
        return EMPTY;
      }),
      catchError(err => {
        this.rsaEncryptionService.clearPublicKey(); // Limpiar claves RSA
        this.auth.logout();
        this.isSessionBeingHandled = false;  // Restablecer la bandera
        return throwError(()=> err);
      })
    );
  }
}
