import {computed, Injectable, signal} from '@angular/core';

import {HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Login} from '../model/login';
import {JwtHelperService} from '@auth0/angular-jwt';
import {AuthStatus} from "../model/enum/auth-status.enum";
import {catchError, from, map, Observable, of, switchMap, throwError} from "rxjs";
import {Constantes} from "../helper/constantes";
import {GenericResponseBean} from "../model/genericResponseBean";
import {JwtResponseBean} from "../model/jwtResponseBean";
import {CambiaContraseniaInputDto} from '../model/cambiaContrasenia';
import {RSAEncryptionService} from './rsa-encryption.service';

const helper = new JwtHelperService();

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly baseUrlSeguridad = environment.apiUrlSeguridad;
  private readonly _currentUser = signal<string | null>(null);
  private readonly _authStatus = signal<AuthStatus>(AuthStatus.checking);
  public currentUser = computed(() => this._currentUser());
  public authStatus = computed(() => this._authStatus());

  private readonly http: HttpClient;

  constructor(
    private readonly httpBackend: HttpBackend,
    private readonly rsaEncryption: RSAEncryptionService
  ) {
    this.http = new HttpClient(httpBackend);
    this.checkAuthStatus().subscribe();
  }


  getToken(login: Login): Observable<any> {

    const uuid = crypto.randomUUID(); // UUID aleatorio

    // generar el idsession
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'IdSession': uuid
    });

    // Convertir encriptación async a Observable manteniendo tu flujo
    return from(this.rsaEncryption.encryptPassword (login.password || '')).pipe(
      switchMap(encryptedPassword => {
        // Crear login con contraseña encriptada
        const encryptedLogin: Login = {
          username: login.username,
          password: encryptedPassword
        };

        return this.http.post(
          this.baseUrlSeguridad + Constantes.API_AUTH_LOGIN,
          encryptedLogin,
          { headers });
      }),
      map((value: any) => this.setAuthenticationLogin(value, uuid)),
      catchError(this.handleError)
    );
  }


  getRefreshToken(refreshToken: string, idSession: string): Observable<GenericResponseBean<JwtResponseBean>> {
    return this.http.post<GenericResponseBean<JwtResponseBean>>(
      this.baseUrlSeguridad + '/' + Constantes.CB_USUARIO_CONTROLLER_REFRESH_TOKEN,
      {},
      {
      headers:  { 'Authorization': "Bearer "+refreshToken, "IdSession": idSession}
    });
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (err.status === 401) {
      errorMessage = err.error.message;
    } else if (err.status === 404) {
      errorMessage = 'Login endpoint no encontrado.';
    } else if (err.status === 500) {
      errorMessage = 'Error interno del servidor.';
    } else {
      errorMessage = 'No se pudo establecer conexión con el servicio';
    }
    return throwError(() => errorMessage);
  }

  public getCTokenRefresh(): string {
    if (localStorage.getItem('refreshToken') == null) {
      return "";
    }
    return JSON.parse(localStorage.getItem('refreshToken'));
  }

  public getCToken(): string {
    if (localStorage.getItem('token') == null) {
      return "";
    }
    return localStorage.getItem('token');
  }

  public getIdSession(): string {
    if (localStorage.getItem('IdSession') == null) {
      return "";
    }
    return localStorage.getItem('IdSession');
  }


  /*public isAuthenticated(): boolean {
    const token = this.getCToken();
    const helper = new JwtHelperService();
    const isTokenExpired = helper.isTokenExpired(token);
    return !isTokenExpired;
  }*/

  public isExpiredToken(): boolean {
    const token = this.getCToken();
    const helper = new JwtHelperService();
    const isTokenExpired = helper.isTokenExpired(token);
    return isTokenExpired;
  }

  public isExpiredRefreshToken(): boolean {
    const refreshToken = this.getCTokenRefresh();
    const helper = new JwtHelperService();
    const isRefreshTokenExpired = helper.isTokenExpired(refreshToken);
    return isRefreshTokenExpired;
  }

  /*public isAuthenticatedRefresh(): boolean {
    const tokenRefresh = this.getCTokenRefresh();
    const helper = new JwtHelperService();
    const isTokenExpired = helper.isTokenExpired(tokenRefresh);
    return !isTokenExpired;
  }*/

  checkAuthStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');

    if (!token) {
      this.logout();
      return of(false);
    }
    //validar token
    this.setUser();

    if (this.isExpiredToken()) {//token expirado
      return this.http.post<GenericResponseBean<string>>(this.baseUrlSeguridad + '/' + Constantes.CB_USUARIO_CONTROLLER_CERRAR_SESION, {})
        .pipe(
          map((value: GenericResponseBean<string>) => this.cerrarSesion()),
          catchError(err => throwError(() => this.logout())
          )
        );
    }
    this.setAuthentication();
    return of(true);
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('usrcc');
    sessionStorage.removeItem('datecc');
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.notAuthenticated);
  }


  private setAuthentication(): boolean {
    this._authStatus.set(AuthStatus.authenticated);

    return true;
  }

  private setUser() {
    let tokenLocalStorage = localStorage.getItem('token');
    let decodedToken = helper.decodeToken(tokenLocalStorage);
    this._currentUser.set(decodedToken['usr']);
  }

  saveNewTokens(response: GenericResponseBean<JwtResponseBean>) {
    localStorage.setItem('token', JSON.stringify(response.data.token));
    localStorage.setItem('refreshToken', JSON.stringify(response.data.refreshToken));
  }

  private setAuthenticationLogin(value: any, idSession: string): number {
    let token = structuredClone(value);
    let tokenString = JSON.stringify(token["token"]);
    let decodedToken = helper.decodeToken(tokenString);
    localStorage.setItem('token', tokenString);
    localStorage.setItem('refreshToken', JSON.stringify(token["refreshToken"]));
    localStorage.setItem('IdSession', idSession)
    this._currentUser.set(decodedToken['usr']);
    if (decodedToken['ecc']===1){
      localStorage.setItem('usrcc', decodedToken['usrcc']);
      localStorage.setItem('datecc', decodedToken['datecc']);
      return 3; //
    } else if (decodedToken['cn']===1){
      return 2; //
    }
    this._authStatus.set(AuthStatus.authenticated);
    return 1;
  }


  cambiarContrasena(claves: CambiaContraseniaInputDto): Observable<{ exito: boolean, mensaje: string }> {

    const idSession = this.getIdSession();

    return this.http.post<GenericResponseBean<boolean>>(
      `${this.baseUrlSeguridad}/usuario/actualizar-contrasenia`,
      claves,
      {
        headers: {
          'Authorization': 'Bearer ' + this.getCToken(),
          'IdSession': idSession
        }
      }
    ).pipe(
      map((response) => {
        return {
          exito: response.success && response.data === true,
          mensaje: response.message
        };
      }),
      catchError((error) => {
        const mensaje = error.error?.message ?? 'Error al actualizar la contraseña';
        return throwError(() => new Error(mensaje));
      })
    );

  }

  /**
   * Actualiza la contraseña del usuario logueado actualmente
   */
  nuevaContrasenia(params: {
    claveNueva: string;
    confirmaClaveNueva: string;
  }): Observable<GenericResponseBean<boolean>> {
    const idSession = this.getIdSession();
    const token = this.getCToken();
    return this.http.post<GenericResponseBean<boolean>>(
      `${this.baseUrlSeguridad}/usuario/nueva-contrasenia`,
      params,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          IdSession: idSession,
        },
      },
    );
  }

  cerrarSesion(): boolean {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usrcc');
    localStorage.removeItem('datecc');
    localStorage.removeItem('IdSession');
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.notAuthenticated)
    this.rsaEncryption.clearPublicKey();
    return false;
  }

}
