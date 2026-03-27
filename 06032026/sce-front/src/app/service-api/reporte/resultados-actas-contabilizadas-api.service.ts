import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroResultados, ResultadosActasContabilizadas, ResultadosActasContabilizadasCPR } from 'src/app/model/reportes/resultados-actas-contabilizadas';
import { environment } from 'src/environments/environment';
import {GlobalService} from "../../service/global.service";

@Injectable({
  providedIn: 'root'
})
export class ResultadosActasContabilizadasApiService {

  private urlServidor: string;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly globalService: GlobalService
  ) {
    this.urlServidor = environment.apiUrl;
  }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl : environment.apiUrlORC);
  }

  getResultadosActasContabilizadasNacion(filtros: FiltroResultados):
    Observable<GenericResponseBean<ResultadosActasContabilizadas>>{
    const opciones = this.agregarTenantHeader(filtros);
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_RESULTADOS_ACTAS_CONTABILIZADAS}`);
    return this.httpClient.post<GenericResponseBean<ResultadosActasContabilizadas>>(url, filtros, opciones);
  }

  getResultadosActasContabilizadasNacionPDF(filtros: FiltroResultados):Observable<GenericResponseBean<string>>{
    const opciones = this.agregarTenantHeader(filtros);
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_RESULTADOS_ACTAS_CONTABILIZADAS_BASE64}`);
    return this.httpClient.post<GenericResponseBean<string>>(url, filtros, opciones);
  }

  getResultadosActasContabilizadasCPRNacion(filtros: FiltroResultados):
    Observable<GenericResponseBean<ResultadosActasContabilizadasCPR>>{
    const opciones = this.agregarTenantHeader(filtros);
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_RESULTADOS_ACTAS_CONTABILIZADAS}`);
    return this.httpClient.post<GenericResponseBean<ResultadosActasContabilizadasCPR>>(url, filtros, opciones);
  }

  private agregarTenantHeader(filtros: FiltroResultados) {
    const headers = new HttpHeaders({
      'X-Tenant-Id': filtros.acronimo
    });
    const opciones = {headers: headers};
    return opciones;
  }
}
