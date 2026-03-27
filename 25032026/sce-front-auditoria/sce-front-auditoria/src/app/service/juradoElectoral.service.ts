import { Injectable } from '@angular/core';
import {IGenericInterface, SearchFilterResponse} from "../interface/general.interface";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {GenericResponseBean} from "../model/genericResponseBean";
import { IJuradoELectoralEspecial } from '../interface/juradoElectoralEspecial.inteface';
import { OrcDetalleCatalogoEstructuraBean } from '../model/orcDetalleCatalogoEstructuraBean';
import { Constantes } from '../helper/constantes';

@Injectable({
  providedIn: 'root'
})
export class JuradoElectoralService {

  initSearch: SearchFilterResponse<IJuradoELectoralEspecial> = {list: [], page: 0, totalPages: 0, size: 0, total: 0}

  private readonly urlServidor: string;
  private readonly urlNacion : string;
  private readonly parametroSubject = new BehaviorSubject<SearchFilterResponse<IJuradoELectoralEspecial>>(this.initSearch);
  parametros$: Observable<SearchFilterResponse<IJuradoELectoralEspecial>> = this.parametroSubject.asObservable();


  constructor(private readonly httpClient: HttpClient) {
    this.urlServidor = environment.apiUrlORC + "juradoElectoral";
    this.urlNacion = environment.apiUrl + "/juradoElectoral"
  }

  listJuradoElectorales(page:number, size:number, isNacion:boolean, acronimo: string, search?: string ): void {
    let params = new HttpParams()
      .set('page', page)
      .set('filter', search ?? '')
      .set('size', size);
      const headers = new HttpHeaders({
        'X-Tenant-Id': acronimo ?? ''
      });
      this.httpClient.get<GenericResponseBean<SearchFilterResponse<IJuradoELectoralEspecial>>>(isNacion ? ` ${this.urlNacion}` :` ${this.urlServidor}`, {params,headers}).subscribe(data => {
        this.parametroSubject.next(data.data);
      });
  }

  listarJEE(cMaestro: string, cColumna: string, isNacion:boolean, acronimo: string): Observable<IGenericInterface<OrcDetalleCatalogoEstructuraBean[]>> {
    const headers = new HttpHeaders({
        'X-Tenant-Id': acronimo ?? ''
      });
    const baseUrl = isNacion
    ? environment.apiUrl+"/"
    : environment.apiUrlORC;

    const url = `${baseUrl}${Constantes.CB_GENERAL_CONTROLLER_DET_CATALOGO_ESTRUCTURA}`;
    const params = { c_maestro: cMaestro, c_columna: cColumna };
    return this.httpClient.get<IGenericInterface<OrcDetalleCatalogoEstructuraBean[]>>(url,{ headers, params });
  }

  save(data:IJuradoELectoralEspecial, isNacion:boolean, acronimo: string): Observable<any>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo ?? ''
    });
    return this.httpClient.post<GenericResponseBean<any>>(isNacion ? ` ${this.urlNacion}/save` :` ${this.urlServidor}/save`,data, {headers});
  }
}
