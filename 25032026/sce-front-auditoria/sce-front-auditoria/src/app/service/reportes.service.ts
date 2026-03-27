import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {UbigeoDepartamentoBean} from "../model/UbigeoDepartamentoBean";
import {ReportesServiceApi} from "../service-api/reportes-service-api.service";
import {FiltroUbigeoDepartamentoBean} from "../model/FiltroUbigeoDepartamentoBean";
import {GenericResponseBean} from "../model/genericResponseBean";
import {EleccionResponseBean} from "../model/eleccionResponseBean";
import {ProcesoElectoralResponseBean} from "../model/procesoElectoralResponseBean";
import {AmbitoBean} from "../model/ambitoBean";
import {ProcesoAmbitoBean} from "../model/procesoAmbitoBean";
import {CentroComputoBean} from "../model/centroComputoBean";
import {FiltroUbigeoProvinciaBean} from "../model/filtroUbigeoProvinciaBean";
import {UbigeoProvinciaBean} from "../model/ubigeoProvinciaBean";
import {FiltroUbigeoDistritoBean} from "../model/filtroUbigeoDistritoBean";
import {UbigeoDistritoBean} from "../model/ubigeoDistritoBean";

@Injectable({
  providedIn: 'root',
})
export class ReportesService{
  constructor(private readonly reportesServiceApi:ReportesServiceApi) {
  }

  getDepartamento(filtroUbigeoDepartamentoBean: FiltroUbigeoDepartamentoBean):Observable<GenericResponseBean<Array<UbigeoDepartamentoBean>>>{
    return this.reportesServiceApi.getDepartamento(filtroUbigeoDepartamentoBean);
  }
  getProvincia(filtroUbigeoProvinciaBean: FiltroUbigeoProvinciaBean):Observable<GenericResponseBean<Array<UbigeoProvinciaBean>>>{
    return this.reportesServiceApi.getProvincia(filtroUbigeoProvinciaBean);
  }
  getDistrito(filtroUbigeoDistritoBean: FiltroUbigeoDistritoBean):Observable<GenericResponseBean<Array<UbigeoDistritoBean>>>{
    return this.reportesServiceApi.getDistrito(filtroUbigeoDistritoBean);
  }

  getListProcesos():Observable<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>{
    return this.reportesServiceApi.getListProcesos();
  }

  obtenerElecciones(idProceso: string): Observable<GenericResponseBean<Array<EleccionResponseBean>>>{
    return this.reportesServiceApi.obtenerElecciones(idProceso);
  }

  getListAmbitos(): Observable<GenericResponseBean<Array<AmbitoBean>>>{
    return this.reportesServiceApi.getListAmbitos();
  }

  getTipoAmbitoPorProceso(idProceso: string):Observable<GenericResponseBean<ProcesoAmbitoBean>>{
    return this.reportesServiceApi.getTipoAmbitoPorProceso(idProceso);
  }

  getCentrosComputo():Observable<GenericResponseBean<Array<CentroComputoBean>>>{
    return this.reportesServiceApi.getCentrosComputo();
  }
}
