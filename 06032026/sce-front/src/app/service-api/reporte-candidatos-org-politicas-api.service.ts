import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseBean } from '../model/genericResponseBean';
import { Constantes } from '../helper/constantes';
import { FiltroOrganizacionesPoliticas } from '../model/reportes/filtroOrganizacionesPoliticas';
import {GlobalService} from "../service/global.service";
import {AuthService} from '../service/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteCandidatosOrgPoliticasApiService {

  private readonly urlServidorOrc: string;
  private readonly urlServidorNacion: string;
  private urlServidor: string;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly globalService: GlobalService,
    public auth: AuthService
  ) {
    this.urlServidorOrc = environment.apiUrlORC;
    this.urlServidorNacion = environment.apiUrl;
  }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? this.urlServidorNacion : this.urlServidorOrc);
  }

  getReporteCandidatosOrgPoliticaCc(filtros: FiltroOrganizacionesPoliticas):Observable<GenericResponseBean<string>>{
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidorOrc + Constantes.CB_REPORTE_CANDIDATOS_ORG_POLITICA_POST_BASE64, filtros,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getReporteCandidatosOrgPoliticaNacion(filtros: FiltroOrganizacionesPoliticas, acronimo: string):Observable<GenericResponseBean<string>>{
    this.asignarUrlBackend();
    const headers = new HttpHeaders({
                  'X-Tenant-Id': acronimo
              });
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_CANDIDATOS_ORG_POLITICA_POST_BASE64}`);
    return this.httpClient.post<GenericResponseBean<string>>(url, filtros, { headers: headers });
  }
}
