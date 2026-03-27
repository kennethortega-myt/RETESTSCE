import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {VerificationMmBean} from "../model/verificationMmBean";
import {Constantes} from "../helper/constantes";
import {PadronBean} from "../model/padronBean";

@Injectable({
  providedIn: 'root',
})
export class OmisosHojaAsistenciaMmServiceApi{

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,
              public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  getRandomMiembrosMesa(reprocesar: boolean, tipoDenuncia: string): Observable<GenericResponseBean<VerificationMmBean>>{
    let params = new HttpParams()
      .set('tipoDenuncia', tipoDenuncia)
      .set('reprocesar', reprocesar);
    return this.httpClient.get<GenericResponseBean<VerificationMmBean>>(
      this.urlServidor + Constantes.CB_VERIFICATION_CONTROLLER_GET_RANDOM_MM,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
        params: params,
      }
    )
  }

  saveMiembrosMesa(data: VerificationMmBean, reprocesar: boolean): Observable<GenericResponseBean<boolean>>{
    let params = new HttpParams()
      .set('reprocesar', reprocesar);
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor+Constantes.CB_VERIFICATION_CONTROLLER_SAVE_MIEMBROS_MESA,
      data, {
        params: params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  rechazarMiembrosMesa(mesaId: number): Observable<GenericResponseBean<boolean>>{
    const params = new HttpParams()
      .append('mesaId', mesaId);
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor+Constantes.CB_VERIFICATION_CONTROLLER_RECHAZAR_MIEMBROS_MESA,
      {}, {
        params: params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  consultaPadron(dni: string, mesa:string, omitirMesa?: boolean): Observable<GenericResponseBean<PadronBean>>{
    const params = new HttpParams()
      .append('dni', dni)
      .append('mesa', mesa)
      .append('omitirMesa', omitirMesa);

    return this.httpClient.post<GenericResponseBean<PadronBean>>(
      this.urlServidor+Constantes.CB_VERIFICATION_CONTROLLER_CONSULTA_PADRON,
      {}, {
        params: params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }
}
