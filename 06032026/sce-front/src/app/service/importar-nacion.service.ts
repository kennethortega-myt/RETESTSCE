import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import { AutorizacionImportacionNacionBean } from "../model/autorizacionImportacionNacionBean";
import { ImportarNacionApi } from "../service-api/importar-nacion-service-api.service";

@Injectable({
  providedIn: 'root',
})
export class ImportarNacionService {
  constructor(private readonly importacionNacionApi: ImportarNacionApi) {
  }

  validarAccesoAlModulo(): Observable<GenericResponseBean<AutorizacionImportacionNacionBean>>{
    return this.importacionNacionApi.autorizacion();
  }

  solicitarAccesoAlModulo(): Observable<GenericResponseBean<boolean>>{
    return this.importacionNacionApi.solicitarAcceso();
  }

}
