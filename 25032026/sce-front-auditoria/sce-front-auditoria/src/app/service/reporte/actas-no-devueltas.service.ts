import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroActasNoDevueltas } from 'src/app/model/reportes/actas-no-devueltas';
import { ActasNoDevueltasApiService } from 'src/app/service-api/reporte/actas-no-devueltas-api.service';

@Injectable({
  providedIn: 'root'
})
export class ActasNoDevueltasService {

  constructor( private readonly actasNoDevueltasApiService: ActasNoDevueltasApiService) { }

  getReporteActasNoDevueltasNacion(filtros: FiltroActasNoDevueltas, acronimo: string):Observable<GenericResponseBean<string>>{
    return this.actasNoDevueltasApiService.getReporteActasNoDevueltasNacion(filtros, acronimo);
  }
}
