import {Injectable} from "@angular/core";
import {HabilitarActasStaeServiceApi} from "../service-api/habilitar-actas-stae-service-api.service";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {ActaBean} from "../model/resoluciones/acta-jee-bean";

@Injectable({
  providedIn: 'root',
})
export class HabilitarActasStaeService {

  constructor(private readonly habilitarActasStaeServiceApi: HabilitarActasStaeServiceApi) {
  }

  validaHabilitarActasStae(mesa: string): Observable<GenericResponseBean<Array<ActaBean>>>{
    return this.habilitarActasStaeServiceApi.validaHabilitarActasStae(mesa);
  }

  habilitarActasStae(listMesasStae: Array<ActaBean>): Observable<GenericResponseBean<ActaBean>>{
    return this.habilitarActasStaeServiceApi.habilitarActasStae(listMesasStae);
  }
}
