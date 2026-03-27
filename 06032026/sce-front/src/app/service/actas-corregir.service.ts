import {Observable} from "rxjs";
import {ActasPorCorregirListBean} from "../model/actasPorCorregirListBean";
import {Injectable} from "@angular/core";
import {ActasCorregirServiceApi} from "../service-api/actas-corregir-service-api.service";
import {ActaPorCorregirBean} from "../model/actaPorCorregirBean";

@Injectable({
  providedIn: 'root',
})
export class ActasCorregirService{

  constructor(private readonly actasCorregirServiceApi: ActasCorregirServiceApi) {
  }

  obtenerActasPorCorregir(): Observable<Array<ActasPorCorregirListBean>>{
    return this.actasCorregirServiceApi.obtenerActasPorCorregir();
  }

  actasPorCorregirInfo(actaId: number): Observable<ActaPorCorregirBean>{
    return this.actasCorregirServiceApi.actasPorCorregirInfo(actaId);
  }

  validarActaPorCorregir(actaId: number, actaPorCorregir: ActaPorCorregirBean): Observable<Array<string>>{
    return this.actasCorregirServiceApi.validarActaPorCorregir(actaId,actaPorCorregir);
  }

  registrarActasPorCorregir(actaId: number, actaPorCorregir: ActaPorCorregirBean): Observable<boolean>{
    return this.actasCorregirServiceApi.registrarActasPorCorregir(actaId,actaPorCorregir);
  }
}
