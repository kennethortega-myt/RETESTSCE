import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GenericResponseBean } from '../model/genericResponseBean';
import { Observable } from 'rxjs';
import { FiltroMesaPorUbigeoNacion } from '../model/reportes/filtroMesaPorUbigeoNacion';
import { Constantes } from '../helper/constantes';
import {GlobalService} from "../service/global.service";

@Injectable({
  providedIn: 'root'
})
export class ReporteMesasUbigeoNacionApiService {

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

    getReporteMesasUbigeoNacionPdf(filtros: FiltroMesaPorUbigeoNacion, acronimo: string):Observable<GenericResponseBean<string>>{
      this.asignarUrlBackend();
      const headers = new HttpHeaders({
        [Constantes.HEADER_TENANT_ID]: acronimo
      });
      const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_MESAS_UBIGEO_POST_BASE64}`);
      return this.httpClient.post<GenericResponseBean<string>>(url, filtros, {headers});
      }

}
