import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Constantes } from "src/app/helper/constantes";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import { environment } from "src/environments/environment";
import {GlobalService} from '../../service/global.service';
import {FiltroProcedePagoBean} from '../../model/filtroProcedePagoBean';

@Injectable({
    providedIn: 'root'
})
export class ReporteProcedePagoApiService {
    private urlServidor: string;

    constructor(
      private readonly httpClient: HttpClient,
      private readonly globalService: GlobalService) {
        this.urlServidor = environment.apiUrl;
    }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl : environment.apiUrlORC);
  }

    obtenerReporteProcedePago(filtros: FiltroProcedePagoBean): Observable<GenericResponseBean<string>> {
      this.asignarUrlBackend();
      const headers = new HttpHeaders({
        [Constantes.HEADER_TENANT_ID]: filtros.acronimo
      });

      const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_REPORTE_PROCEDE_PAGO_POST_BASE64}`);
      return this.httpClient.post<GenericResponseBean<string>>(url, filtros,{headers});
    }

}
