import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GenericResponseBean } from "../model/genericResponseBean";
import { ProcesoElectoralResponseBean } from "../model/procesoElectoralResponseBean";
import { Constantes } from "../helper/constantes";
import { EleccionResponseBean } from "../model/eleccionResponseBean";
import { MonitoreoCargarPaginacionParams, MonitoreoListActasItemBean, MonitoreoObtenerActasNacionParams } from "../model/monitoreoListActasItemBean";
import {UbigeoDTO } from "../model/ubigeoElectoralBean";
import {AmbitoBean} from "../model/ambitoBean";
import {ProcesoAmbitoBean} from "../model/procesoAmbitoBean";
import {CentroComputoBean} from "../model/centroComputoBean";
import { EstadoMesaPorTipoReporteBean } from "../model/estadoMesaPorTipoReporteBean";
import { DetCatalogoEstructuraBean } from "../model/DetCatalogoEstructuraBean";
import {GlobalService} from "../service/global.service";

@Injectable({
  providedIn: 'root'
})
export class MonitoreoNacionApiService {

  private urlServidor: string;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly globalService: GlobalService
  )
  {
    this.urlServidor = environment.apiUrl+'/';
  }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl+'/' : environment.apiUrlORC);
  }

  obtenerProcesos():Observable<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>{
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(this.urlServidor + 'configuracionProcesoElectoral');
    return this.httpClient.get<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>(url);
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

  obtenerEleccionesPreferencialesNacion(idProceso: string,acronimo:string):Observable<GenericResponseBean<Array<EleccionResponseBean>>>{

    // Define tus encabezados aquí
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.httpClient.get<GenericResponseBean<Array<EleccionResponseBean>>>(
      this.urlServidor +"monitoreoNacion/"+idProceso+'/eleccionesPreferencial', opciones);
  }

  obtenerDepartamentosNacion(idEleccion: string,acronimo:string): Observable<GenericResponseBean<Array<UbigeoDTO>>>{

    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.httpClient.get<GenericResponseBean<Array<UbigeoDTO>>>(`${this.urlServidor}ubigeoEleccion/${idEleccion}/departamentos`, opciones);
  }

  obtenerProvinciasNacion(idDepartamento:string, idEleccion: string,acronimo:string, esquema: string, idCentroComputo: string): Observable<GenericResponseBean<Array<UbigeoDTO>>>{

    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.httpClient.get<GenericResponseBean<Array<UbigeoDTO>>>(`${this.urlServidor}comun/ubigeo/${idEleccion}/departamento/${idDepartamento}/provincias/${esquema}/idCentroComputo/${idCentroComputo}`,opciones);

  }

  obtenerDistritosNacion(idProvincia:string,idEleccion: string,acronimo:string, esquema: string, idCentroComputo: string): Observable<GenericResponseBean<Array<UbigeoDTO>>>{

    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.httpClient.get<GenericResponseBean<Array<UbigeoDTO>>>(`${this.urlServidor}comun/ubigeo/${idEleccion}/provincia/${idProvincia}/distritos/${esquema}/idCentroComputo/${idCentroComputo}`,opciones);
  }

  obtenerArchivo(idArchivo: number, acronimo:string){
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };
    return this.httpClient.get<GenericResponseBean<string>>(`${this.urlServidor}monitoreoNacion/archivo/${idArchivo}`,opciones);
  }

  obtenerActasNacion(params: MonitoreoObtenerActasNacionParams): Observable<MonitoreoListActasItemBean>{

    const headers = new HttpHeaders({
      'X-Tenant-Id': params.acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    let request = {
      'idProceso': params.idProceso,
      'idEleccion': params.idEleccion,
      'idDepartamento': params.idDepartamento,
      'idProvincia': params.idProvincia,
      'idUbigeo': params.idDistrito,
      'idLocal': params.idLocal,
      'mesa': params.mesa,
      'grupoActa': params.estado,
      'cantidadPorpagina': params.cantidad,
      'pageIndex': params.pageIndex,
    }

    return this.httpClient.post<MonitoreoListActasItemBean>(`${this.urlServidor}monitoreoNacion/listActas`,request,opciones);
  }

  obtenerPaginacion(params: MonitoreoCargarPaginacionParams): Observable<any>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': params.acronimo
    });
    const para = {cantidad: params.cantidad};

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers,params:para };

    let request = {
      'idProceso': params.idProceso,
      'idEleccion': params.idEleccion,
      'idDepartamento': params.idDepartamento,
      'idProvincia': params.idProvincia,
      'idUbigeo': params.idDistrito,
      'idLocal': params.idLocal,
      'mesa': params.mesa,
      'grupoActa': params.estado,
    }

    return this.httpClient.post<any>(`${this.urlServidor}monitoreoNacion/paginacion`,request,opciones);
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

  obtenerUbigeoNivelUnoPorEleccionYCentroComputo(idEleccion: number, idCentroComputo: number, esquema: string, acronimo:string): Observable<GenericResponseBean<Array<UbigeoDTO>>>{

    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });

    return this.httpClient.get<GenericResponseBean<Array<UbigeoDTO>>>(
      `${this.urlServidor}comun/ubigeo/buscar-nivel-ubigeo-uno-por-eleccion-y-centro-computo/${idEleccion}/${idCentroComputo}/${esquema}`, {headers});
  }

  obtenerAmbitoElectoralPorIdCentroComputo(idCentroComputo: number, esquema: string, acronimo:string): Observable<GenericResponseBean<Array<AmbitoBean>>>{
    this.asignarUrlBackend();
    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}comun/ambito-electoral/buscar-por-centro-computo/${idCentroComputo}/${esquema}`);
    return this.httpClient.get<GenericResponseBean<Array<AmbitoBean>>>(url, {headers})
      .pipe(
        map(response => this.filterCentroComputo(response))
      );
  }

  obtenerProcesosElectorales():Observable<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>{
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(this.urlServidor + 'comun/proceso-electoral');
    return this.httpClient.get<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>(url);
  }
  obtenerCentroComputo(esquema: string, acronimo: string):Observable<GenericResponseBean<Array<CentroComputoBean>>> {

    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });

    return this.httpClient.get<GenericResponseBean<Array<CentroComputoBean>>>(
      `${this.urlServidor}comun/centro-computo-por-eleccion/${esquema}`,
      { headers })
      .pipe(
        map(response => this.filterCentroComputo(response))
      );
  }
  obtenerCentroComputoPorIdEleccion(idEleccion: number, esquema: string, acronimo:string):Observable<GenericResponseBean<Array<CentroComputoBean>>> {
    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });
    return this.httpClient.get<GenericResponseBean<Array<CentroComputoBean>>>(
      `${this.urlServidor}comun/centro-computo-por-eleccion/${idEleccion}/${esquema}`,
      { headers })
      .pipe(
        map(response => this.filterCentroComputo(response))
      );
  }
  obtenerEstadoMesaPorTipoDocumento(): Observable<EstadoMesaPorTipoReporteBean[]> {
    return this.httpClient.get<Array<any>>('assets/data/estadosMesaPorTipoReporte.json');
  }

  obtenerEleccionesPorIdProcesoElectoral(idProcesoElectoral: number, esquema: string, acronimo:string):Observable<GenericResponseBean<Array<EleccionResponseBean>>> {
    this.asignarUrlBackend()
    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}comun/eleccion-por-proceso-electoral/${idProcesoElectoral}/${esquema}`,);
    return this.httpClient.get<GenericResponseBean<Array<EleccionResponseBean>>>(url, { headers });
  }

  obtenerUbigeoNivelUnoPorAmbitoElectoral(idEleccion: number, idAmbitoElectoral: number, esquema: string, acronimo:string): Observable<GenericResponseBean<Array<UbigeoDTO>>>{
    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });

    return this.httpClient.get<GenericResponseBean<Array<UbigeoDTO>>>(
      `${this.urlServidor}comun/ubigeo/buscar-nivel-ubigeo-uno/${idEleccion}/${idAmbitoElectoral}/${esquema}`, {headers});
  }

  obtenerTipoEstadoReporte(esquema: string, tipoReporte: string, acronimo:string): Observable<GenericResponseBean<Array<DetCatalogoEstructuraBean>>> {

    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });

    return this.httpClient.get<GenericResponseBean<Array<DetCatalogoEstructuraBean>>>(`${this.urlServidor}comun/det-catalogo-estructura/${esquema}/${tipoReporte}`, {headers});
  }

  obtenerAmbitoElectoralPorIdEleccion(idEleccion: number, esquema: string, acronimo:string): Observable<GenericResponseBean<Array<AmbitoBean>>>{
    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });
    return this.httpClient.get<GenericResponseBean<Array<AmbitoBean>>>(
      `${this.urlServidor}comun/ambito-electoral/buscar-por-eleccion/${idEleccion}/${esquema}`, {headers})
      .pipe(
        map(response => this.filterCentroComputo(response))
      );
  }

  obtenerCentroComputoPorIdAmbitoElectoral(idAmbito: number, esquema: string, acronimo:string):Observable<GenericResponseBean<Array<CentroComputoBean>>> {
    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });
    return this.httpClient.get<GenericResponseBean<Array<CentroComputoBean>>>(
      `${this.urlServidor}comun/centro-computo-por-ambito/${idAmbito}/${esquema}`, {headers})
      .pipe(
        map(response => this.filterCentroComputo(response))
      );
  }

  obtenerDistritoElectoralPorAmbito(idAmbitoElectoral: number, esquema: string, acronimo:string): Observable<GenericResponseBean<Array<UbigeoDTO>>>{

    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });

    return this.httpClient.get<GenericResponseBean<Array<UbigeoDTO>>>
        (`${this.urlServidor}comun/ubigeo/buscar-distrito-electoral-ambito/${idAmbitoElectoral}/${esquema}`, {headers})
        .pipe(
          map(response => this.filterDistritoElectoral(response))
        );
  }

  obtenerNivelUbigeoDosPorDistritoElec(idDistritoElectoral: number, esquema: string, acronimo:string): Observable<GenericResponseBean<Array<UbigeoDTO>>>{

    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });
    return this.httpClient.get<GenericResponseBean<Array<UbigeoDTO>>>
        (`${this.urlServidor}comun/ubigeo/buscar-nivel-ubigeo-dos-distrito-elec/${idDistritoElectoral}/${esquema}`, {headers});
  }

  obtenerEstadosSistemasAutomatizados(esquema: string, tipo: string, acronimo:string): Observable<GenericResponseBean<Array<DetCatalogoEstructuraBean>>> {

    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });

    return this.httpClient.get<GenericResponseBean<Array<DetCatalogoEstructuraBean>>>(`${this.urlServidor}comun/det-catalogo-estructura/${esquema}/${tipo}`, {headers});
  }

  private filterCentroComputo(response: GenericResponseBean<Array<CentroComputoBean>>): GenericResponseBean<Array<CentroComputoBean>> {
    if (!this.globalService.isNacionUser) {
      response.data = response.data.filter(centroComputo => centroComputo.nombre !== 'NACION');
    }
    return response;
  }

  private filterDistritoElectoral(response: GenericResponseBean<Array<UbigeoDTO>>): GenericResponseBean<Array<UbigeoDTO>> {
    if (!this.globalService.isNacionUser) {
      response.data = response.data.filter(de => de.nombre !== 'NACION');
    }
    return response;
  }

}
