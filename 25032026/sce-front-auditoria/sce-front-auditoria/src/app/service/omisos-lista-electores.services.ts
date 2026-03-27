import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {OmisosListaElectoresServiceApi} from "../service-api/omisos-lista-electores-service-api.service";
import {VerificationLeBean} from "../model/verificationLeBean";

@Injectable({
  providedIn: 'root',
})
export class OmisosListaElectoresServices{
  constructor(private readonly omisosListaElectoresServiceApi:OmisosListaElectoresServiceApi) {
  }

  getRandomListaElectores(reprocesar: boolean, tipoDenuncia: string): Observable<GenericResponseBean<VerificationLeBean>>{
    return this.omisosListaElectoresServiceApi.getRandomListaElectores(reprocesar, tipoDenuncia);
  }

  saveListaElectores(data: VerificationLeBean, reprocesar: boolean): Observable<GenericResponseBean<boolean>>{
    return this.omisosListaElectoresServiceApi.saveListaElectores(data, reprocesar);
  }

  rechazarListaElectores(mesaId: number): Observable<GenericResponseBean<boolean>>{
    return this.omisosListaElectoresServiceApi.rechazarListaElectores(mesaId);
  }
}
