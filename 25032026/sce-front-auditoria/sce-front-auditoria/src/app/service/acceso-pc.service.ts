import { Injectable } from "@angular/core";
import { AccesoPcServiceApi } from "../service-api/acceso-pc-service-api.service";
import { Observable } from "rxjs";
import { GenericResponseBean } from "../model/genericResponseBean";
import { PageResponse } from "../interface/pageResponse.interface";
import { AccesoPcResponse } from "../interface/accesoPcResponse.interface";
import { AutorizacionNacionResponseBean } from "../model/autorizacionNacionResponseBean";
import { AccesoPcRequest } from "../interface/accesoPcRequest.interface";

@Injectable({
    providedIn: 'root',
})
export class AccesoPcService {

  constructor(private readonly accesoPcServiceApi: AccesoPcServiceApi) {
  }

  listarPaginado(page: number, size: number):Observable<GenericResponseBean<PageResponse<AccesoPcResponse>>>{
    return this.accesoPcServiceApi.listarPaginado(page, size);
  }

  consultaAutorizacion(accesoPcRequest: AccesoPcRequest): Observable<GenericResponseBean<AutorizacionNacionResponseBean>>{
    return this.accesoPcServiceApi.consultaAutorizacion(accesoPcRequest);
  }

  solicitarAutorizacion(accesoPcRequest: AccesoPcRequest): Observable<GenericResponseBean<boolean>>{
    return this.accesoPcServiceApi.solicitarAutorizacion(accesoPcRequest);
  }

  actualizarEstado(accesoPcRequest: AccesoPcRequest): Observable<GenericResponseBean<boolean>>{
    return this.accesoPcServiceApi.actualizarEstado(accesoPcRequest);
  }

  getReporteListadoPcs():Observable<GenericResponseBean<string>>{
    return this.accesoPcServiceApi.getReporteListadoPcs();
  }
}
