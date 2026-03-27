import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroAsistenciaMiembroMesa } from 'src/app/model/reportes/filtro-asistencia-mm';
import { AsistenciaMiembrosMesaApiService } from 'src/app/service-api/reporte/asistencia-miembros-mesa-api.service';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaMiembrosMesaService {

  constructor(private readonly asistenciaMiembrosMesaApiService: AsistenciaMiembrosMesaApiService) { }

  getReporteAsistenciaMiembrosMesa(filtros: FiltroAsistenciaMiembroMesa):Observable<GenericResponseBean<string>>{
    return this.asistenciaMiembrosMesaApiService.getReporteAsistenciaMiembrosMesa(filtros);
  }
}
