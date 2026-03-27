import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {GenericResponseBean} from '../model/genericResponseBean';
import {AutorizacionReprocesamientoBean} from '../model/autorizacionReprocesamientoBean';
import {Constantes} from '../helper/constantes';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthService} from './auth-service.service';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutorizacionGenericaService {

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,
              public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  autorizacion(tipo: string): Observable<GenericResponseBean<AutorizacionReprocesamientoBean>>{
    let params = new HttpParams()
      .set('tipo', tipo);
    return this.httpClient.post<GenericResponseBean<AutorizacionReprocesamientoBean>>(
      this.urlServidor + Constantes.CB_AUTORIZACION_GENERICO_CONTROLLER + 'consulta',
      {},
      {params: params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      });
  }

  solicitarAcceso(tipo: string): Observable<GenericResponseBean<boolean>>{
    let params = new HttpParams()
      .set('tipo', tipo);
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor + Constantes.CB_AUTORIZACION_GENERICO_CONTROLLER + 'solicitar',
      {},
      {params: params,headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      });
  }
}
