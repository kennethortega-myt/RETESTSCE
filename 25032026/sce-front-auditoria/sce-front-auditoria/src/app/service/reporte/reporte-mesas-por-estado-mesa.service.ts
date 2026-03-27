import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import { FiltroReporteMesasPorEstado } from "src/app/model/reportes/filtroReporteMesasPorEstadoMesa";
import { ReporteMesasPorEstadoMesaApiService } from "src/app/service-api/reporte/reporte-mesas-por-estado-mesa-api.service";

@Injectable({
    providedIn: 'root'
  })
  export class ReporteMesasPorEstadoMesaService {

    constructor(private readonly reporteMesasPorEstadoMesaApiService: ReporteMesasPorEstadoMesaApiService) {}

    obtenerReporteOrganizacionesPoliticasNacion(filtros: FiltroReporteMesasPorEstado, acronimo: string):
      Observable<GenericResponseBean<string>>{
      return this.reporteMesasPorEstadoMesaApiService.obtenerReporteMesasPorEstadoMesaNacion(filtros, acronimo);
    }
  }
