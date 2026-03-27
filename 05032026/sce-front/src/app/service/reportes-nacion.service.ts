import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {ProcesoElectoralResponseBean} from "../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../model/eleccionResponseBean";
import {UbigeoDTO} from "../model/ubigeoElectoralBean";
import {MonitoreoListActasItemBean} from "../model/monitoreoListActasItemBean";
import {AmbitoBean} from "../model/ambitoBean";
import {ProcesoAmbitoBean} from "../model/procesoAmbitoBean";
import {CentroComputoBean} from "../model/centroComputoBean";
import {ReporteNacionApiService} from "../service-api/reporte-nacion-api.service";

@Injectable({
  providedIn: 'root'
})
export class ReportesNacionService {

  constructor(private readonly reportesNacionServiceApi:ReporteNacionApiService) {}

  obtenerProcesos(): Observable<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>{
    return this.reportesNacionServiceApi.obtenerProcesos();
  }

  obtenerEleccionesNacion(idProceso: string,acronimo:string): Observable<GenericResponseBean<Array<EleccionResponseBean>>>{
    return this.reportesNacionServiceApi.obtenerEleccionesNacion(idProceso,acronimo);
  }

  obtenerDepartamentosNacion(idEleccion: string, acronimo:string):Observable<Array<UbigeoDTO>>{
    return this.reportesNacionServiceApi.obtenerDepartamentosNacion(idEleccion,acronimo);
  }

  obtenerProvinciasNacion(idDepartamento:string, idEleccion: string, acronimo:string):Observable<Array<UbigeoDTO>>{
    return this.reportesNacionServiceApi.obtenerProvinciasNacion(idDepartamento,idEleccion,acronimo);
  }

  obtenerDistritosNacion(idProvincia:string,idEleccion: string, acronimo:string):Observable<Array<UbigeoDTO>>{
    return this.reportesNacionServiceApi.obtenerDistritosNacion(idProvincia,idEleccion,acronimo);
  }

  obtenerActasNacion(idProceso:number, idEleccion: string, idDepartamento:number, idProvincia:number, idDistrito:number, idLocal:number, acronimo:string): Observable<MonitoreoListActasItemBean>{
    return this.reportesNacionServiceApi.obtenerActasNacion(idProceso,idEleccion,idDepartamento,idProvincia,idDistrito,idLocal,acronimo);
  }

  getFile(idfile: string): Observable<any> {
    return this.reportesNacionServiceApi.getFile(idfile);
  }

  getListAmbitos(acronimo:string): Observable<GenericResponseBean<Array<AmbitoBean>>>{
    return this.reportesNacionServiceApi.getListAmbitos(acronimo);
  }

  getTipoAmbitoPorProceso(idProceso: string, acronimo:string):Observable<GenericResponseBean<ProcesoAmbitoBean>>{
    return this.reportesNacionServiceApi.getTipoAmbitoPorProceso(idProceso, acronimo);
  }

  getCentrosComputo(acronimo:string):Observable<GenericResponseBean<Array<CentroComputoBean>>>{
    return this.reportesNacionServiceApi.getCentrosComputo(acronimo);
  }


}
