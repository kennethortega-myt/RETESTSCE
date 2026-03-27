import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Constantes } from "src/app/helper/constantes";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import { FiltroReporteRelacionPuestaCero } from "src/app/model/reportes/filtroReporteRelacionPuestaCero";
import { ReporteRelacionPuestaCeroBean } from "src/app/model/reportes/reporteRelacionPuestaCeroBean";
import { GlobalService } from "src/app/service/global.service";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ReporteRelacionPuestaCeroApiService {
private urlServidor: string;

    constructor(private readonly httpClient: HttpClient,
        private readonly globalService: GlobalService
    ) {
        this.urlServidor = environment.apiUrl;
    }

    private asignarUrlBackend() {
        this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl : environment.apiUrlORC);
    }

    obtenerReporteRelacionPuestaCero(filtros: FiltroReporteRelacionPuestaCero): Observable<GenericResponseBean<string>> {
        this.asignarUrlBackend();
        const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_REPORTE_RELACION_PUESTA_CERO_POST_BASE64}`);
        return this.httpClient.post<GenericResponseBean<string>>(url, filtros);
    }

    consultaReporteRelacionPuestaCero(filtros: FiltroReporteRelacionPuestaCero, acronimo: string): 
        Observable<GenericResponseBean<Array<ReporteRelacionPuestaCeroBean>>> {
        this.asignarUrlBackend();
        const headers = new HttpHeaders({
        [Constantes.HEADER_TENANT_ID]: acronimo
      });
        const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_REPORTE_RELACION_PUESTA_CERO_POST}`);
        return this.httpClient.post<GenericResponseBean<Array<ReporteRelacionPuestaCeroBean>>>(url, filtros, {headers});
    }
}
