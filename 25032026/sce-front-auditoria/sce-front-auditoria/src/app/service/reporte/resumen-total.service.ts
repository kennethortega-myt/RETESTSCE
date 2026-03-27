import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { DetalleResumenTotal, FiltroResumenTotal } from 'src/app/model/reportes/resumen-total';
import { ResumenTotalApiService } from 'src/app/service-api/reporte/resumen-total-api.service';

@Injectable({
  providedIn: 'root'
})
export class ResumenTotalService {

  constructor(private readonly resumenTotalApiService: ResumenTotalApiService) { }

  getResumentTotalCentroComputoNacion(filtros: FiltroResumenTotal, acronimo: string):
    Observable<GenericResponseBean<DetalleResumenTotal[]>>{
    return this.resumenTotalApiService.getResumentTotalCentroComputoNacion(filtros, acronimo);
  }

  getResumentTotalCentroComputoNacionPDF(filtros: FiltroResumenTotal, acronimo: string):
    Observable<GenericResponseBean<string>>{
    return this.resumenTotalApiService.getResumentTotalCentroComputoNacionPDF(filtros, acronimo);
  }
}
