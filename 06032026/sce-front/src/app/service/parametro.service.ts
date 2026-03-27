import { Injectable } from '@angular/core';
import {SearchFilterResponse} from "../interface/general.interface";
import {BehaviorSubject, map, Observable} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {GenericResponseBean} from "../model/genericResponseBean";
import {IDetalleParametro, IParametro} from "../interface/parametro.inteface";

@Injectable({
  providedIn: 'root'
})
export class ParametroService {

  initSearch: SearchFilterResponse<IParametro> = {list: [], page: 0, totalPages: 0, size: 0, total: 0}

  private readonly urlServidor: string;
  private readonly urlNacion : string;
  private readonly parametroSubject = new BehaviorSubject<SearchFilterResponse<IParametro>>(this.initSearch);
  parametros$: Observable<SearchFilterResponse<IParametro>> = this.parametroSubject.asObservable();


  constructor(private readonly httpClient: HttpClient) {
    this.urlServidor = environment.apiUrlORC + "parametro";
    this.urlNacion = environment.apiUrl + "/parametro"
  }

  listParametros(page:number, size:number, isNacion:boolean, acronimo: string, search?: string ): void {
    let params = new HttpParams()
      .set('page', page)
      .set('filter', search ?? '')
      .set('size', size);
      const headers = new HttpHeaders({
        'X-Tenant-Id': acronimo ?? ''
      });
      this.httpClient.get<GenericResponseBean<SearchFilterResponse<IParametro>>>(isNacion ? ` ${this.urlNacion}` :` ${this.urlServidor}`, {params,headers}).subscribe(data => {
        this.parametroSubject.next(data.data);
      });
  }

  listDetalleParametro(idParametro: number, isNacion:boolean, acronimo: string): Observable<GenericResponseBean<Array<IDetalleParametro>>> {
    let params = new HttpParams().set('idParametro', idParametro);
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo ?? ''
    });
    return this.httpClient.get<GenericResponseBean<Array<IDetalleParametro>>>(isNacion ? ` ${this.urlNacion}/detalle` :` ${this.urlServidor}/detalle`, { params, headers })
      .pipe(
        map(response => {
          if (response.data) {
            response.data = response.data.map(detalle => ({
              ...detalle,
              isEditar:false
            }));
          }
          return response;
        })
      );
  }

  saveDetalle(data:IDetalleParametro, isNacion:boolean, acronimo: string): Observable<any>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo ?? ''
    });
    data.isEditar = undefined;
    return this.httpClient.post<GenericResponseBean<any>>(isNacion ? ` ${this.urlNacion}/detalle` :` ${this.urlServidor}/detalle`,data, {headers});
  }

  actualziarEstado(data:IDetalleParametro, isNacion:boolean, acronimo: string): Observable<any>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo ?? ''
    });
    data.isEditar = undefined;
    return this.httpClient.put<GenericResponseBean<any>>(isNacion ? ` ${this.urlNacion}/estado` :` ${this.urlServidor}/estado`,data, {headers});
  }
}
