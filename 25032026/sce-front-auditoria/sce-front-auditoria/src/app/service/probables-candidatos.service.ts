import { Injectable } from '@angular/core';
import { ProbablesCandidatosApiService } from '../service-api/probables-candidatos-api.service';
import { Observable } from 'rxjs';
import { GenericResponseBean } from '../model/genericResponseBean';
import { AgrupacionPolitica } from '../model/reportes/agrupacion-politica';
import { FiltroProbablesCandidatos } from '../model/reportes/filtro-probables-candidatos';
import { ProbableCandidatoElecto } from '../model/reportes/probables-candidatos-electos';

@Injectable({
  providedIn: 'root'
})
export class ProbablesCandidatosService {

  constructor(private readonly probablesCandidatosApiService: ProbablesCandidatosApiService,) { }

  public obtenerAgrupolPorDE(acronimo: string, idEleccion: number, distritoElectoral: string): Observable<GenericResponseBean<Array<AgrupacionPolitica>>> {
    return this.probablesCandidatosApiService.obtenerAgrupolPorDE(acronimo, idEleccion, distritoElectoral);
  }

  public obtenerProbablesCandidatosElectos(acronimo: string, filtros: FiltroProbablesCandidatos): Observable<GenericResponseBean<ProbableCandidatoElecto[]>> {
    return this.probablesCandidatosApiService.obtenerProbablesCandidatosElectos(acronimo, filtros);
  }

  obtenerProbablesCandidatosElectosPDF(acronimo: string, filtros: FiltroProbablesCandidatos): Observable<GenericResponseBean<string>> {
    return this.probablesCandidatosApiService.obtenerProbablesCandidatosElectosPDF(acronimo, filtros);
  }
}
