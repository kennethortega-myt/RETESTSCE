import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroActasDigitalizadas } from 'src/app/model/reportes/actas-digitalizadas';
import { ActasDigitalizadasApiService } from 'src/app/service-api/reporte/actas-digitalizadas-api.service';

@Injectable({
  providedIn: 'root'
})
export class ActasDigitalizadasService {

  constructor(private readonly actasDigitalizadasApiService: ActasDigitalizadasApiService) { }

  getReporteActasDigitalizadasPdfNacion(filtros: FiltroActasDigitalizadas, acronimo: string):Observable<GenericResponseBean<string>>{
    return this.actasDigitalizadasApiService.getReporteActasDigitalizadasPdfNacion(filtros, acronimo);
  }

  getReporteActasDigitalizadasExcelNacion(filtros: FiltroActasDigitalizadas, acronimo: string):Observable<GenericResponseBean<string>>{
    return this.actasDigitalizadasApiService.getReporteActasDigitalizadasExcelNacion(filtros, acronimo);
  }
}
