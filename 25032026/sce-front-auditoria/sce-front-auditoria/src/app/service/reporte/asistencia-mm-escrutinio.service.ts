import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroAsistenciaMiembroMesa } from 'src/app/model/reportes/filtro-asistencia-mm';
import { AsistenciaMmEscrutinioApiService } from 'src/app/service-api/reporte/asistencia-mm-escrutinio-api.service';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaMmEscrutinioService {

  constructor( private readonly asistenciaMmEscrutinioApiService: AsistenciaMmEscrutinioApiService) { }

  getReporteAsistenciaMMEscrutinio(filtros: FiltroAsistenciaMiembroMesa):Observable<GenericResponseBean<string>>{
    return this.asistenciaMmEscrutinioApiService.getReporteAsistenciaMMEscrutinio(filtros);
  }
}
