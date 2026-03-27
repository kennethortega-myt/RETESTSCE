import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroAvanceDigitalizacion } from 'src/app/model/reportes/filtroAvanceDigitalizacion';
import { AvanceDigitalizacionApiService } from 'src/app/service-api/reporte/avance-digitalizacion-api.service';

@Injectable({
  providedIn: 'root'
})
export class AvanceDigitalizacionService {

  constructor(private readonly avanceDigitalizacionApiService: AvanceDigitalizacionApiService) { }

  getReporteAvanceDigitalizacionNacion(filtros: FiltroAvanceDigitalizacion, acronimo: string):Observable<GenericResponseBean<string>>{
    return this.avanceDigitalizacionApiService.getReporteAvanceDigitalizacionNacion(filtros, acronimo);
  }

}
