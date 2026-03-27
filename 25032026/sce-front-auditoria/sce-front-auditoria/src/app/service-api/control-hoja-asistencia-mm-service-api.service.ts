import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {Constantes} from "../helper/constantes";
import {DigitizationListMesasBean} from "../model/digitizationListMesasBean";

@Injectable({
  providedIn: "root"
})
export class ControlHojaAsistenciaMMServiceApi {
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  listaMiembrosMesa():Observable<Array<DigitizationListMesasBean>>{
    return this.httpClient.get<Array<DigitizationListMesasBean>>(
      this.urlServidor + Constantes.CB_MESA_CONTROLLER_GET_LIST_MM,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  aprobarlistaMM(mesaId: number, tipoDoc: string):Observable<boolean>{
    const params = new HttpParams()
      .set('mesaId', mesaId)
      .set('tipoDoc',tipoDoc);

    return this.httpClient.post<boolean>(
      this.urlServidor + Constantes.CB_MESA_CONTROLLER_APPROVE_LIST_MM,{},{
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  rechazarlistaMM(mesaId: number, tipoDoc: string):Observable<boolean>{
    const params = new HttpParams()
      .set('mesaId', mesaId)
      .set('tipoDoc',tipoDoc);

    return this.httpClient.post<boolean>(
      this.urlServidor + Constantes.CB_MESA_CONTROLLER_REJECT_LIST_MM,{},{
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }


}
