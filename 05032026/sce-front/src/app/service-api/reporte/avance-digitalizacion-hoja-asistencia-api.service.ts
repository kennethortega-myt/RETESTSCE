import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GlobalService} from '../../service/global.service';
import {environment} from '../../../environments/environment';
import {FiltroReporteMesasObservaciones} from '../../model/reportes/filtroReporteMesasObservaciones';
import {Observable} from 'rxjs';
import {GenericResponseBean} from '../../model/genericResponseBean';
import {Constantes} from '../../helper/constantes';

@Injectable({
  providedIn: 'root'
})
export class AvanceDigitalizacionHojaAsistenciaApiService {

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

  getReporteAvanceDigitalizacionHojaAsistenciaNacion(filtro: FiltroReporteMesasObservaciones, acronimo: string):Observable<GenericResponseBean<string>>{
    this.asignarUrlBackend();
    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_AVANCE_DIGITALIZACION_HA_BASE64}`);
    return this.httpClient.post<GenericResponseBean<string>>(url, filtro, {headers});
  }

}
