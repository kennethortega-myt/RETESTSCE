import { Injectable } from '@angular/core';
import { ReporteMesasUbigeoApiService } from '../service-api/reporte-mesas-ubigeo-api.service';
import { FiltroMesaPorUbigeoBean } from '../model/reportes/filtroMesaPorUbigeo';
import { Observable } from 'rxjs';
import { GenericResponseBean } from '../model/genericResponseBean';

@Injectable({
  providedIn: 'root'
})
export class ReporteMesasUbigeoService {

  constructor(private readonly reporteMesasUbigeoApiService: ReporteMesasUbigeoApiService) {
  }

  getReporteMesasUbigeoPdf(filtroMesaPorUbigeoBean: FiltroMesaPorUbigeoBean):Observable<GenericResponseBean<string>>{
    return this.reporteMesasUbigeoApiService.getReporteMesasUbigeoPdf(filtroMesaPorUbigeoBean);
  }
}
