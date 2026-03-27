import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ReporteActaContabilizadaNacionApiService {

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient) {
    this.urlServidor = environment.apiUrl+'/';
  }

  getPorcentajeActaContabilizada(idEleccion:string):Observable<GenericResponseBean<number>>{
    return this.httpClient.get<GenericResponseBean<number>>(`${this.urlServidor}reporte-contabilizacion-votos-nacion/eleccion/${idEleccion}`);
  }
}
