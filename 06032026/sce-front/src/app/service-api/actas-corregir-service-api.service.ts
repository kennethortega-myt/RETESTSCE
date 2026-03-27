import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {Constantes} from "../helper/constantes";
import {ActasPorCorregirListBean} from "../model/actasPorCorregirListBean";
import {ActaPorCorregirBean} from "../model/actaPorCorregirBean";

@Injectable({
  providedIn: 'root',
})
export class ActasCorregirServiceApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  obtenerActasPorCorregir(): Observable<Array<ActasPorCorregirListBean>>{
    return this.httpClient.get<Array<ActasPorCorregirListBean>>(
      this.urlServidor +Constantes.CB_ACTA_CONTROLLER_ACTAS_POR_CORREGIR,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  actasPorCorregirInfo(actaId: number): Observable<ActaPorCorregirBean>{
    return this.httpClient.get<ActaPorCorregirBean>(
      this.urlServidor +Constantes.CB_ACTA_CONTROLLER_ACTAS_POR_CORREGIR+'/'+actaId,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  validarActaPorCorregir(actaId: number, actaPorCorregir: ActaPorCorregirBean): Observable<Array<string>>{
    return this.httpClient.post<Array<string>>(
      this.urlServidor +Constantes.CB_ACTA_CONTROLLER_ACTAS_POR_CORREGIR_VALIDAR,
          actaPorCorregir,
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
        }
        );
  }

  registrarActasPorCorregir(actaId: number, actaPorCorregir: ActaPorCorregirBean): Observable<boolean>{
    return this.httpClient.post<boolean>(
      this.urlServidor +Constantes.CB_ACTA_CONTROLLER_ACTAS_POR_CORREGIR_REGISTRAR,
      actaPorCorregir,
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      }
    );
  }
}
