import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../service/auth-service.service";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { GenericResponseBean } from "../model/genericResponseBean";
import { PageResponse } from "../interface/pageResponse.interface";
import { AccesoPcResponse } from "../interface/accesoPcResponse.interface";
import { Constantes } from "../helper/constantes";
import { AutorizacionNacionResponseBean } from "../model/autorizacionNacionResponseBean";
import { AccesoPcRequest } from '../interface/accesoPcRequest.interface';

@Injectable({
  providedIn: 'root',
})
export class AccesoPcServiceApi{

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  listarPaginado(page: number, size: number):Observable<GenericResponseBean<PageResponse<AccesoPcResponse>>>{
    const params = new HttpParams()
    .append('page', page)
    .append('size', size);

    return this.httpClient.get<GenericResponseBean<PageResponse<AccesoPcResponse>>>(
      this.urlServidor + Constantes.CB_ACCESO_PC_CONTROLLER_LISTAR_PAGINADO,
      {
        params: params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );

  }

  consultaAutorizacion(accesoPcRequest: AccesoPcRequest): Observable<GenericResponseBean<AutorizacionNacionResponseBean>>{
    return this.httpClient.post<GenericResponseBean<AutorizacionNacionResponseBean>>(
      this.urlServidor + Constantes.CB_ACCESO_PC_CONTROLLER_CONSULTA_AUTORIZACION,
      accesoPcRequest,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      }
    );
  }

  solicitarAutorizacion(accesoPcRequest: AccesoPcRequest): Observable<GenericResponseBean<boolean>>{
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor + Constantes.CB_ACCESO_PC_CONTROLLER_SOLICITAR_AUTORIZACION,
      accesoPcRequest,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      }
    );
  }

  actualizarEstado(accesoPcRequest: AccesoPcRequest): Observable<GenericResponseBean<boolean>>{

    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor + Constantes.CB_ACCESO_PC_CONTROLLER_ACTUALIZAR_ESTADO,
      accesoPcRequest,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      }
    );
  }

  getReporteListadoPcs():Observable<GenericResponseBean<string>>{
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor + Constantes.CB_ACCESO_PC_CONTROLLER_BASE64, null,   
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      }
    );
  }

}
