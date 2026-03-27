import { Injectable } from '@angular/core';
import {PrecisionAsistAutomaControlDigitalizacionApiService} from '../../service-api/reporte/precision-asist-automa-control-digitalizacion-api.service';
import {
  FiltroPrecisionAsistAutomaControlDigitalizacion
} from '../../model/reportes/filtro-precision-asist-automa-control-digitalizacion';
import {Observable} from 'rxjs';
import {GenericResponseBean} from '../../model/genericResponseBean';

@Injectable({
  providedIn: 'root'
})
export class PrecisionAsistAutomaControlDigitalizacionService {

  constructor(private readonly precisionAsistAutomaControlDigitalizacionApiService: PrecisionAsistAutomaControlDigitalizacionApiService) { }

  getPrecisionAsistAutomaControlDigitalizacionPDF(filtros: FiltroPrecisionAsistAutomaControlDigitalizacion, acronimo: string):Observable<GenericResponseBean<string>>{
    return this.precisionAsistAutomaControlDigitalizacionApiService.getPrecisionAsistAutomaControlDigitalizacionPDF(filtros, acronimo);
  }
}
