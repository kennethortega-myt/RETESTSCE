import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {Constantes} from "../helper/constantes";
import {VerificationLeBean} from "../model/verificationLeBean";
import {AuthService} from "../service/auth-service.service";

@Injectable({
  providedIn: 'root',
})
export class OmisosListaElectoresServiceApi{

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,
    public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  getRandomListaElectores(reprocesar: boolean, tipoDenuncia: string): Observable<GenericResponseBean<VerificationLeBean>>{
    let params = new HttpParams()
      .set('tipoDenuncia', tipoDenuncia)
      .set('reprocesar', reprocesar);
    return this.httpClient.get<GenericResponseBean<VerificationLeBean>>(
      this.urlServidor + Constantes.CB_VERIFICATION_CONTROLLER_GET_RANDOM_LE,
      {
        params: params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  saveListaElectores(data: VerificationLeBean, reprocesar: boolean): Observable<GenericResponseBean<boolean>>{
    let params = new HttpParams()
      .set('reprocesar', reprocesar);
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor+Constantes.CB_VERIFICATION_CONTROLLER_SAVE_LISTA_LE,
      data, {
        params: params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  rechazarListaElectores(mesaId: number): Observable<GenericResponseBean<boolean>>{
    const params = new HttpParams()
      .append('mesaId', mesaId);
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor+Constantes.CB_VERIFICATION_CONTROLLER_RECHAZAR_LE,
      {}, {
        params: params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }


}
