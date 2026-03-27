import {Injectable} from "@angular/core";
import {AutorizacionesApi} from "../service-api/autorizaciones-api.service";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {AutorizacionBean} from "../model/autorizacionBean";
import {TabAutorizacionBean} from "../model/tabAutorizacionBean";
import {AutorizacionCCRequestBean} from '../model/autorizacionCCRequestBean';
import {AutorizacionCCResponseBean} from '../model/autorizacionCCResponseBean';

@Injectable({
  providedIn: 'root',
})
export class AutorizacionService{
  constructor(private readonly autorizacionesApi: AutorizacionesApi) {
  }

  listAutorizaciones():  Observable<GenericResponseBean<Array<AutorizacionBean>>>{
    return this.autorizacionesApi.listAutorizaciones();
  }

  aprobarAutorizacion(idAutorizacion: string): Observable<GenericResponseBean<TabAutorizacionBean>>{
    return this.autorizacionesApi.aprobarAutorizacion(idAutorizacion);
  }

  rechazarAutorizacionCC(idAutorizacion: string): Observable<GenericResponseBean<TabAutorizacionBean>>{
    return this.autorizacionesApi.rechazarAutorizacionCC(idAutorizacion);
  }

  recibirAutorizacion(request:AutorizacionCCRequestBean): Observable<GenericResponseBean<AutorizacionCCResponseBean>>{
    return this.autorizacionesApi.recibirAutorizacion(request);
  }

  crearSolicitudAutorizacion(request:AutorizacionCCRequestBean): Observable<GenericResponseBean<boolean>>{
    return this.autorizacionesApi.crearSolicitudAutorizacion(request);
  }
}
