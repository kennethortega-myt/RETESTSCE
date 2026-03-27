import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {Constantes} from "../helper/constantes";
import {TabAutorizacionBean} from "../model/tabAutorizacionBean";
import { AutorizacionNacionBean } from "../model/autorizacionNacionBean";
import {AutorizacionRequestBean} from '../model/autorizacionRequestBean';

@Injectable({
  providedIn: "root"
})
export class AutorizacionesNacionApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,public auth: AuthService) {
    this.urlServidor = environment.apiUrl;
  }

  listAutorizaciones(idProceso:number, acronimo:string): Observable<GenericResponseBean<Array<AutorizacionNacionBean>>>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    const opciones = { headers: headers };
    let request = {
      'idProceso': idProceso
    }
    return this.httpClient.post<GenericResponseBean<Array<AutorizacionNacionBean>>>(this.urlServidor+Constantes.CB_AUTORIZACION_CONTROLLER_LIST,request,opciones);
  }

  aprobarAutorizacion(acronimo:string, filtro: AutorizacionRequestBean): Observable<GenericResponseBean<TabAutorizacionBean>>{

    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    const opciones = { headers: headers };
    return this.httpClient.post<GenericResponseBean<TabAutorizacionBean>>(this.urlServidor+Constantes.CB_AUTORIZACION_CONTROLLER_APROB,
      filtro,
      opciones);

  }

  cancelarAutorizacion(acronimo:string, filtro: AutorizacionRequestBean): Observable<GenericResponseBean<TabAutorizacionBean>>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    const opciones = { headers: headers };
    return this.httpClient.post<GenericResponseBean<TabAutorizacionBean>>(this.urlServidor+Constantes.CB_AUTORIZACION_CONTROLLER_RECHAZAR,
      filtro,
      opciones);
  }
}
