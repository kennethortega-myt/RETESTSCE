import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {FiltroAvanceEstadoActaBean} from "../model/filtroAvanceEstadoActaBean";
import {GenericResponseBean} from "../model/genericResponseBean";
import {Constantes} from "../helper/constantes";
import {AvanceEstadoActaReporteBean} from "../model/avanceEstadoActaReporteBean";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class ReporteAvanceEstadoActasApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService,) {
    this.urlServidor = environment.apiUrlORC;
  }

  getReporteAvanceEstadoActa(filtroAvanceEstadoActaBean: FiltroAvanceEstadoActaBean):
    Observable<GenericResponseBean<AvanceEstadoActaReporteBean>>{
    return this.httpClient.post<GenericResponseBean<AvanceEstadoActaReporteBean>>(
      this.urlServidor + Constantes.CB_AVANCE_ESTADO_ACTA_CONTROLLER_POST_REPORTE,filtroAvanceEstadoActaBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getReporteAvanceEstadoActaBase64(filtroAvanceEstadoActaBean: FiltroAvanceEstadoActaBean):
    Observable<GenericResponseBean<string>>{
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor + Constantes.CB_AVANCE_ESTADO_ACTA_CONTROLLER_POST_BASE64, filtroAvanceEstadoActaBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }
}
