import { Injectable } from '@angular/core';
import {FiltroReporteMesasObservaciones} from '../../model/reportes/filtroReporteMesasObservaciones';
import {Observable} from 'rxjs';
import {GenericResponseBean} from '../../model/genericResponseBean';
import {
  AvanceDigitalizacionListaElectoresApiService
} from '../../service-api/reporte/avance-digitalizacion-lista-electores-api.service';

@Injectable({
  providedIn: 'root'
})
export class AvanceDigitalizacionListaElectoresService {

  constructor(private readonly avanceDigitalizacionListaElectoresApiService: AvanceDigitalizacionListaElectoresApiService) { }

  getReporteAvanceDigitalizacionLENacion(filtro: FiltroReporteMesasObservaciones, acronimo: string):Observable<GenericResponseBean<string>>{
    return this.avanceDigitalizacionListaElectoresApiService.getReporteAvanceDigitalizacionLENacion(filtro, acronimo);
  }

}
