import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroReporteActasEnviadasJEENacion } from 'src/app/model/reportes/filtroReporteActasEnviadasJEENacion';
import { ReporteActasEnviadasJeeNacionApiService } from 'src/app/service-api/reporte/reporte-actas-enviadas-jee-nacion-api.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteActasEnviadasJeeNacionService {

  constructor(private readonly reporteActasEnviadasJEENacionApi: ReporteActasEnviadasJeeNacionApiService) { }
  obtenerReporte(filtros: FiltroReporteActasEnviadasJEENacion): Observable<GenericResponseBean<string>> {
    return this.reporteActasEnviadasJEENacionApi.obtenerReporte(filtros);
  }
}
