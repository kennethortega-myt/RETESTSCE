import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {DigitizationListMesasBean} from "../model/digitizationListMesasBean";
import {Constantes} from "../helper/constantes";
import {IGenericInterface} from '../interface/general.interface';

@Injectable({
  providedIn: "root"
})
export class ControlListaElectoresServiceApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  listaLE():Observable<Array<DigitizationListMesasBean>>{
    return this.httpClient.get<Array<DigitizationListMesasBean>>(
      this.urlServidor + Constantes.CB_MESA_CONTROLLER_GET_LIST_LE,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  aprobarlistaElectores(mesaId: number, tipoDoc: string):Observable<IGenericInterface<boolean>>{
    const params = new HttpParams()
      .set('mesaId', mesaId)
      .set('tipoDoc',tipoDoc);

    return this.httpClient.post<IGenericInterface<boolean>>(
      this.urlServidor + Constantes.CB_MESA_CONTROLLER_APPROVE_LE,{},{
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  rechazarlistaElectores(mesaId: number, tipoDoc: string):Observable<IGenericInterface<boolean>>{
    const params = new HttpParams()
      .set('mesaId', mesaId)
      .set('tipoDoc',tipoDoc);

    return this.httpClient.post<IGenericInterface<boolean>>(
      this.urlServidor + Constantes.CB_MESA_CONTROLLER_REJECT_LE,{},{
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }
}
