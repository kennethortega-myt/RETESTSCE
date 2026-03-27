import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Constantes } from "../helper/constantes";
import { MonitoreoListActasItemBean } from "../model/monitoreoListActasItemBean";
import {AuthService} from '../service/auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class MonitoreoServiceApi {
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC.replace(/\/?$/, '/');;
  }

  obtenerActas(
    idProceso: number,
    idEleccion: string,
    mesa: string,
    estado: string): Observable<MonitoreoListActasItemBean>{

    let request = {
        'idProceso': idProceso,
        'idEleccion':idEleccion,
        'mesa':mesa,
        'grupoActa':estado,
    }

    return this.httpClient.post<MonitoreoListActasItemBean>(
      this.urlServidor +Constantes.CB_MONITOREO_CONTROLLER_LIST_ACTAS,request,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getFile(idfile: string): Observable<any> {
    return this.httpClient.get(
      this.urlServidor +Constantes.CB_MONITOREO_CONTROLLER_FILE+idfile,{
        responseType:"blob",
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      })
      .pipe(map(res =>this.validarDescargaBlob(res)));
  }

  validarDescargaBlob(data: any) {
    if (data.type === "image/tiff" && data.size > 0) {
      return new Blob([data], { type: "image/tiff" });
    } else {
      return null;
    }
  }

}
