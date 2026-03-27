import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GenericResponseBean } from "../model/genericResponseBean";
import { PageResponse } from "../interface/pageResponse.interface";
import { AccesoPcResponse } from "../interface/accesoPcResponse.interface";
import { AccesoPcNacionServiceApi } from "../service-api/acceso-pc-nacion-service-api.service";
import { AccesoPcRequest } from "../interface/accesoPcRequest.interface";
import { AutorizacionNacionResponseBean } from "../model/autorizacionNacionResponseBean";

@Injectable({
    providedIn: 'root',
})
export class AccesoPcNacionService {
    constructor(private readonly accesoPcNacionServiceApi: AccesoPcNacionServiceApi) {
    }

    listarPaginado(page: number, size: number):Observable<GenericResponseBean<PageResponse<AccesoPcResponse>>>{
      return this.accesoPcNacionServiceApi.listarPaginado(page, size);
    }

    consultaAutorizacion(accesoPcRequest: AccesoPcRequest): Observable<GenericResponseBean<AutorizacionNacionResponseBean>>{
      return this.accesoPcNacionServiceApi.consultaAutorizacion(accesoPcRequest);
    }

    solicitarAutorizacion(accesoPcRequest: AccesoPcRequest): Observable<GenericResponseBean<boolean>>{
      return this.accesoPcNacionServiceApi.solicitarAutorizacion(accesoPcRequest);
    }

    actualizarEstado(accesoPcRequest: AccesoPcRequest): Observable<GenericResponseBean<boolean>>{
      return this.accesoPcNacionServiceApi.actualizarEstado(accesoPcRequest);
    }

    getReporteListadoPcs():Observable<GenericResponseBean<string>>{
      return this.accesoPcNacionServiceApi.getReporteListadoPcs();
    }
}
