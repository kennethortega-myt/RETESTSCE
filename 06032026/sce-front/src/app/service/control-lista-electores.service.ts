import {Injectable} from "@angular/core";
import {ControlListaElectoresServiceApi} from "../service-api/control-lista-electores-service-api.service";
import {Observable} from "rxjs";
import {DigitizationListMesasBean} from "../model/digitizationListMesasBean";
import {IGenericInterface} from '../interface/general.interface';

@Injectable({
  providedIn: 'root',
})
export class ControlListaElectoresService{
  constructor(private readonly controlListaElectoresServiceApi:ControlListaElectoresServiceApi) {
  }

  listaLE():Observable<Array<DigitizationListMesasBean>>{
    return this.controlListaElectoresServiceApi.listaLE();
  }

  aprobarlistaElectores(mesaId: number, tipoDoc: string) : Observable<IGenericInterface<boolean>>{
    return this.controlListaElectoresServiceApi.aprobarlistaElectores(mesaId,tipoDoc);
  }

  rechazarlistaElectores(mesaId: number, tipoDoc: string) : Observable<IGenericInterface<boolean>>{
    return this.controlListaElectoresServiceApi.rechazarlistaElectores(mesaId,tipoDoc);
  }
}
