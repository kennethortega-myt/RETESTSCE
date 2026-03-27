import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {Constantes} from "../helper/constantes";
import {AuthService} from "../service/auth-service.service";
import { AutorizacionImportacionNacionBean } from "../model/autorizacionImportacionNacionBean";

@Injectable({
  providedIn: 'root'
})
export class ImportarNacionApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,
              public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  autorizacion(): Observable<GenericResponseBean<AutorizacionImportacionNacionBean>>{
    return this.httpClient.post<GenericResponseBean<AutorizacionImportacionNacionBean>>(
      this.urlServidor + Constantes.CB_IMPORTAR_NACION_CONSULTAR_AUTORIZACION,
      {},
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
    });
  }

  solicitarAcceso(): Observable<GenericResponseBean<boolean>>{
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor + Constantes.CB_IMPORTAR_NACION_SOLICITAR_AUTORIZACION,
      {},
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
    });
  }
}
