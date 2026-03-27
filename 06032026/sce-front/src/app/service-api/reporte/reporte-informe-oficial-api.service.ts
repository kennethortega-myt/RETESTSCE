import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Constantes } from "src/app/helper/constantes";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import { FiltroReporteInformacionOficial } from "src/app/model/reportes/filtroReporteInformacionOficial";
import { ReporteInformacionOficialBean } from "src/app/model/reportes/reporteInformacionOficialBean";
import { environment } from "src/environments/environment";
import {GlobalService} from '../../service/global.service';

@Injectable({
    providedIn: 'root'
})
export class ReporteInformacionOficialApiService {
  private urlServidor: string;

    constructor(private readonly httpClient: HttpClient,
                private readonly globalService: GlobalService) {
      this.urlServidor = environment.apiUrl;
    }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl : environment.apiUrlORC);
  }

    obtenerReporteInformacionOficialNacion(filtros: FiltroReporteInformacionOficial): Observable<GenericResponseBean<string>> {
      this.asignarUrlBackend();
      const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_REPORTE_INFORMACION_OFICIAL_POST_BASE64}`);
      return this.httpClient.post<GenericResponseBean<string>>(url, filtros);
    }
    consultaInformacionOficialNacion(filtros: FiltroReporteInformacionOficial): Observable<GenericResponseBean<Array<ReporteInformacionOficialBean>>> {
      this.asignarUrlBackend();
      const headers = new HttpHeaders({
        'X-Tenant-Id': filtros.acronimo
      });
      const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_REPORTE_INFORMACION_OFICIAL_POST}`);
      const opciones = { headers: headers };
      return this.httpClient.post<GenericResponseBean<Array<ReporteInformacionOficialBean>>>(url, filtros, opciones);
    }
}
