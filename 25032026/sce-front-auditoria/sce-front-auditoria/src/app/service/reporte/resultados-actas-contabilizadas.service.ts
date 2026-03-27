import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroResultados, ResultadosActasContabilizadas, ResultadosActasContabilizadasCPR } from 'src/app/model/reportes/resultados-actas-contabilizadas';
import { ResultadosActasContabilizadasApiService } from 'src/app/service-api/reporte/resultados-actas-contabilizadas-api.service';

@Injectable({
  providedIn: 'root'
})
export class ResultadosActasContabilizadasService {

  constructor(private readonly resultadosActasContabilizadasApiService: ResultadosActasContabilizadasApiService) { }

  getResultadosActasContabilizadasNacion(filtros: FiltroResultados):
    Observable<GenericResponseBean<ResultadosActasContabilizadas>>{
    return this.resultadosActasContabilizadasApiService.getResultadosActasContabilizadasNacion(filtros);
  }

  getResultadosActasContabilizadasNacionPDF(filtros: FiltroResultados):Observable<GenericResponseBean<string>>{
    return this.resultadosActasContabilizadasApiService.getResultadosActasContabilizadasNacionPDF(filtros);
  }

  getResultadosActasContabilizadasCPRNacion(filtros: FiltroResultados):
    Observable<GenericResponseBean<ResultadosActasContabilizadasCPR>>{
    return this.resultadosActasContabilizadasApiService.getResultadosActasContabilizadasCPRNacion(filtros);
  }
}
