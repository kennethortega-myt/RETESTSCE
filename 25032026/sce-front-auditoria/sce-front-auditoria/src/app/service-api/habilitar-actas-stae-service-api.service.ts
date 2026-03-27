import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {ActaBean} from "../model/resoluciones/acta-jee-bean";
import {Constantes} from "../helper/constantes";

@Injectable({
  providedIn: 'root'
})
export class HabilitarActasStaeServiceApi{

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,
              public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  validaHabilitarActasStae(mesa: string): Observable<GenericResponseBean<Array<ActaBean>>>{
    let params = new HttpParams();
    params = params.append('mesa', mesa);
    return this.httpClient.get<GenericResponseBean<Array<ActaBean>>>(
      this.urlServidor + Constantes.CB_MESA_CONTROLLER_VALIDA_HABILITAR_ACTAS_STAE,
      {
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  habilitarActasStae(listMesasStae: Array<ActaBean>): Observable<GenericResponseBean<ActaBean>>{
    return this.httpClient.post<GenericResponseBean<ActaBean>>(
      this.urlServidor + Constantes.CB_MESA_CONTROLLER_HABILITAR_ACTAS_STAE,
      listMesasStae,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    )
  }



}
