import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {TabAutorizacionBean} from "../model/tabAutorizacionBean";
import {PuestaCeroNacionApiService} from "../service-api/puesta-cero-nacion-api.service";
import {IPuestaCeroDTO} from "../interface/puestaCero.interface";

@Injectable({
  providedIn: 'root'
})
export class PuestaCeroNacionService {

  constructor(private readonly puestaCeroNacionApiServiceApi: PuestaCeroNacionApiService) {

  }


  getReportePuestaCeroBase64(acronimo:string, procesoId: number, esquema: string, idPuestaCeroStae: any, idPuestaCeroVd: any): Observable<GenericResponseBean<string>>{
    return this.puestaCeroNacionApiServiceApi.getReportePuestaCeroBase64(acronimo, procesoId, esquema, idPuestaCeroStae, idPuestaCeroVd);
  }

  puestaCero(data:IPuestaCeroDTO): Observable<GenericResponseBean<any>>{
    return this.puestaCeroNacionApiServiceApi.puestaCero(data);
  }

}
