import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroAsistenciaMiembroMesa } from 'src/app/model/reportes/filtro-asistencia-mm';
import { AsistenciaPersonerosApiService } from 'src/app/service-api/reporte/asistencia-personeros-api.service';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaPersonerosService {

  constructor(private readonly asistenciaPersonerosApiService: AsistenciaPersonerosApiService) { }

  getReporteAsistenciaPersoneros(filtros: FiltroAsistenciaMiembroMesa):Observable<GenericResponseBean<string>>{
    return this.asistenciaPersonerosApiService.getReporteAsistenciaPersoneros(filtros);
  }
}
