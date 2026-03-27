import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {Constantes} from "../helper/constantes";

@Injectable({
  providedIn: 'root',
})
export class VerificaVersionApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  puestaCeroVerificaOrc(): Observable<GenericResponseBean<string>> {
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor +Constantes.CB_VERIFICA_VERSION_CONTROLLER_PUESTA_CERO,
      {},
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  procesarVerificaVersionOrc(): Observable<GenericResponseBean<string>> {
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor +Constantes.CB_VERIFICA_VERSION_CONTROLLER_PROCESAR_ORC,
      {},
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  reporteVerificaVersion(): Observable<GenericResponseBean<string>> {
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor +Constantes.CB_VERIFICA_VERSION_CONTROLLER_REPORTE,
      {},
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }
}
