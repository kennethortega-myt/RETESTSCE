import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {ActaReprocesadaListBean} from "../model/actaReprocesadaListBean";
import {ReprocesarActaApi} from "../service-api/reprocesar-acta-api.service";
import { AutorizacionReprocesamientoBean } from "../model/autorizacionReprocesamientoBean";

@Injectable({
  providedIn: 'root',
})
export class ReprocesarActaService {
  constructor(private readonly reprocesarActaApi:ReprocesarActaApi) {
  }

  getActaReprocesar(acta: string): Observable<GenericResponseBean<ActaReprocesadaListBean>>{
    return this.reprocesarActaApi.getActaReprocesar(acta);
  }

  reprocesarActas(listActas: Array<ActaReprocesadaListBean>): Observable<GenericResponseBean<boolean>>{
    return this.reprocesarActaApi.reprocesarActas(listActas);
  }
  listReprocesarActas(): Observable<GenericResponseBean<Array<ActaReprocesadaListBean>>>{
    return this.reprocesarActaApi.listReprocesarActs();
  }

  updateReprocesar(listActas: Array<ActaReprocesadaListBean>): Observable<GenericResponseBean<boolean>>{
    return this.reprocesarActaApi.updateReprocesar(listActas);
  }

  validarAccesoAlModulo(): Observable<GenericResponseBean<AutorizacionReprocesamientoBean>>{
    return this.reprocesarActaApi.autorizacion();
  }
  solicitarAccesoAlModulo(): Observable<GenericResponseBean<boolean>>{
    return this.reprocesarActaApi.solicitarAccesoReprocesar();
  }
}
