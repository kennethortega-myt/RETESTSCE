import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {Constantes} from "../helper/constantes";
import {IPuestaCeroDTO} from "../interface/puestaCero.interface";

@Injectable({
  providedIn: 'root'
})
export class PuestaCeroNacionApiService {
  PUESTA_CERO_NACION = '/puesta-cero-nacion';
  PUESTA_CERO_STAE = '/puesta-cero-stae'
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,public auth: AuthService) {
    this.urlServidor = environment.apiUrl;
  }


  getReportePuestaCeroBase64(acronimo:string, procesoId: number, esquema: string, idPuestaCeroStae: any, idPuestaCeroVd: any): Observable<GenericResponseBean<string>>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo,
      'Authorization': "Bearer " + this.auth.getCToken()
    });
    const opciones = { headers: headers };
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor +this.PUESTA_CERO_NACION + "/reporte" ,{acronimo: acronimo, procesoId: procesoId, esquema:esquema, idPuestaCeroStae: idPuestaCeroStae, idPuestaCeroVd: idPuestaCeroVd},opciones);
  }

  autorizacion(clave:string): Observable<GenericResponseBean<any>>{
    return this.httpClient.post<GenericResponseBean<any>>(
      this.urlServidor + this.PUESTA_CERO_NACION + '/autorizacion',{}, {params:{clave:clave}});
  }

  puestaCero(data:IPuestaCeroDTO): Observable<GenericResponseBean<any>>{
    // Define tus encabezados aquí
    const headers = new HttpHeaders({
      'X-Tenant-Id': data.acronimo,
      'Authorization': "Bearer " + this.auth.getCToken()
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.httpClient.post<GenericResponseBean<any>>(
      this.urlServidor + this.PUESTA_CERO_NACION + "/",data,opciones);
  }


}
