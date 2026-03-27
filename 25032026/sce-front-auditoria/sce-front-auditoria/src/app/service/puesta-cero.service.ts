import {Injectable} from "@angular/core";
import {PuestaCeroApiServiceApi} from "../service-api/puesta-cero-api.service";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {TabAutorizacionBean} from "../model/tabAutorizacionBean";
import { AutorizacionPuestoCeroBean } from "../model/autorizacionPuestoCeroBean";

@Injectable({
  providedIn: 'root',
})
export class PuestaCeroService{
  constructor(private readonly puestaCeroApiServiceApi: PuestaCeroApiServiceApi) {

  }

  getReportePuestaCeroBase64(): Observable<GenericResponseBean<string>>{
    return this.puestaCeroApiServiceApi.getReportePuestaCeroBase64();
  }

  autorizacion(tipo?:string): Observable<GenericResponseBean<TabAutorizacionBean>>{
    return this.puestaCeroApiServiceApi.autorizacion(tipo);
  }


  puestaCeroTransmision(): Observable<GenericResponseBean<string>>{
    return this.puestaCeroApiServiceApi.puestaCeroTransmision();
  }


  puestaCeroOmisos(idAutorizacion:string): Observable<GenericResponseBean<string>>{
    return this.puestaCeroApiServiceApi.puestaCeroOmisos(idAutorizacion);
  }

  validarAccesoAlModulo(): Observable<GenericResponseBean<AutorizacionPuestoCeroBean>>{
    return this.puestaCeroApiServiceApi.autorizacionNacion();
  }

  solicitarAccesoAlModulo(): Observable<GenericResponseBean<boolean>>{
    return this.puestaCeroApiServiceApi.solicitarAccesoNacion();
  }

}
