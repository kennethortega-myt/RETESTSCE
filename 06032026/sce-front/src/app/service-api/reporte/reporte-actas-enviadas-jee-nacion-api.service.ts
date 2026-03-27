import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroReporteActasEnviadasJEENacion } from 'src/app/model/reportes/filtroReporteActasEnviadasJEENacion';
import { GlobalService } from 'src/app/service/global.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReporteActasEnviadasJeeNacionApiService {
  private urlServidor: string;
  constructor(
    private readonly httpClient: HttpClient,
    private readonly globalService: GlobalService
  ) {
    this.urlServidor = environment.apiUrl;
  }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl+"/" : environment.apiUrlORC);
  }

  obtenerReporte(filtros: FiltroReporteActasEnviadasJEENacion): Observable<GenericResponseBean<string>> {
    this.asignarUrlBackend();
    const headers = new HttpHeaders({
              'X-Tenant-Id': filtros.acronimo
          });
    return this.httpClient.post<GenericResponseBean<string>>(
      `${this.urlServidor}${Constantes.CB_REPORTE_ACTAS_ENVIADAS_JEE_POST_BASE64}`, filtros, { headers: headers });
  }
}
