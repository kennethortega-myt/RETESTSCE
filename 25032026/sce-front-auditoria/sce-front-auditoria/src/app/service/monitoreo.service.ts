import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { MonitoreoServiceApi } from "../service-api/monitoreo-service-api.service";
import { MonitoreoListActasItemBean } from "../model/monitoreoListActasItemBean";

@Injectable({
  providedIn: 'root',
})
export class MonitoreoService{
  constructor(private readonly monitoreoServiceApi:MonitoreoServiceApi) {}

  obtenerActas(
    idProceso: number,
    idEleccion: string,
    mesa: string,
    estado: string): Observable<MonitoreoListActasItemBean>{
    return this.monitoreoServiceApi.obtenerActas(
      idProceso,
      idEleccion,
      mesa,
      estado);
  }
  getFile(idfile: string): Observable<any> {
    return this.monitoreoServiceApi.getFile(idfile);
  }
}
