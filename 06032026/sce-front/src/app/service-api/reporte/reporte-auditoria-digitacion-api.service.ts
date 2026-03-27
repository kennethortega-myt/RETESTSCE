import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Constantes } from "src/app/helper/constantes";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import { FiltroReporteAuditoriaDigitacion } from "src/app/model/reportes/filtroReporteAuditoriaDigitacion";
import { environment } from "src/environments/environment";
import {GlobalService} from '../../service/global.service';

@Injectable({
    providedIn: 'root'
})
export class ReporteAuditoriaDigitacionApiService {
    private urlServidor: string;

    constructor(
      private readonly httpClient: HttpClient,
      private readonly globalService: GlobalService) {
        this.urlServidor = environment.apiUrl;
    }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl : environment.apiUrlORC);
  }

    obtenerReporteAuditoriaDigitacionNacion(filtros: FiltroReporteAuditoriaDigitacion): Observable<GenericResponseBean<string>> {
      this.asignarUrlBackend();
      const headers = new HttpHeaders({
        'X-Tenant-Id': filtros.acronimo
      });
      const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_REPORTE_AUDITORIA_DIGITACION_POST_BASE64}`);
      const opciones = { headers: headers };
      return this.httpClient.post<GenericResponseBean<string>>(url, filtros, opciones);
    }

}
