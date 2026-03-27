import { Injectable } from '@angular/core';
import {IGenericInterface, SearchFilterResponse} from "../interface/general.interface";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {GenericResponseBean} from "../model/genericResponseBean";
import {IUsuario, UsuarioDetailResponse, UsuarioListFilter, UsuarioUpdateRequestData} from "../interface/usuario.interface";
import { OrcDetalleCatalogoEstructuraBean } from '../model/orcDetalleCatalogoEstructuraBean';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  initSearch: SearchFilterResponse<IUsuario> = {list: [], page: 0, totalPages: 0, size: 0, total: 0}

  private readonly urlServidor: string;
  private readonly usuarioSubject = new BehaviorSubject<SearchFilterResponse<IUsuario>>(this.initSearch);
  usuarios$: Observable<SearchFilterResponse<IUsuario>> = this.usuarioSubject.asObservable();


  constructor(private readonly httpClient: HttpClient) {
    this.urlServidor = environment.apiUrlORC;
  }

  listPerfiles(): Observable<
    GenericResponseBean<OrcDetalleCatalogoEstructuraBean[]>
  > {
    return this.httpClient.get<
      GenericResponseBean<OrcDetalleCatalogoEstructuraBean[]>
    >(`${this.urlServidor}usuario/perfiles`);
  }

  listTiposDocumento(): Observable<
    GenericResponseBean<OrcDetalleCatalogoEstructuraBean[]>
  > {
    return this.httpClient.get<
      GenericResponseBean<OrcDetalleCatalogoEstructuraBean[]>
    >(`${this.urlServidor}usuario/tipos-documento`);
  }

  listUsuarios(
    page: number,
    size: number,
    filtros: UsuarioListFilter,
  ): Observable<GenericResponseBean<SearchFilterResponse<IUsuario>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    for (const [key, value] of Object.entries(filtros)) {
      if (value != null && value !== undefined) {
        if (key === 'personaAsignada' || key === 'desincronizado') {
          params = params.set(key, value === -1 ? '' : String(value));
          continue;
        }
        params = params.set(key.replaceAll(/([A-Z])/g, '_$1').toLowerCase(), String(value));
      }
    }
    return this.httpClient.get<
      GenericResponseBean<SearchFilterResponse<IUsuario>>
    >(`${this.urlServidor}usuario`, { params });
  }

  getUsuario(usuario: string) {
    return this.httpClient.get<GenericResponseBean<UsuarioDetailResponse>>(
      `${this.urlServidor}usuario/${usuario}`
    );
  }

  desbloquearUsuario(usuario: string) {
    return this.httpClient.post<GenericResponseBean<UsuarioDetailResponse>>(
      `${this.urlServidor}usuario/${usuario}/desbloquear`,
      {}
    );
  }

  restablecerContrasenia(usuario: string) {
    return this.httpClient.post<GenericResponseBean<string>>(
      `${this.urlServidor}usuario/${usuario}/restablecer-contrasenia`,
      {}
    );
  }

  updateUsuario(
    usuario: string,
    data: UsuarioUpdateRequestData
  ): Observable<GenericResponseBean<IUsuario>> {
    return this.httpClient.put<GenericResponseBean<IUsuario>>(
      `${this.urlServidor}usuario/${usuario}`,
      data
    );
  }

  sincronizarUsuario(
    usuario: string
  ): Observable<GenericResponseBean<IUsuario>> {
    return this.httpClient.post<GenericResponseBean<IUsuario>>(
      `${this.urlServidor}usuario/${usuario}/sincronizar`,
      {}
    );
  }

  listUsuariosSesionActiva(page:number, size:number, search?: string): void {
    let params = new HttpParams()
      .set('page', page)
      .set('usuario', search ?? '')
      .set('size', size);
    this.httpClient.get<GenericResponseBean<SearchFilterResponse<IUsuario>>>(`${this.urlServidor}usuario/sesion-activa`, {params}).subscribe(data => {
      this.usuarioSubject.next(data.data);
    });
  }

  resetSesionActiva(id:string): Observable<any>{
    let params = new HttpParams()
         .set('usuario', id);
    return this.httpClient.post<IGenericInterface<boolean>>(`${this.urlServidor}usuario/reset-sesion`,{},{params});
  }

  getReporteUsuarios(
    page: number,
    size: number,
    filtros: UsuarioListFilter,
  ): Observable<GenericResponseBean<string>> {
    let params = new HttpParams().set('page', page).set('size', size);
    for (const [key, value] of Object.entries(filtros)) {
      if (value != null && value !== undefined) {
        if (key === 'personaAsignada' || key === 'desincronizado') {
          params = params.set(key, value === -1 ? '' : String(value));
          continue;
        }
        params = params.set(key, String(value));
      }
    }
    return this.httpClient.get<GenericResponseBean<string>>(`${this.urlServidor}usuario/base64`, { params });
  }

}
