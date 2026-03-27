import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FiltroOrganizacionesPoliticas } from '../model/reportes/filtroOrganizacionesPoliticas';
import { Observable } from 'rxjs';
import { GenericResponseBean } from '../model/genericResponseBean';
import { Constantes } from '../helper/constantes';
import {GlobalService} from "../service/global.service";
import {AuthService} from '../service/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteAutoridadesConsultaApiService {

  private readonly urlServidorCc: string;
  private readonly urlServidorNacion: string;
  private urlServidor: string;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly globalService: GlobalService,
    public auth: AuthService
  ) {
    this.urlServidorCc = environment.apiUrlORC;
    this.urlServidorNacion = environment.apiUrl;
  }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? this.urlServidorNacion : this.urlServidorCc);
  }

  getReporteAutoridadesEnConsultaCc(filtros: FiltroOrganizacionesPoliticas):Observable<GenericResponseBean<string>>{
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidorCc + Constantes.CB_REPORTE_AUTORIDADES_CONSULTA_POST_BASE64, filtros,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getReporteAutoridadesEnConsultaNacion(filtros: FiltroOrganizacionesPoliticas):Observable<GenericResponseBean<string>>{
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_AUTORIDADES_CONSULTA_POST_BASE64}`);
    return this.httpClient.post<GenericResponseBean<string>>(url, filtros);
  }
}
