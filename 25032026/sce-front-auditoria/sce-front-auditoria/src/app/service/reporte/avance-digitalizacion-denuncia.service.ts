import { Injectable } from '@angular/core';
import {FiltroReporteMesasObservaciones} from '../../model/reportes/filtroReporteMesasObservaciones';
import {Observable} from 'rxjs';
import {GenericResponseBean} from '../../model/genericResponseBean';
import {
  AvanceDigitalizacionDenunciaApiService
} from '../../service-api/reporte/avance-digitalizacion-denuncia-api.service';

@Injectable({
  providedIn: 'root'
})
export class AvanceDigitalizacionDenunciaService {

  constructor(private readonly avanceDigitalizacionDenunciaApiService: AvanceDigitalizacionDenunciaApiService) { }

  getReporteAvanceDigitalizacionDenunciaNacion(filtro: FiltroReporteMesasObservaciones, acronimo: string):Observable<GenericResponseBean<string>>{
    return this.avanceDigitalizacionDenunciaApiService.getReporteAvanceDigitalizacionDenunciaNacion(filtro, acronimo);
  }

}
