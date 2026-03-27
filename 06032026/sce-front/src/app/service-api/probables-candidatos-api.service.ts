import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GlobalService } from '../service/global.service';
import { GenericResponseBean } from '../model/genericResponseBean';
import { AgrupacionPolitica } from '../model/reportes/agrupacion-politica';
import { Observable } from 'rxjs';
import { Constantes } from '../helper/constantes';
import { FiltroProbablesCandidatos } from '../model/reportes/filtro-probables-candidatos';
import { ProbableCandidatoElecto } from '../model/reportes/probables-candidatos-electos';

@Injectable({
  providedIn: 'root'
})
export class ProbablesCandidatosApiService {

  private urlServidor: string;
  
  constructor(
    private readonly httpClient: HttpClient,
    private readonly globalService: GlobalService,
  )
    {
      this.urlServidor = environment.apiUrl+'/';
    }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl+'/' : environment.apiUrlORC);
  }

  public obtenerAgrupolPorDE(acronimo: string, idEleccion: number, distritoElectoral: string): Observable<GenericResponseBean<Array<AgrupacionPolitica>>> {
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    
    this.asignarUrlBackend();
    
    return this.httpClient.get<GenericResponseBean<Array<AgrupacionPolitica>>>(
      this.globalService.reemplazarDobleSlash(`${this.urlServidor}/probables-candidatos/list-agrupol/${idEleccion}/${distritoElectoral}`),
      { headers: headers }
    );
  }

  public obtenerProbablesCandidatosElectos(acronimo: string, filtros: FiltroProbablesCandidatos): Observable<GenericResponseBean<ProbableCandidatoElecto[]>> {
    const headers = new HttpHeaders({
          [Constantes.HEADER_TENANT_ID]: acronimo
        });
    
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_PROBABLES_CANDIDATOS_ELECTOS}`);

    return this.httpClient.post<GenericResponseBean<ProbableCandidatoElecto[]>>( url, filtros, { headers: headers } );
  }  

  obtenerProbablesCandidatosElectosPDF(acronimo: string, filtros: FiltroProbablesCandidatos): Observable<GenericResponseBean<string>> {
    const headers = new HttpHeaders({
          [Constantes.HEADER_TENANT_ID]: acronimo
        });      
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_PROBABLES_CANDIDATOS_ELECTOS_BASE64}`);

    return this.httpClient.post<GenericResponseBean<string>>(url, filtros, {headers: headers});
  }

}
