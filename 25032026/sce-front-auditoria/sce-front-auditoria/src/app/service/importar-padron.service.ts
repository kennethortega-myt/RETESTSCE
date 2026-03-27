import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import { AutorizacionImportacionNacionBean } from "../model/autorizacionImportacionNacionBean";
import { ImportarPadronApi } from "../service-api/importar-padron-service-api";


@Injectable({
  providedIn: 'root',
})
export class ImportarPadronService {
  constructor(private readonly importarPadronApi: ImportarPadronApi) {
  }

  validarAccesoAlModulo(): Observable<GenericResponseBean<AutorizacionImportacionNacionBean>>{
    return this.importarPadronApi.autorizacion();
  }

  solicitarAccesoAlModulo(): Observable<GenericResponseBean<boolean>>{
    return this.importarPadronApi.solicitarAcceso();
  }

}
