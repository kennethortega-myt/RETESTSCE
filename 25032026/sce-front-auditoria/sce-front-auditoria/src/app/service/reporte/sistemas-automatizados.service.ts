import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroSistemasAutomatizados } from 'src/app/model/reportes/sistemas-automatizados';
import { SistemasAutomatizadosApiService } from 'src/app/service-api/reporte/sistemas-automatizados-api.service';

@Injectable({
  providedIn: 'root'
})
export class SistemasAutomatizadosService {

  constructor(private readonly sistemasAutomatizadosApiService: SistemasAutomatizadosApiService) { }

  getReporteSistemasAutomatizados(filtros: FiltroSistemasAutomatizados):Observable<GenericResponseBean<string>>{
    return this.sistemasAutomatizadosApiService.getReporteSistemasAutomatizados(filtros);
  }
}
