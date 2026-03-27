import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { environment } from "src/environments/environment";
import { Observable } from 'rxjs';
import { GenericResponseBean } from '../model/genericResponseBean';
import { Constantes } from "src/app/helper/constantes";
import {AuthService} from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteCierreActividadesApiService {
private urlServidor: string;
   constructor(private readonly httpClient: HttpClient,
          private readonly globalService: GlobalService,
          private readonly auth: AuthService

   ) {
        this.urlServidor = environment.apiUrl;
   }

  private asignarUrlBackend() {
          this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl : environment.apiUrlORC);
  }

  obtenerReporteHistoricoCierre(): Observable<GenericResponseBean<string>> {
          this.asignarUrlBackend();
          const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_HISTORICO_CIERRE_REAPERTURA_POST_BASE64}`);
          return this.httpClient.post<GenericResponseBean<string>>(url,{});
      }
  obtenerReporteCierreActividades(correlativo: string): Observable<GenericResponseBean<string>> {
          this.asignarUrlBackend();
          const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_CIERRE_ACTIVIDAD_POST_BASE64}`);
          return this.httpClient.post<GenericResponseBean<string>>(url,{correlativo});
      }

  obtenerReporteReaperturaCentroComputo(): Observable<GenericResponseBean<any>> {
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_REAPERTURA_CENTRO_COMPUTO_POST_BASE64}`);
    return this.httpClient.post<GenericResponseBean<any>>(
      url,{} );
  }
}
