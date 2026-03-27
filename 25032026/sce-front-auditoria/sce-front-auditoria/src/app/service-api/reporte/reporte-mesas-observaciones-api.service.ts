import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { environment } from 'src/environments/environment';
import {GlobalService} from "../../service/global.service";
import {FiltroReporteMesasObservaciones} from '../../model/reportes/filtroReporteMesasObservaciones';

@Injectable({
  providedIn: 'root'
})
export class ReporteMesasObservacionesApiService {

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

  getReporteMesasObservacionesNacion(filtro: FiltroReporteMesasObservaciones, acronimo: string):Observable<GenericResponseBean<string>>{
    this.asignarUrlBackend();
    const headers = new HttpHeaders({
        [Constantes.HEADER_TENANT_ID]: acronimo
      });
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_MESAS_OBSERVACIONES_POST_BASE64}`);
    return this.httpClient.post<GenericResponseBean<string>>(url, filtro, {headers});
  }

}
