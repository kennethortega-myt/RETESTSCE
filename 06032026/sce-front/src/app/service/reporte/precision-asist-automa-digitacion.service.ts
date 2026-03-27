import { Injectable } from '@angular/core';
import {
  PrecisionAsistAutomaDigitacionApiService
} from '../../service-api/reporte/precision-asist-automa-digitacion-api.service';
import {FiltroPrecisionAsistAutomaDigitacion} from '../../model/reportes/filtro-precision-asist-automa-digitacion';
import {Observable} from 'rxjs';
import {GenericResponseBean} from '../../model/genericResponseBean';

@Injectable({
  providedIn: 'root'
})
export class PrecisionAsistAutomaDigitacionService {

  constructor(private readonly precisionAsistAutomaDigitacionApiService: PrecisionAsistAutomaDigitacionApiService) { }

  getPrecisionAsistAutomaDigitacionResumenPDF(filtros: FiltroPrecisionAsistAutomaDigitacion, acronimo: string):Observable<GenericResponseBean<string>> {
    return this.precisionAsistAutomaDigitacionApiService.getPrecisionAsistAutomaDigitacionResumenPDF(filtros, acronimo);
  }

  getPrecisionAsistAutomaDigitacionDetallePDF(filtros: FiltroPrecisionAsistAutomaDigitacion, acronimo: string):Observable<GenericResponseBean<string>> {
    return this.precisionAsistAutomaDigitacionApiService.getPrecisionAsistAutomaDigitacionDetallePDF(filtros, acronimo);
  }
}
