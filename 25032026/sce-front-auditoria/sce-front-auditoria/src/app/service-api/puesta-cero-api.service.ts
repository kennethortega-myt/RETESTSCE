import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {Constantes} from "../helper/constantes";
import {TabAutorizacionBean} from "../model/tabAutorizacionBean";
import { AutorizacionPuestoCeroBean } from "../model/autorizacionPuestoCeroBean";

@Injectable({
  providedIn: "root"
})
export class PuestaCeroApiServiceApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  getReportePuestaCeroBase64(): Observable<GenericResponseBean<string>>{
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor + Constantes.CB_PUESTA_CERO_CONTROLLER_REPORTE_BASE64,{},{
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });

  }

  autorizacion(tipo?:string): Observable<GenericResponseBean<TabAutorizacionBean>>{
    return this.httpClient.post<GenericResponseBean<TabAutorizacionBean>>(
      this.urlServidor + Constantes.CB_PUESTA_CERO_CONTROLLER_AUTORIZACION,{},{
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},params:{tipo:tipo}
      });
  }

  puestaCeroTransmision(): Observable<GenericResponseBean<string>>{
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor + Constantes.CB_PUESTA_CERO_CONTROLLER_TRANSMISION,{},{
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  puestaCeroOmisos(idAutorizacion:string): Observable<GenericResponseBean<string>>{
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor + Constantes.CB_PUESTA_CERO_CONTROLLER_GENERAL,{},{
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},params:{idAutorizacion:idAutorizacion}
      });
  }

  autorizacionNacion(): Observable<GenericResponseBean<AutorizacionPuestoCeroBean>>{
    return this.httpClient.post<GenericResponseBean<AutorizacionPuestoCeroBean>>(
      this.urlServidor + Constantes.CB_IMPORTAR_PC_CONSULTAR_AUTORIZACION,
      {},
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
    });
  }

  solicitarAccesoNacion(): Observable<GenericResponseBean<boolean>>{
      return this.httpClient.post<GenericResponseBean<boolean>>(
        this.urlServidor + Constantes.CB_IMPORTAR_PC_SOLICITAR_AUTORIZACION,
        {},
        {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      });
  }
}
