import { Injectable } from "@angular/core";
import {HttpClient} from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { GenericResponseBean } from "../model/genericResponseBean";
import { Constantes } from "../helper/constantes";
import {AuthService} from "../service/auth-service.service";
import {EleccionDTO, UbigeoDTO} from '../model/ubigeoElectoralBean';
import {LocalVotacionBean} from '../model/localVotacionBean';

@Injectable({
  providedIn: 'root',
})
export class UbigeoServiceApiService {

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService,) {
    this.urlServidor = environment.apiUrlORC;
  }

  listarDepartamentos():Observable<GenericResponseBean<UbigeoDTO[]>>{
    return this.httpClient.get<GenericResponseBean<UbigeoDTO[]>>(
      this.urlServidor + Constantes.CB_PROCESO_CONTROLLER_UBIGEO_DEPARTAMENTOS,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  listarProvincias(idDepartamento:number):Observable<GenericResponseBean<UbigeoDTO[]>>{
    return this.httpClient.get<GenericResponseBean<UbigeoDTO[]>>(
      this.urlServidor + Constantes.CB_PROCESO_CONTROLLER_UBIGEO_PROVINCIA.replace("{idDepartamento}",idDepartamento==null?"0":idDepartamento.toString()),
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  listarDistritos(idProvincia:number):Observable<GenericResponseBean<UbigeoDTO[]>>{
    return this.httpClient.get<GenericResponseBean<UbigeoDTO[]>>(
      this.urlServidor + Constantes.CB_PROCESO_CONTROLLER_UBIGEO_DISTRITO.replace("{idProvincia}",idProvincia==null?"0":idProvincia.toString()),
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  listarLocalesVotacionPorUbigeo(idUbigeo:number):Observable<GenericResponseBean<LocalVotacionBean[]>> {
    return this.httpClient.get<GenericResponseBean<LocalVotacionBean[]>>(
      this.urlServidor + Constantes.CB_PROCESO_CONTROLLER_UBIGEO_LOCAL_VOTACION.replace("{idUbigeo}",idUbigeo==null?"0":idUbigeo.toString()),
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  listarEleccionesPorUbigeo(idUbigeo:number):Observable<GenericResponseBean<EleccionDTO[]>> {
    return this.httpClient.get<GenericResponseBean<EleccionDTO[]>>(
      this.urlServidor + Constantes.CB_PROCESO_CONTROLLER_UBIGEO_ELECCION.replace("{idUbigeo}",idUbigeo==null?"0":idUbigeo.toString()),
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

}
