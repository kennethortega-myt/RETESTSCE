import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {TabAutorizacionBean} from "../model/tabAutorizacionBean";
import { AutorizacionesNacionApi } from "../service-api/autorizaciones-nacion-api.service";
import { AutorizacionNacionBean } from "../model/autorizacionNacionBean";
import {AutorizacionRequestBean} from '../model/autorizacionRequestBean';

@Injectable({
  providedIn: 'root',
})
export class AutorizacionNacionService{
  constructor(private readonly autorizacionesNacionApi: AutorizacionesNacionApi) {
  }

	listAutorizaciones(idProceso:number, acronimo:string): Observable<GenericResponseBean<Array<AutorizacionNacionBean>>>{
		return this.autorizacionesNacionApi.listAutorizaciones(idProceso, acronimo);
	}

  aprobarAutorizacion(acronimo:string, filtro: AutorizacionRequestBean): Observable<GenericResponseBean<TabAutorizacionBean>>{
    return this.autorizacionesNacionApi.aprobarAutorizacion(acronimo, filtro);
  }

  cancelarAutorizacion(acronimo:string, filtro: AutorizacionRequestBean): Observable<GenericResponseBean<TabAutorizacionBean>>{
    return this.autorizacionesNacionApi.cancelarAutorizacion(acronimo, filtro);
  }
}
