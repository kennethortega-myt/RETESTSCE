import {Injectable} from "@angular/core";
import {VerificaVersionApi} from "../service-api/verifica-version-api.service";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";

@Injectable({
  providedIn: 'root',
})
export class VerificaVersionService{
  constructor(private readonly verificaVersionApi:VerificaVersionApi) {
  }

  puestaCeroVerificaOrc(): Observable<GenericResponseBean<string>> {
    return this.verificaVersionApi.puestaCeroVerificaOrc();
  }

  procesarVerificaVersionOrc(): Observable<GenericResponseBean<string>> {
    return this.verificaVersionApi.procesarVerificaVersionOrc();
  }

  reporteVerificaVersion(): Observable<GenericResponseBean<string>> {
    return this.verificaVersionApi.reporteVerificaVersion();
  }
}
