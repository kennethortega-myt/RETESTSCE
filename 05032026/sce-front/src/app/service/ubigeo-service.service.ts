import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {GenericResponseBean} from "../model/genericResponseBean";
import {UbigeoServiceApiService} from '../service-api/ubigeo-service-api.service';
import {EleccionDTO, UbigeoDTO} from '../model/ubigeoElectoralBean';
import {LocalVotacionBean} from '../model/localVotacionBean';

@Injectable({
  providedIn: 'root',
})
export class UbigeoService {

  constructor(
    private readonly ubigeoServiceApiService: UbigeoServiceApiService
  ) {}


  listarDepartamentos():Observable<GenericResponseBean<UbigeoDTO[]>>{
    return this.ubigeoServiceApiService.listarDepartamentos();
  }

  listarProvincias(idDepartamento:number):Observable<GenericResponseBean<UbigeoDTO[]>>{
    return this.ubigeoServiceApiService.listarProvincias(idDepartamento)
  }

  listarDistritos(idProvincia:number):Observable<GenericResponseBean<UbigeoDTO[]>>{
    return this.ubigeoServiceApiService.listarDistritos(idProvincia);
  }

  listarLocalesVotacionPorUbigeo(idUbigeo:number):Observable<GenericResponseBean<LocalVotacionBean[]>> {
    return this.ubigeoServiceApiService.listarLocalesVotacionPorUbigeo(idUbigeo);
  }

  listarEleccionesPorUbigeo(idUbigeo:number):Observable<GenericResponseBean<EleccionDTO[]>> {
    return this.ubigeoServiceApiService.listarEleccionesPorUbigeo(idUbigeo);
  }

}
