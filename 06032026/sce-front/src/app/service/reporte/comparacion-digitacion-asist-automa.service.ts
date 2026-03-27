import { Injectable } from '@angular/core';
import { ComparacionDigitacionAsistAutomaApiService } from 'src/app/service-api/reporte/comparacion-digitacion-asist-automa-api.service';
import { FiltroComparacionDigitacionAsistAutoma } from '../../model/reportes/filtro-comparacion-digitacion-asist-automa-';
import { Observable } from 'rxjs';
import { GenericResponseBean } from '../../model/genericResponseBean';
import { FiltroAsistenciaMiembroMesa } from '../../model/reportes/filtro-asistencia-mm';

@Injectable({
  providedIn: 'root'
})
export class ComparacionDigitacionAsistAutomaService {

  constructor(private readonly comparacionDigitacionAsistAutomaApiService: ComparacionDigitacionAsistAutomaApiService) { }

  getComparacionDigitacionAsistAutomaPDF(filtros: FiltroComparacionDigitacionAsistAutoma, acronimo: string):Observable<GenericResponseBean<string>> {
    return this.comparacionDigitacionAsistAutomaApiService.getComparacionDigitacionAsistAutomaPDF(filtros, acronimo);
  }
}
