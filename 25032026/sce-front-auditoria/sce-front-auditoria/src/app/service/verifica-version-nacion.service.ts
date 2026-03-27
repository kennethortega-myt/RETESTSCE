import {Injectable} from "@angular/core";
import {VerificaVersionNacionApi} from "../service-api/verifica-version-nacion-api.service";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {IPuestaCeroDTO} from "../interface/puestaCero.interface";

@Injectable({
  providedIn: 'root',
})
export class VerificaVersionNacionService{
  constructor(private readonly verificaVersionNacionApi:VerificaVersionNacionApi) {
  }

  puestaCeroVerificaNacion(data:IPuestaCeroDTO): Observable<GenericResponseBean<string>> {
    return this.verificaVersionNacionApi.puestaCeroVerificaNacion(data);
  }

  procesarVerificaVersionNacion(data:IPuestaCeroDTO): Observable<GenericResponseBean<string>> {
    return this.verificaVersionNacionApi.procesarVerificaVersionNacion(data);
  }

  reporteVerificaVersionNacion(data:IPuestaCeroDTO): Observable<GenericResponseBean<string>> {
    return this.verificaVersionNacionApi.reporteVerificaVersionNacion(data);
  }
}
