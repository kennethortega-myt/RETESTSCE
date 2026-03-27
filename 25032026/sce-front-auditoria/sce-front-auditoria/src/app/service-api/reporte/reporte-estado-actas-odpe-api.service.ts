import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { EstadoActasOdpe, FiltroEstadoActasOdpe } from 'src/app/model/reportes/estado-actas-odpe';
import { environment } from 'src/environments/environment';
import {GlobalService} from "../../service/global.service";

@Injectable({
  providedIn: 'root'
})
export class ReporteEstadoActasOdpeApiService {

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

  getReporteEstadoActasOdpe(filtroEstadoActasOdpe: FiltroEstadoActasOdpe, acronimo:string):
      Observable<GenericResponseBean<EstadoActasOdpe>>{
      this.asignarUrlBackend();
      const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_ESTADO_ACTAS_ODPE_POST}`);
      const headers = new HttpHeaders({
        'X-Tenant-Id': acronimo
      });

      const opciones = { headers: headers };
      return this.httpClient.post<GenericResponseBean<EstadoActasOdpe>>(url, filtroEstadoActasOdpe, opciones);
    }

    getReporteEstadoActasOdpeBase64(filtroEstadoActasOdpe: FiltroEstadoActasOdpe, acronimo:string):
      Observable<GenericResponseBean<string>>{
      const headers = new HttpHeaders({
        'X-Tenant-Id': acronimo
      });

      this.asignarUrlBackend();
      const url = this.globalService.reemplazarDobleSlash(this.urlServidor +"/"+ Constantes.CB_REPORTE_ESTADO_ACTAS_ODPE_POST_BASE64);
      // Agrega los encabezados a las opciones de la solicitud
      const opciones = { headers: headers };
      return this.httpClient.post<GenericResponseBean<string>>(url, filtroEstadoActasOdpe, opciones);
    }

}
