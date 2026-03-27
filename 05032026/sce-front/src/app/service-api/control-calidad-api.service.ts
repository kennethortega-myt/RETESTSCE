import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import { Observable} from "rxjs";
import {Constantes} from "../helper/constantes";
import { AuthService } from "../service/auth-service.service";
import { ControlCalidadSumaryResponse } from "../model/control-calidad/ControlCalidadSumaryResponse";
import { ActaPendienteControlCalidad } from "../model/control-calidad/ActaPendienteControlCalidad";
import { ResolucionActa } from "../model/control-calidad/ResolucionActa";
import { ImagenesPaso1 } from "../model/control-calidad/ImagenesPaso1";
import { GenericResponseBean } from "../model/genericResponseBean";
import { DatosActaRechazar } from "../model/control-calidad/DataPopupRechazar";
import { DataPaso2 } from "../model/control-calidad/DataPaso2";
import { DataPaso3, DatosActaAceptar } from "../model/control-calidad/DataPaso3";
import { AutorizacionReprocesamientoBean } from "../model/autorizacionReprocesamientoBean";

@Injectable({
  providedIn: 'root'
})
export class ControlCalidadApiService {

  private readonly urlServidor: string;
  
    constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
      this.urlServidor = environment.apiUrlORC;
    }
  
    obtenerResumen(codigoEleccion: string): Observable<ControlCalidadSumaryResponse>{
      return this.httpClient.get<ControlCalidadSumaryResponse>(
        `${this.urlServidor}${Constantes.CB_CONTROL_CALIDAD_SUMMARY}${codigoEleccion}`,        
        {
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
        });
    }

    obtenerActasPendientes(codigoEleccion: string): Observable<ActaPendienteControlCalidad[]>{
      return this.httpClient.get<ActaPendienteControlCalidad[]>(
        `${this.urlServidor}${Constantes.CB_CONTROL_CALIDAD_ACTAS_PENDIENTES}${codigoEleccion}`,        
        {
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
        });
    }

    obtenerResolucionesActa(idActa: number): Observable<ResolucionActa[]>{
      return this.httpClient.get<ResolucionActa[]>(
        `${this.urlServidor}${Constantes.CB_CONTROL_CALIDAD_RESOLUCIONES_ACTAS}${idActa}`,        
        {
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
        });
    }

    obtenerIdsImagenesPaso1(idActa: number): Observable<ImagenesPaso1>{
      return this.httpClient.get<ImagenesPaso1>(
        `${this.urlServidor}${Constantes.CB_CONTROL_CALIDAD_IDS_IMAGENES_PASO_1}${idActa}`,        
        {
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
        });
    }

    rechazar(request: DatosActaRechazar): Observable<GenericResponseBean<boolean>>{
      return this.httpClient.post<GenericResponseBean<boolean>>(
        `${this.urlServidor}${Constantes.CB_CONTROL_CALIDAD_RECHAZAR}`,
        request,        
        {
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
        });
    }

    observar(idActa: number): Observable<GenericResponseBean<boolean>>{
      const params = new HttpParams()
            .set('idActa', idActa);
      return this.httpClient.post<GenericResponseBean<boolean>>(
        `${this.urlServidor}${Constantes.CB_CONTROL_CALIDAD_OBSERVAR}`, 
        null,              
        {
          params:params,
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
        });
    }

    obtenerDataPaso2(idActa: number): Observable<DataPaso2>{
      return this.httpClient.get<DataPaso2>(
        `${this.urlServidor}${Constantes.CB_CONTROL_CALIDAD_DATA_PASO_2}${idActa}`,        
        {
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
        });
    }

    aceptar(request: DatosActaAceptar): Observable<GenericResponseBean<boolean>>{      
      return this.httpClient.post<GenericResponseBean<boolean>>(
        `${this.urlServidor}${Constantes.CB_CONTROL_CALIDAD_ACEPTAR}`, 
        request,              
        {          
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
        });
    }

    obtenerDataPaso3(idActa: number): Observable<GenericResponseBean<DataPaso3>>{
      return this.httpClient.get<GenericResponseBean<DataPaso3>>(
        `${this.urlServidor}${Constantes.CB_CONTROL_CALIDAD_DATA_PASO_3}${idActa}`,        
        {
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
        });
    }

    obtenerHistorialAntesDespues(idActa: number, idResolucion:number): Observable<GenericResponseBean<any>>{
      const params = new HttpParams()
            .set('idActa', idActa)
            .set('idResolucion', idResolucion);
      return this.httpClient.get<GenericResponseBean<any>>(
        `${this.urlServidor}${Constantes.CB_CONTROL_CALIDAD_HISTORIAL_ANTES_DESPUES}`, 
        {
          params:params,
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
        });
    }

    consultaAutorizacion(idDocumento: number, tipoDocumento: string): Observable<GenericResponseBean<AutorizacionReprocesamientoBean>>{
      const params = new HttpParams()
          .set('idDocumento', idDocumento)
          .set('tipoDocumento', tipoDocumento);
      return this.httpClient.post<GenericResponseBean<AutorizacionReprocesamientoBean>>(
        this.urlServidor + Constantes.CB_CONTROL_CALIDAD_CONSULTA_AUTORIZACION,
        null,
        {
          params,
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
        }
      );
    }
  
    solicitarAutorizacion(idDocumento: number, tipoDocumento: string, idActa: number): Observable<GenericResponseBean<boolean>>{
      const params = new HttpParams()
          .set('idDocumento', idDocumento)
          .set('tipoDocumento', tipoDocumento)
          .set('idActa', idActa);
      return this.httpClient.post<GenericResponseBean<boolean>>(
        this.urlServidor + Constantes.CB_CONTROL_CALIDAD_SOLICITA_AUTORIZACION,
        null,
        {
          params,
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
        }
      );
    }

    cancelar(idsActas: number[]): Observable<GenericResponseBean<boolean>>{
      const body = idsActas;
      
      return this.httpClient.post<GenericResponseBean<boolean>>(
        `${this.urlServidor}${Constantes.CB_CONTROL_CALIDAD_CANCELAR}`, 
        body,              
        {          
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
        });
    }  
    
}
