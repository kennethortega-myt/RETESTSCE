import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {ProcesoElectoralResponseBean} from "../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../model/eleccionResponseBean";
import {Constantes} from "../helper/constantes";
import {UbigeoDTO} from "../model/ubigeoElectoralBean";
import {MonitoreoListActasItemBean} from "../model/monitoreoListActasItemBean";
import {AmbitoBean} from "../model/ambitoBean";
import {ProcesoAmbitoBean} from "../model/procesoAmbitoBean";
import {CentroComputoBean} from "../model/centroComputoBean";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ReporteNacionApiService {

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient) {
    this.urlServidor = environment.apiUrl+'/';
  }

  obtenerProcesos():Observable<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>{
    return this.httpClient.get<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>(
      this.urlServidor + 'configuracionProcesoElectoral');
  }

  obtenerElecciones(idProceso: string):Observable<GenericResponseBean<EleccionResponseBean>>{
    return this.httpClient.get<GenericResponseBean<EleccionResponseBean>>(
      this.urlServidor +"proceso/"+idProceso+ Constantes.CB_PROCESO_CONTROLLER_LIST_ELECCIONES);
  }


  // solo se debe usar en nacion
  obtenerEleccionesNacion(idProceso: string,acronimo:string):Observable<GenericResponseBean<Array<EleccionResponseBean>>>{

    // Define tus encabezados aquí
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.httpClient.get<GenericResponseBean<Array<EleccionResponseBean>>>(
      this.urlServidor +"monitoreoNacion/"+idProceso+'/elecciones', opciones);
  }

  obtenerDepartamentosNacion(idEleccion: string,acronimo:string): Observable<Array<UbigeoDTO>>{

    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.httpClient.get<Array<UbigeoDTO>>(`${this.urlServidor}ubigeoEleccion/${idEleccion}/departamentos`, opciones);
  }

  obtenerProvinciasNacion(idDepartamento:string, idEleccion: string,acronimo:string): Observable<Array<UbigeoDTO>>{

    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.httpClient.get<Array<UbigeoDTO>>(`${this.urlServidor}ubigeoEleccion/${idEleccion}/departamento/${idDepartamento}/provincias`,opciones);

  }

  obtenerDistritosNacion(idProvincia:string,idEleccion: string,acronimo:string): Observable<Array<UbigeoDTO>>{

    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.httpClient.get<Array<UbigeoDTO>>(`${this.urlServidor}ubigeoEleccion/${idEleccion}/provincia/${idProvincia}/distritos`,opciones);
  }

  obtenerActasNacion(idProceso:number,idEleccion: string, idDepartamento:number, idProvincia:number, idDistrito:number, idLocal:number, acronimo:string): Observable<MonitoreoListActasItemBean>{

    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    let request = {
      'idProceso': idProceso,
      'idEleccion':idEleccion,
      'idDepartamento': idDepartamento,
      'idProvincia': idProvincia,
      'idUbigeo':idDistrito,
      'idLocal':idLocal,
    }

    return this.httpClient.post<MonitoreoListActasItemBean>(`${this.urlServidor}monitoreoNacion/listActas`,request,opciones);
  }


  getListAmbitos(acronimo:string):Observable<GenericResponseBean<Array<AmbitoBean>>>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };
    return this.httpClient.get<GenericResponseBean<Array<AmbitoBean>>>(`${this.urlServidor}monitoreoNacion/ambitos`,opciones);
  }

  getTipoAmbitoPorProceso(idProceso: string, acronimo: string):Observable<GenericResponseBean<ProcesoAmbitoBean>>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };
    return this.httpClient.get<GenericResponseBean<ProcesoAmbitoBean>>(`${this.urlServidor}monitoreoNacion/${idProceso}/tipoAmbito`, opciones);
  }

  getCentrosComputo(acronimo:string):Observable<GenericResponseBean<Array<CentroComputoBean>>>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };
    return this.httpClient.get<GenericResponseBean<Array<CentroComputoBean>>>(`${this.urlServidor}monitoreoNacion/centroComputo`, opciones);
  }

  getFile(idfile: string): Observable<any> {
    return this.httpClient.get(
      this.urlServidor +Constantes.CB_MONITOREO_CONTROLLER_FILE+idfile,{responseType:"blob"})
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
