import { Injectable } from '@angular/core';
import {map, Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {ProcesoElectoralResponseBean} from "../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../model/eleccionResponseBean";
import {MonitoreoCargarPaginacionParams, MonitoreoListActasItemBean, MonitoreoObtenerActasNacionParams} from "../model/monitoreoListActasItemBean";
import {MonitoreoNacionApiService} from "../service-api/monitoreo-nacion-api.service";
import {UbigeoDTO} from "../model/ubigeoElectoralBean";
import {AmbitoBean} from "../model/ambitoBean";
import {ProcesoAmbitoBean} from "../model/procesoAmbitoBean";
import {CentroComputoBean} from "../model/centroComputoBean";
import { EstadoMesaPorTipoReporteBean } from '../model/estadoMesaPorTipoReporteBean';
import { DetCatalogoEstructuraBean } from '../model/DetCatalogoEstructuraBean';

@Injectable({
  providedIn: 'root'
})
export class MonitoreoNacionService {

  constructor(private readonly monitoreoServiceApi: MonitoreoNacionApiService) { }

  obtenerProcesos(): Observable<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>{
    return this.monitoreoServiceApi.obtenerProcesos();
  }

  obtenerEleccionesNacion(idProceso: string,acronimo:string): Observable<GenericResponseBean<Array<EleccionResponseBean>>>{
    return this.monitoreoServiceApi.obtenerEleccionesNacion(idProceso,acronimo);
  }

  obtenerEleccionesPreferencialesNacion(idProceso: string,acronimo:string): Observable<GenericResponseBean<Array<EleccionResponseBean>>>{
    return this.monitoreoServiceApi.obtenerEleccionesPreferencialesNacion(idProceso,acronimo);
  }

  obtenerDepartamentosNacion(idEleccion: string, acronimo: string): Observable<GenericResponseBean<Array<UbigeoDTO>>> {
    return this.monitoreoServiceApi.obtenerDepartamentosNacion(idEleccion, acronimo);
  }

  obtenerProvinciasNacion(idDepartamento: string, idEleccion: string, acronimo: string, esquema: string, idAmbitoElectoral: string): Observable<GenericResponseBean<Array<UbigeoDTO>>> {
    return this.monitoreoServiceApi.obtenerProvinciasNacion(idDepartamento, idEleccion, acronimo, esquema, idAmbitoElectoral);
  }

  obtenerDistritosNacion(idProvincia: string, idEleccion: string, acronimo: string, esquema: string, idAmbitoElectoral: string): Observable<GenericResponseBean<Array<UbigeoDTO>>> {
    return this.monitoreoServiceApi.obtenerDistritosNacion(idProvincia, idEleccion, acronimo, esquema, idAmbitoElectoral);
  }

  obtenerActasNacion(params: MonitoreoObtenerActasNacionParams): Observable<MonitoreoListActasItemBean> {
    return this.monitoreoServiceApi.obtenerActasNacion(params);
  }

  cargarPaginacion(params: MonitoreoCargarPaginacionParams): Observable<any> {
    return this.monitoreoServiceApi.obtenerPaginacion(params);
  }

  getFile(idfile: string): Observable<any> {
    return this.monitoreoServiceApi.getFile(idfile);
  }

  getListAmbitos(acronimo: string): Observable<GenericResponseBean<Array<AmbitoBean>>> {
    return this.monitoreoServiceApi.getListAmbitos(acronimo);
  }

  getTipoAmbitoPorProceso(idProceso: string, acronimo: string): Observable<GenericResponseBean<ProcesoAmbitoBean>> {
    return this.monitoreoServiceApi.getTipoAmbitoPorProceso(idProceso, acronimo);
  }

  getCentrosComputo(acronimo: string): Observable<GenericResponseBean<Array<CentroComputoBean>>> {
    return this.monitoreoServiceApi.getCentrosComputo(acronimo);
  }

  obtenerUbigeoNivelUnoPorEleccionYCentroComputo(idEleccion: number, idCentroComputo: number, esquema: string, acronimo:string): Observable<GenericResponseBean<Array<UbigeoDTO>>> {
    return this.monitoreoServiceApi.obtenerUbigeoNivelUnoPorEleccionYCentroComputo(idEleccion, idCentroComputo, esquema, acronimo);
  }
  obtenerAmbitoElectoralPorIdCentroComputo(idCentroComputo: number, esquema: string, acronimo:string): Observable<GenericResponseBean<Array<AmbitoBean>>> {
      return this.monitoreoServiceApi.obtenerAmbitoElectoralPorIdCentroComputo(idCentroComputo, esquema, acronimo);
  }
  obtenerProcesosElectorales(): Observable<GenericResponseBean<Array<ProcesoElectoralResponseBean>>> {
    return this.monitoreoServiceApi.obtenerProcesosElectorales();
  }
  obtenerCentroComputo(esquema: string, acronimo: string):Observable<GenericResponseBean<Array<CentroComputoBean>>> {
    return this.monitoreoServiceApi.obtenerCentroComputo(esquema, acronimo);
  }
  obtenerCentroComputoPorIdEleccion(idEleccion: number, esquema: string, acronimo:string):Observable<GenericResponseBean<Array<CentroComputoBean>>> {
    return this.monitoreoServiceApi.obtenerCentroComputoPorIdEleccion(idEleccion, esquema, acronimo);
  }
  obtenerEstadoMesaPorTipoDocumento(idTipoReporte: number): Observable<EstadoMesaPorTipoReporteBean> {
    return this.monitoreoServiceApi.obtenerEstadoMesaPorTipoDocumento()
    .pipe(
      map(data => data.find(x => x.idTipoReporte == idTipoReporte))
    );
  }
  obtenerEleccionesPorIdProcesoElectoral(idProcesoElectoral: number, esquema: string, acronimo:string):Observable<GenericResponseBean<Array<EleccionResponseBean>>> {
    return this.monitoreoServiceApi.obtenerEleccionesPorIdProcesoElectoral(idProcesoElectoral,esquema, acronimo);
  }
  obtenerUbigeoNivelUnoPorAmbitoElectoral(idEleccion: number, idAmbitoElectoral: number, esquema: string, acronimo:string): Observable<GenericResponseBean<Array<UbigeoDTO>>> {
    return this.monitoreoServiceApi.obtenerUbigeoNivelUnoPorAmbitoElectoral(idEleccion, idAmbitoElectoral, esquema, acronimo);
  }

  obtenerTipoEstadoReporte(esquema: string, tipoReporte: string , acronimo:string): Observable<GenericResponseBean<Array<DetCatalogoEstructuraBean>>> {
    return this.monitoreoServiceApi.obtenerTipoEstadoReporte(esquema, tipoReporte, acronimo);
  }
  obtenerAmbitoElectoralPorIdEleccion(idEleccion: number, esquema: string, acronimo:string): Observable<GenericResponseBean<Array<AmbitoBean>>> {
    return this.monitoreoServiceApi.obtenerAmbitoElectoralPorIdEleccion(idEleccion, esquema, acronimo);
  }
  obtenerCentroComputoPorIdAmbitoElectoral(idAmbito: number, esquema: string, acronimo:string):Observable<GenericResponseBean<Array<CentroComputoBean>>> {
    return this.monitoreoServiceApi.obtenerCentroComputoPorIdAmbitoElectoral(idAmbito, esquema, acronimo);
  }

  obtenerDistritoElectoralPorAmbito(idAmbitoElectoral: number, esquema: string, acronimo:string): Observable<GenericResponseBean<Array<UbigeoDTO>>>{
    return this.monitoreoServiceApi.obtenerDistritoElectoralPorAmbito(idAmbitoElectoral, esquema, acronimo);
  }

  obtenerNivelUbigeoDosPorDistritoElec(idDistritoElectoral: number, esquema: string, acronimo:string): Observable<GenericResponseBean<Array<UbigeoDTO>>>{
    return this.monitoreoServiceApi.obtenerNivelUbigeoDosPorDistritoElec(idDistritoElectoral, esquema, acronimo);
  }

  obtenerArchivo(idArchivo: number, acronimo: string): Observable<GenericResponseBean<string>>{
    return this.monitoreoServiceApi.obtenerArchivo(idArchivo, acronimo);
  }

  obtenerEstadosSistemasAutomatizados(esquema: string, tipo: string , acronimo:string): Observable<GenericResponseBean<Array<DetCatalogoEstructuraBean>>> {
    return this.monitoreoServiceApi.obtenerEstadosSistemasAutomatizados(esquema, tipo, acronimo);
  }

}
