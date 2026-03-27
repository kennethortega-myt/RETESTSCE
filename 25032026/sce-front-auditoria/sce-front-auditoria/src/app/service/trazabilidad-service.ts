import {Injectable} from "@angular/core";
import {TrazabilidadApi} from "../service-api/trazabilidad-api.service";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {TrazabilidadBean} from "../model/trazabilidadBean";

@Injectable({
  providedIn: 'root',
})
export class TrazabilidadService{
  constructor(private readonly trazabilidadApi:TrazabilidadApi) {
  }

  trazabilidadActa(acta: string): Observable<GenericResponseBean<TrazabilidadBean>>{
    return this.trazabilidadApi.trazabilidadActa(acta);
  }
  trazabilidadMesa(mesa: string): Observable<GenericResponseBean<TrazabilidadBean[]>>{
    return this.trazabilidadApi.trazabilidadMesa(mesa);
  }
}
