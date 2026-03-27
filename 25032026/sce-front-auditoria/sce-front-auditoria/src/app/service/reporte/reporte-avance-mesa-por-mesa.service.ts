import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroReporteAvanceMesaPorMesa } from 'src/app/model/reportes/filtroReporteAvanceMesaPorMesa';
import { ReporteAvanceMesaPorMesaApiService } from 'src/app/service-api/reporte/reporte-avance-mesa-por-mesa-api.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteAvanceMesaPorMesaService {

  constructor(
    private readonly reporteAvanceMesaPorMesaApiService: ReporteAvanceMesaPorMesaApiService
  ) { }

  obtenerReporte(filtros: FiltroReporteAvanceMesaPorMesa): Observable<GenericResponseBean<string>> {
      return this.reporteAvanceMesaPorMesaApiService.obtenerReporte(filtros);
  }
}
