import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroResumenEstadoActas, ResumenEstadoActas } from 'src/app/model/reportes/resumen-estado-actas';
import { ResumenEstadoActasApiService } from 'src/app/service-api/reporte/resumen-estado-actas-api.service';

@Injectable({
  providedIn: 'root'
})
export class ResumenEstadoActasService {

  constructor(private readonly resumenEstadoActasApiService: ResumenEstadoActasApiService) { }
  
  getReporteResumenEstadoActas(filtro: FiltroResumenEstadoActas, acronimo:string):
    Observable<GenericResponseBean<ResumenEstadoActas>>{
    return this.resumenEstadoActasApiService.getReporteResumenEstadoActas(filtro, acronimo);
  }

  getReporteResumenEstadoActasBase64(filtro: FiltroResumenEstadoActas, acronimo:string):
    Observable<GenericResponseBean<string>>{
    return this.resumenEstadoActasApiService.getReporteResumenEstadoActasBase64(filtro, acronimo);
  }
}
