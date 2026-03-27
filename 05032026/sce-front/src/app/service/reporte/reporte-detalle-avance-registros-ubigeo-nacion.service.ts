import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroReporteDetalleAvanceRegistroUbigeo } from 'src/app/model/reportes/filtroReporteDetalleAvanceRegistroUbigeo';
import { ReporteDetalleAvanceRegistrosUbigeoNacionApiService } from 'src/app/service-api/reporte/reporte-detalle-avance-registros-ubigeo-nacion-api.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteDetalleAvanceRegistrosUbigeoNacionService {

  constructor(
    private readonly reporteDetalleAvanceRegistrosUbigeoNacionApiService:ReporteDetalleAvanceRegistrosUbigeoNacionApiService
  ) { }

  obtenerReporte(filtros: FiltroReporteDetalleAvanceRegistroUbigeo): Observable<GenericResponseBean<string>> {
    return this.reporteDetalleAvanceRegistrosUbigeoNacionApiService.obtenerReporte(filtros);
  }
}
