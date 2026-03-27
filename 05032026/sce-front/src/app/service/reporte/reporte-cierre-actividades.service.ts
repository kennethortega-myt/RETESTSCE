import { Injectable } from '@angular/core';
import { ReporteCierreActividadesApiService } from '../reporte-cierre-actividades-api.service';
import {Observable} from 'rxjs';
import {GenericResponseBean} from '../../model/genericResponseBean';


@Injectable({
  providedIn: 'root'
})
export class ReporteCierreActividadesService {

  constructor(private readonly reporteCierraActividadesApiService: ReporteCierreActividadesApiService) { }

   obtenerReporteHistoricoCierre(): Observable<GenericResponseBean<any>> {
          return this.reporteCierraActividadesApiService.obtenerReporteHistoricoCierre();
      }

   obtenerReporteCierreActividades(correlativo: string): Observable<GenericResponseBean<any>> {
          return this.reporteCierraActividadesApiService.obtenerReporteCierreActividades(correlativo);
      }

  obtenerReporteReaperturaCentroComputo(): Observable<GenericResponseBean<any>> {
    return this.reporteCierraActividadesApiService.obtenerReporteReaperturaCentroComputo()
  }
}
