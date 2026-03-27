import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {Constantes} from "../helper/constantes";
import {AutorizacionBean} from "../model/autorizacionBean";
import {TabAutorizacionBean} from "../model/tabAutorizacionBean";
import {AutorizacionCCRequestBean} from '../model/autorizacionCCRequestBean';
import {AutorizacionCCResponseBean} from '../model/autorizacionCCResponseBean';

@Injectable({
  providedIn: "root"
})
export class AutorizacionesApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  listAutorizaciones():  Observable<GenericResponseBean<Array<AutorizacionBean>>>{
    return this.httpClient.get<GenericResponseBean<Array<AutorizacionBean>>>(
      this.urlServidor + Constantes.CB_PUESTA_CERO_CONTROLLER_LIST_AUTORIZACION,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  aprobarAutorizacion(idAutorizacion: string): Observable<GenericResponseBean<TabAutorizacionBean>>{
    return this.httpClient.post<GenericResponseBean<TabAutorizacionBean>>(
      this.urlServidor + Constantes.CB_PUESTA_CERO_CONTROLLER_APPROVE_AUTORIZACION+idAutorizacion,{},
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  rechazarAutorizacionCC(idAutorizacion: string): Observable<GenericResponseBean<TabAutorizacionBean>>{
    return this.httpClient.post<GenericResponseBean<TabAutorizacionBean>>(
      this.urlServidor + Constantes.CB_PUESTA_CERO_CONTROLLER_RECHAZAR_AUTORIZACION+idAutorizacion,{},
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    )
  }

  recibirAutorizacion(request:AutorizacionCCRequestBean): Observable<GenericResponseBean<AutorizacionCCResponseBean>>{
    return this.httpClient.post<GenericResponseBean<AutorizacionCCResponseBean>>(
      this.urlServidor+Constantes.CB_AUTORIZACION_CC_CONTROLLER_RECIBIR_AUTORIZACION,
      request, {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  crearSolicitudAutorizacion(request:AutorizacionCCRequestBean): Observable<GenericResponseBean<boolean>>{
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor+Constantes.CB_AUTORIZACION_CC_CONTROLLER_CREAR_SOLICITUD,
      request, {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }
}
