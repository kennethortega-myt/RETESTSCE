import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GenericResponseBean } from '../model/genericResponseBean';
import { Observable } from 'rxjs';
import { FiltroMesaPorUbigeoBean } from '../model/reportes/filtroMesaPorUbigeo';
import { Constantes } from '../helper/constantes';
import {AuthService} from '../service/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteMesasUbigeoApiService {

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  getReporteMesasUbigeoPdf(filtroMesaPorUbigeoBean: FiltroMesaPorUbigeoBean):Observable<GenericResponseBean<string>>{
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor + Constantes.CB_REPORTE_MESAS_UBIGEO_POST_BASE64, filtroMesaPorUbigeoBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }
}
