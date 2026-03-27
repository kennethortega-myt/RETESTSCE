import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {AnexoRequestDto} from "../interface/anexos.interface";

@Injectable({
  providedIn: 'root'
})
export class AnexosApiService {

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,public auth: AuthService) {
    this.urlServidor = environment.apiUrl;
  }



  anexo1(data:AnexoRequestDto): Observable<any>{
    let HTTPOptions:Object = {
      headers: new HttpHeaders({
        'X-Tenant-Id': data.acronimo,
        'Authorization': "Bearer " + this.auth.getCToken()
      }),
      responseType: 'blob'
    }
    return this.httpClient.post<GenericResponseBean<string>>(`${this.urlServidor}/anexos/jee`,data,HTTPOptions);
  }

  votos(data:AnexoRequestDto): Observable<any>{
    let HTTPOptions:Object = {
      headers: new HttpHeaders({
        'X-Tenant-Id': data.acronimo,
        'Authorization': "Bearer " + this.auth.getCToken()
      }),
      responseType: 'blob'
    }
    return this.httpClient.post<GenericResponseBean<string>>(`${this.urlServidor}/anexos/votos`,data,HTTPOptions);
  }
  votosCifras(data:AnexoRequestDto): Observable<any>{
    let HTTPOptions:Object = {
      headers: new HttpHeaders({
        'X-Tenant-Id': data.acronimo,
        'Authorization': "Bearer " + this.auth.getCToken()
      }),
      responseType: 'blob'
    }
    return this.httpClient.post<GenericResponseBean<string>>(`${this.urlServidor}/anexos/votosCifras`,data,HTTPOptions);
  }
  mesasNoinstaladas(data:AnexoRequestDto): Observable<any>{
    let HTTPOptions:Object = {
      headers: new HttpHeaders({
        'X-Tenant-Id': data.acronimo,
        'Authorization': "Bearer " + this.auth.getCToken()
      }),
      responseType: 'blob'
    }
    return this.httpClient.post<GenericResponseBean<string>>(`${this.urlServidor}/anexos/mesasNoinstaladas`,data,HTTPOptions);
  }
  tablaActas(data:AnexoRequestDto): Observable<any>{
    let HTTPOptions:Object = {
      headers: new HttpHeaders({
        'X-Tenant-Id': data.acronimo,
        'Authorization': "Bearer " + this.auth.getCToken()
      }),
      responseType: 'blob'
    }
    return this.httpClient.post<GenericResponseBean<string>>(`${this.urlServidor}/anexos/tablaActas`,data,HTTPOptions);
  }
  maestraOrganizacionPolitica(data:AnexoRequestDto): Observable<any>{
    let HTTPOptions:Object = {
      headers: new HttpHeaders({
        'X-Tenant-Id': data.acronimo,
        'Authorization': "Bearer " + this.auth.getCToken()
      }),
      responseType: 'blob'
    }
    return this.httpClient.post<GenericResponseBean<string>>(`${this.urlServidor}/anexos/maestraOrganizacionPolitica`,data,HTTPOptions);
  }

  maestroUbigeo(data:AnexoRequestDto): Observable<any>{
    let HTTPOptions:Object = {
      headers: new HttpHeaders({
        'X-Tenant-Id': data.acronimo,
        'Authorization': "Bearer " + this.auth.getCToken()
      }),
      responseType: 'blob'
    }
    return this.httpClient.post<GenericResponseBean<string>>(`${this.urlServidor}/anexos/maestroUbigeo`,data,HTTPOptions);
  }

  odpe(data:AnexoRequestDto): Observable<any>{
    let HTTPOptions:Object = {
      headers: new HttpHeaders({
        'X-Tenant-Id': data.acronimo,
        'Authorization': "Bearer " + this.auth.getCToken()
      }),
      responseType: 'blob'
    }
    return this.httpClient.post<GenericResponseBean<string>>(`${this.urlServidor}/anexos/odpe`,data,HTTPOptions);
  }

  anexo2(data:AnexoRequestDto): Observable<any>{
    let HTTPOptions:Object = {
      headers: new HttpHeaders({
        'X-Tenant-Id': data.acronimo,
        'Authorization': "Bearer " + this.auth.getCToken()
      }),
      responseType: 'blob'
    }
    return this.httpClient.post<GenericResponseBean<string>>(`${this.urlServidor}/anexos/anexo2`,data,HTTPOptions);
  }

  total(data:AnexoRequestDto): Observable<any>{
    let HTTPOptions:Object = {
      headers: new HttpHeaders({
        'X-Tenant-Id': data.acronimo,
        'Authorization': "Bearer " + this.auth.getCToken()
      }),
      responseType: 'blob'
    }
    return this.httpClient.post<GenericResponseBean<string>>(`${this.urlServidor}/anexos/all`,data,HTTPOptions);
  }


}
