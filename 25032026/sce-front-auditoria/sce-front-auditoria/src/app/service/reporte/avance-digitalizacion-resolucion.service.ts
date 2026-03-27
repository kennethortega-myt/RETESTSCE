import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroDigitalizacionResol } from 'src/app/model/reportes/avance-digitalizacion-resolucion';
import { AvanceDigitalizacionResolucionApiService } from 'src/app/service-api/reporte/avance-digitalizacion-resolucion-api.service';

@Injectable({
  providedIn: 'root'
})
export class AvanceDigitalizacionResolucionService {

  constructor(private readonly avanceDigitalizacionResolucionApiService: AvanceDigitalizacionResolucionApiService) {}

  getReporteAvanceDigitalizacionResolucion(filtros: FiltroDigitalizacionResol):Observable<GenericResponseBean<string>>{
    return this.avanceDigitalizacionResolucionApiService.getReporteAvanceDigitalizacionResolucion(filtros);
  }
}
