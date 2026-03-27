import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {UbigeoDepartamentoBean} from "../model/UbigeoDepartamentoBean";
import {Constantes} from "../helper/constantes";
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
export class ReportesServiceApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService,) {
    this.urlServidor = environment.apiUrlORC;
  }

  getDepartamento(filtroUbigeoDepartamentoBean: FiltroUbigeoDepartamentoBean):Observable<GenericResponseBean<Array<UbigeoDepartamentoBean>>>{
    return this.httpClient.post<GenericResponseBean<Array<UbigeoDepartamentoBean>>>(
      this.urlServidor + Constantes.CB_UBIGEO_CONTROLLER_GET_DEPARTAMENTO, filtroUbigeoDepartamentoBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getProvincia(filtroUbigeoProvinciaBean: FiltroUbigeoProvinciaBean):Observable<GenericResponseBean<Array<UbigeoProvinciaBean>>>{
    return this.httpClient.post<GenericResponseBean<Array<UbigeoProvinciaBean>>>(
      this.urlServidor + Constantes.CB_UBIGEO_CONTROLLER_GET_PROVINCIA, filtroUbigeoProvinciaBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getDistrito(filtroUbigeoDistritoBean: FiltroUbigeoDistritoBean):Observable<GenericResponseBean<Array<UbigeoDistritoBean>>>{
    return this.httpClient.post<GenericResponseBean<Array<UbigeoDistritoBean>>>(
      this.urlServidor + Constantes.CB_UBIGEO_CONTROLLER_GET_DISTRITO, filtroUbigeoDistritoBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getListProcesos():Observable<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>{
    return this.httpClient.get<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>(
      this.urlServidor + Constantes.CB_PROCESO_CONTROLLER_LIST_PROCESOS,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  obtenerElecciones(idProceso: string):Observable<GenericResponseBean<Array<EleccionResponseBean>>>{
    return this.httpClient.get<GenericResponseBean<Array<EleccionResponseBean>>>(
      this.urlServidor +"proceso/"+idProceso+ Constantes.CB_PROCESO_CONTROLLER_LIST_ELECCIONES,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getListAmbitos():Observable<GenericResponseBean<Array<AmbitoBean>>>{
    return this.httpClient.get<GenericResponseBean<Array<AmbitoBean>>>(
      this.urlServidor + Constantes.CB_AMBITO_CONTROLLER_LIST_AMBITOS,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getTipoAmbitoPorProceso(idProceso: string):Observable<GenericResponseBean<ProcesoAmbitoBean>>{
    return this.httpClient.get<GenericResponseBean<ProcesoAmbitoBean>>(
      this.urlServidor + "proceso/" + idProceso + Constantes.CB_PROCESO_CONTROLLER_TIPO_AMBITO_POR_PROCESO,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getCentrosComputo():Observable<GenericResponseBean<Array<CentroComputoBean>>>{
    return this.httpClient.get<GenericResponseBean<Array<CentroComputoBean>>>(
      this.urlServidor + Constantes.CB_CENTRO_COMPUTO_CONTROLLER_LIST_CENTROS_COMPUTO,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }
}
