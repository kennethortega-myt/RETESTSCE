import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {AvanceEstadoActaReporteBean} from "../model/avanceEstadoActaReporteBean";
import {ReporteTotalCentroComputoApiService} from "../service-api/reporte-total-centro-computo-api.service";
import {FiltroTotalCentroComputoBean} from "../model/FiltroTotalCentroComputoBean";

@Injectable({
  providedIn: 'root'
})
export class ReporteTotalCentroComputoService {

  constructor(private readonly reporteTotalCentroComputoApiService: ReporteTotalCentroComputoApiService) {
  }

  getReporteTotalCentroComputoPdf(totalCentroComputoBean: FiltroTotalCentroComputoBean, acronimo:string):Observable<GenericResponseBean<string>>{
    return this.reporteTotalCentroComputoApiService.getReporteTotalCentroComputoPdf(totalCentroComputoBean,acronimo);
  }

  getReporteTotalCentroComputo(totalCentroComputoBean: FiltroTotalCentroComputoBean, acronimo:string):
    Observable<GenericResponseBean<AvanceEstadoActaReporteBean>>{
    return this.reporteTotalCentroComputoApiService.getReporteTotalCentroComputo(totalCentroComputoBean,acronimo);
  }

  getReporteTotalCentroComputoBase64(totalCentroComputoBean: FiltroTotalCentroComputoBean, acronimo:string):
    Observable<GenericResponseBean<string>>{
    return this.reporteTotalCentroComputoApiService.getReporteTotalCentroComputoBase64(totalCentroComputoBean,acronimo);
  }
}
