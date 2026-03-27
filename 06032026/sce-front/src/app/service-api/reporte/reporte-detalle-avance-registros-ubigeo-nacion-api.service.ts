import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroReporteDetalleAvanceRegistroUbigeo } from 'src/app/model/reportes/filtroReporteDetalleAvanceRegistroUbigeo';
import { GlobalService } from 'src/app/service/global.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReporteDetalleAvanceRegistrosUbigeoNacionApiService {
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

  obtenerReporte(filtros: FiltroReporteDetalleAvanceRegistroUbigeo): Observable<GenericResponseBean<string>> {
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_DETALLE_AVANCE_REGISTROS_UBIGEO_POST_BASE64}`);
    return this.httpClient.post<GenericResponseBean<string>>(url, filtros);
  }
}
