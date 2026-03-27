import { Injectable } from '@angular/core';
import { ReporteOrganizacionesPoliticasApiService } from '../service-api/reporte-organizaciones-politicas-api.service';
import { GenericResponseBean } from '../model/genericResponseBean';
import { Observable } from 'rxjs';
import { FiltroOrganizacionesPoliticas } from '../model/reportes/filtroOrganizacionesPoliticas';

@Injectable({
  providedIn: 'root'
})
export class ReporteOrganizacionesPoliticasService {

  constructor(private readonly reporteOrganizacionesPoliticasApiService: ReporteOrganizacionesPoliticasApiService) {
  }

  getReporteOrganizacionesPoliticasPdf(filtros: FiltroOrganizacionesPoliticas):Observable<GenericResponseBean<string>>{
    return this.reporteOrganizacionesPoliticasApiService.getReporteOrganizacionesPoliticasCc(filtros);
  }

  getReporteOrganizacionesPoliticasNacion(filtros: FiltroOrganizacionesPoliticas, acronimo: string):Observable<GenericResponseBean<string>>{
    return this.reporteOrganizacionesPoliticasApiService.getReporteOrganizacionesPoliticasNacion(filtros, acronimo);
  }

}
