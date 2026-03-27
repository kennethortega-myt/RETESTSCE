import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import {ReporteMesasObservacionesApiService} from '../../service-api/reporte/reporte-mesas-observaciones-api.service';
import {FiltroReporteMesasObservaciones} from '../../model/reportes/filtroReporteMesasObservaciones';

@Injectable({
  providedIn: 'root'
})
export class ReporteMesasObservacionesService {

  constructor(private readonly reporteMesasObservacionesApiService: ReporteMesasObservacionesApiService) { }

  getReporteMesasObservacionesNacion(filtro: FiltroReporteMesasObservaciones, acronimo: string):Observable<GenericResponseBean<string>>{
    return this.reporteMesasObservacionesApiService.getReporteMesasObservacionesNacion(filtro, acronimo);
  }

}
