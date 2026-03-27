import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroTransmision } from 'src/app/model/reportes/tranmision';
import { TransmisionApiService } from 'src/app/service-api/reporte/transmision-api.service';

@Injectable({
  providedIn: 'root'
})
export class TransmisionService {

  constructor(private readonly transmisionApiService: TransmisionApiService) { }

  getReporteTransmisionPdf(filtros: FiltroTransmision):Observable<GenericResponseBean<string>>{
      return this.transmisionApiService.getReporteTransmisionPdf(filtros);
    }
}
