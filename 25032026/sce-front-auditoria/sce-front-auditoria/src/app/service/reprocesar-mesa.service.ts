import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {IGenericInterface} from '../interface/general.interface';
import {Observable} from 'rxjs';
import {GenericResponseBean} from '../model/genericResponseBean';
import {AutorizacionPuestoCeroBean} from '../model/autorizacionPuestoCeroBean';
import {AuthService} from './auth-service.service';
import {IReprocesarMesaRequest} from '../interface/reprocesarMesa.interface';

@Injectable({
  providedIn: 'root'
})
export class ReprocesarMesaService {

  private readonly baseUrl: string;
  constructor(private readonly http: HttpClient, public auth: AuthService) {
    this.baseUrl = environment.apiUrlORC;
  }

  buscarMesaReprocesar(mesa: number){
    let params = new HttpParams()
      .set('codMesa', mesa);
    return this.http.get<any>(`${this.baseUrl}mesa/buscarReprocesarMesa`, {params});
  }

  save(data: Array<IReprocesarMesaRequest>){
    return this.http.post<IGenericInterface<any>>(`${this.baseUrl}reprocesar-mesa/save`,data);
  }

  autorizacionNacion(): Observable<GenericResponseBean<AutorizacionPuestoCeroBean>>{
    return this.http.post<GenericResponseBean<AutorizacionPuestoCeroBean>>(
      this.baseUrl + "reprocesar-mesa/check",
      {},
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      });
  }

  solicitarAccesoNacion(): Observable<GenericResponseBean<boolean>>{
    return this.http.post<GenericResponseBean<boolean>>(
      this.baseUrl + "reprocesar-mesa/solicitar",
      {},
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      });
  }

}
