import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroReporteDetalleAvanceRegistroUbigeo } from 'src/app/model/reportes/filtroReporteDetalleAvanceRegistroUbigeo';
import { ReporteDetalleAvanceRegistrosUbigeoMiembroDeMesaApiService } from 'src/app/service-api/reporte/reporte-detalle-avance-registros-ubigeo-nacion-api-mm.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteDetalleAvanceRegistrosUbigeoMiembroDeMesaService {

  constructor(
    private readonly reporteDetalleAvanceRegistrosUbigeoMiembroDeMesaApiService:ReporteDetalleAvanceRegistrosUbigeoMiembroDeMesaApiService
  ) { }

  obtenerReporte(filtros: FiltroReporteDetalleAvanceRegistroUbigeo): Observable<GenericResponseBean<string>> {
    return this.reporteDetalleAvanceRegistrosUbigeoMiembroDeMesaApiService.obtenerReporte(filtros);
  }
}
