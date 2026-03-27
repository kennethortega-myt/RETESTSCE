import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {ActaReprocesadaListBean} from "../model/actaReprocesadaListBean";
import {Constantes} from "../helper/constantes";
import {AuthService} from "../service/auth-service.service";
import { AutorizacionReprocesamientoBean } from "../model/autorizacionReprocesamientoBean";

@Injectable({
  providedIn: 'root'
})
export class ReprocesarActaApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,
              public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  getActaReprocesar(acta: string): Observable<GenericResponseBean<ActaReprocesadaListBean>>{
    return this.httpClient.get<GenericResponseBean<ActaReprocesadaListBean>>(
      this.urlServidor+ Constantes.CB_ACTA_CONTROLLER_ACTAS_GET_REPROCESAR_ACTA+acta,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  reprocesarActas(listActas: Array<ActaReprocesadaListBean>): Observable<GenericResponseBean<boolean>>{
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor +Constantes.CB_ACTA_CONTROLLER_ACTAS_POST_REPROCESAR_LIST_ACTA,
      listActas,
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      }
    );
  }
  listReprocesarActs(): Observable<GenericResponseBean<Array<ActaReprocesadaListBean>>>{
    return this.httpClient.get<GenericResponseBean<Array<ActaReprocesadaListBean>>>(
      this.urlServidor+ Constantes.CB_ACTA_CONTROLLER_ACTAS_GET_LIST_REPROCESAR,
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      });
  }


  updateReprocesar(listActas: Array<ActaReprocesadaListBean>): Observable<GenericResponseBean<boolean>>{
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor +Constantes.CB_ACTA_CONTROLLER_ACTAS_POST_UPDATE_REPROCESAR,
      listActas,
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      }
    );
  }

  autorizacion(): Observable<GenericResponseBean<AutorizacionReprocesamientoBean>>{
    return this.httpClient.post<GenericResponseBean<AutorizacionReprocesamientoBean>>(
      this.urlServidor + Constantes.CB_ACTA_CONTROLLER_ACTAS_GET_REPROCESAR_ACTA + 'autorizacion/consulta',
      {},
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
    });
  }

  solicitarAccesoReprocesar(): Observable<GenericResponseBean<boolean>>{
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor + Constantes.CB_ACTA_CONTROLLER_ACTAS_GET_REPROCESAR_ACTA + 'autorizacion/solicitar',
      {},
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
    });
  }
}
