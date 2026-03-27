import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Constantes } from "src/app/helper/constantes";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import { environment } from "src/environments/environment";
import {GlobalService} from '../../service/global.service';
import {FiltroOmisosAusentismoBean} from '../../model/filtroOmisosAusentismoBean';

@Injectable({
    providedIn: 'root'
})
export class ReporteOmisosAusentismoApiService {
    private urlServidor: string;

    constructor(
      private readonly httpClient: HttpClient,
      private readonly globalService: GlobalService) {
        this.urlServidor = environment.apiUrl;
    }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl : environment.apiUrlORC);
  }

    obtenerReporteOmisosAusentismo(filtros: FiltroOmisosAusentismoBean, acronimo: string): Observable<GenericResponseBean<string>> {
      const headers = new HttpHeaders({
        'X-Tenant-Id': acronimo
      });
      const opciones = { headers: headers };

      this.asignarUrlBackend();
      const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_REPORTE_OMISOS_AUSENTISMO_POST_BASE64}`);
      return this.httpClient.post<GenericResponseBean<string>>(url, filtros, opciones);
    }

}
