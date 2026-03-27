import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {FiltroAvanceMesaBean} from "../model/filtroAvanceMesaBean";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {Constantes} from "../helper/constantes";
import {FiltroAvanceEstadoActaBean} from "../model/filtroAvanceEstadoActaBean";
import {AvanceEstadoActaReporteBean} from "../model/avanceEstadoActaReporteBean";
import {GlobalService} from "../service/global.service";

@Injectable({
  providedIn: 'root'
})
export class ReporteAvanceMesaNacionApiService {
  private urlServidor: string;

  constructor(
    private readonly httpClient: HttpClient,
    public auth: AuthService,
    private readonly globalService: GlobalService
  ) {
    this.urlServidor = environment.apiUrl;
  }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl : environment.apiUrlORC);
  }

  getReporteAvanceMesaPdf(filtroAvanceMesaBean: FiltroAvanceMesaBean):Observable<GenericResponseBean<string>>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': filtroAvanceMesaBean.acronimo
    });
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(this.urlServidor +"/"+ Constantes.CB_AVANCE_MESA_CONTROLLER_GET_REPORTE_BASE64);
    const opciones = { headers: headers };
    return this.httpClient.post<GenericResponseBean<string>>(url, filtroAvanceMesaBean, opciones);
  }

  getReporteAvanceEstadoActa(filtroAvanceEstadoActaBean: FiltroAvanceEstadoActaBean, acronimo:string):
    Observable<GenericResponseBean<AvanceEstadoActaReporteBean>>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_AVANCE_ESTADO_ACTA_CONTROLLER_POST_REPORTE}`);
    const opciones = { headers: headers };
    return this.httpClient.post<GenericResponseBean<AvanceEstadoActaReporteBean>>(url, filtroAvanceEstadoActaBean, opciones);
  }

  getReporteAvanceEstadoActaBase64(filtroAvanceEstadoActaBean: FiltroAvanceEstadoActaBean, acronimo:string):
    Observable<GenericResponseBean<string>>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(this.urlServidor +"/"+ Constantes.CB_AVANCE_ESTADO_ACTA_CONTROLLER_POST_BASE64);
    return this.httpClient.post<GenericResponseBean<string>>(url, filtroAvanceEstadoActaBean,opciones);
  }
}
