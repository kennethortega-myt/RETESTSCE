import { Injectable } from '@angular/core';
import { ReporteCandidatosOrgPoliticasApiService } from '../service-api/reporte-candidatos-org-politicas-api.service';
import { Observable } from 'rxjs';
import { GenericResponseBean } from '../model/genericResponseBean';
import { FiltroOrganizacionesPoliticas } from '../model/reportes/filtroOrganizacionesPoliticas';

@Injectable({
  providedIn: 'root'
})
export class ReporteCandidatosOrgPoliticasService {

  constructor(private readonly reporteCandidatosOrgPoliticasApiService: ReporteCandidatosOrgPoliticasApiService) { }

  getReporteCandidatosOrgPoliticaPdfOrc(filtros: FiltroOrganizacionesPoliticas):Observable<GenericResponseBean<string>>{
    return this.reporteCandidatosOrgPoliticasApiService.getReporteCandidatosOrgPoliticaCc(filtros);
  }

  getReporteCandidatosOrgPoliticaPdfNacion(filtros: FiltroOrganizacionesPoliticas, acronimo: string):Observable<GenericResponseBean<string>>{
    return this.reporteCandidatosOrgPoliticasApiService.getReporteCandidatosOrgPoliticaNacion(filtros, acronimo);
  }
}
