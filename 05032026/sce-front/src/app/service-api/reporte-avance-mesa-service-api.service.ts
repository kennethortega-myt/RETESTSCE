import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {Constantes} from "../helper/constantes";
import {FiltroAvanceMesaBean} from "../model/filtroAvanceMesaBean";

@Injectable({
  providedIn: 'root',
})
export class ReporteAvanceMesaServiceApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService,) {
    this.urlServidor = environment.apiUrlORC;
  }

  getReporteAvanceMesaPdf(filtroAvanceMesaBean: FiltroAvanceMesaBean):Observable<GenericResponseBean<string>>{
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor + Constantes.CB_AVANCE_MESA_CONTROLLER_GET_REPORTE_BASE64,filtroAvanceMesaBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }
}
