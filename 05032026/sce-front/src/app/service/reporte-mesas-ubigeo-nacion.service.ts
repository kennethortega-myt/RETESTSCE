import { Injectable } from '@angular/core';
import { ReporteMesasUbigeoNacionApiService } from '../service-api/reporte-mesas-ubigeo-nacion-api.service';
import { FiltroMesaPorUbigeoNacion } from '../model/reportes/filtroMesaPorUbigeoNacion';
import { Observable } from 'rxjs';
import { GenericResponseBean } from '../model/genericResponseBean';
@Injectable({
  providedIn: 'root'
})

export class ReporteMesasUbigeoNacionService {

    constructor(private readonly reporteMesasUbigeoNacionApiService: ReporteMesasUbigeoNacionApiService) { }

    getReporteMesasUbigeoNacionPdf(filtroMesaPorUbigeoNacion: FiltroMesaPorUbigeoNacion, acronimo: string):Observable<GenericResponseBean<string>>{
        return this.reporteMesasUbigeoNacionApiService.getReporteMesasUbigeoNacionPdf(filtroMesaPorUbigeoNacion, acronimo);
      }

  }
