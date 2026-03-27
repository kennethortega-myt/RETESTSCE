import { Injectable } from '@angular/core';
import { ReporteAutoridadesConsultaApiService } from '../service-api/reporte-autoridades-consulta-api.service';
import { FiltroOrganizacionesPoliticas } from '../model/reportes/filtroOrganizacionesPoliticas';
import { Observable } from 'rxjs';
import { GenericResponseBean } from '../model/genericResponseBean';

@Injectable({
  providedIn: 'root'
})
export class ReporteAutoridadesConsultaService {

  constructor(private readonly reporteAutoridadesConsultaApiService: ReporteAutoridadesConsultaApiService) { }

  getReporteAutoridadesEnConsultaPdfCc(filtros: FiltroOrganizacionesPoliticas):Observable<GenericResponseBean<string>>{
    return this.reporteAutoridadesConsultaApiService.getReporteAutoridadesEnConsultaCc(filtros);
  }

  getReporteAutoridadesEnConsultaPdfNacion(filtros: FiltroOrganizacionesPoliticas):Observable<GenericResponseBean<string>>{
    return this.reporteAutoridadesConsultaApiService.getReporteAutoridadesEnConsultaNacion(filtros);
  }

}
