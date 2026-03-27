import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroResumenEstadoActas, ResumenEstadoActas } from 'src/app/model/reportes/resumen-estado-actas';
import { GlobalService } from 'src/app/service/global.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResumenEstadoActasApiService {

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

  getReporteResumenEstadoActas(filtro: FiltroResumenEstadoActas, acronimo:string):
      Observable<GenericResponseBean<ResumenEstadoActas>>{
      this.asignarUrlBackend();
      const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_RESUMEN_ESTADO_ACTAS_POST}`);
      const headers = new HttpHeaders({
        'X-Tenant-Id': acronimo
      });

      const opciones = { headers: headers };
      return this.httpClient.post<GenericResponseBean<ResumenEstadoActas>>(url, filtro, opciones);
    }

  getReporteResumenEstadoActasBase64(filtro: FiltroResumenEstadoActas, acronimo:string):
    Observable<GenericResponseBean<string>>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(this.urlServidor +"/"+ Constantes.CB_REPORTE_RESUMEN_ESTADO_ACTAS_POST_BASE64);        
    const opciones = { headers: headers };
    return this.httpClient.post<GenericResponseBean<string>>(url, filtro, opciones);
  }
}
