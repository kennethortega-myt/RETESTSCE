import { Injectable } from '@angular/core';
import {FiltroReporteMesasObservaciones} from '../../model/reportes/filtroReporteMesasObservaciones';
import {Observable} from 'rxjs';
import {GenericResponseBean} from '../../model/genericResponseBean';
import {
  AvanceDigitalizacionHojaAsistenciaApiService
} from '../../service-api/reporte/avance-digitalizacion-hoja-asistencia-api.service';

@Injectable({
  providedIn: 'root'
})
export class AvanceDigitalizacionHojaAsistenciaService {

  constructor(private readonly avanceDigitalizacionHojaAsistenciaApiService: AvanceDigitalizacionHojaAsistenciaApiService) { }

  getReporteAvanceDigitalizacionHojaAsistenciaNacion(filtro: FiltroReporteMesasObservaciones, acronimo: string):Observable<GenericResponseBean<string>>{
    return this.avanceDigitalizacionHojaAsistenciaApiService.getReporteAvanceDigitalizacionHojaAsistenciaNacion(filtro, acronimo);
  }

}
