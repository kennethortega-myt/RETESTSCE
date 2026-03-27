import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroReporteAvanceMesaPorMesa } from 'src/app/model/reportes/filtroReporteAvanceMesaPorMesa';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReporteAvanceMesaPorMesaApiService {
 private readonly urlServidorNacion: string;

    constructor(private readonly httpClient: HttpClient) {
        this.urlServidorNacion = environment.apiUrl;
    }
    obtenerReporte(filtros: FiltroReporteAvanceMesaPorMesa): Observable<GenericResponseBean<string>> {
          return this.httpClient.post<GenericResponseBean<string>>(
              `${this.urlServidorNacion}/${Constantes.CB_REPORTE_AVANCE_MESA_POR_MESA_POST_BASE64}`, filtros);
      }
}
