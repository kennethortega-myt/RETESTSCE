import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroRecepcion } from 'src/app/model/reportes/recepcion';
import { RecepcionApiService } from 'src/app/service-api/reporte/recepcion-api.service';

@Injectable({
  providedIn: 'root'
})
export class RecepcionService {

  constructor(private readonly recepcionApiService: RecepcionApiService) { }

  getReporteRecepcionPdf(filtros: FiltroRecepcion):Observable<GenericResponseBean<string>>{  
    return this.recepcionApiService.getReporteRecepcionPdf(filtros);
  }
}
