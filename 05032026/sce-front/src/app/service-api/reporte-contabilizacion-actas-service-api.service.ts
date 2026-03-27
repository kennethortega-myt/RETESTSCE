import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {FiltroContabilizacionActaBean} from "../model/filtroContabilizacionActaBean";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {ActaContabilizadaResumenReporteBean} from "../model/actaContabilizadaResumenReporteBean";
import {Constantes} from "../helper/constantes";

@Injectable({
  providedIn: 'root',
})
export class ReporteContabilizacionActasServiceApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService,) {
    this.urlServidor = environment.apiUrlORC;
  }

  getReporteContabilizacionActa(filtroContabilizacionActaBean:FiltroContabilizacionActaBean):
    Observable<GenericResponseBean<ActaContabilizadaResumenReporteBean>>{
    return this.httpClient.post<GenericResponseBean<ActaContabilizadaResumenReporteBean>>(
      this.urlServidor + Constantes.CB_CONTABILIZACION_VOTOS_CONTROLLER_POST_REPORTE, filtroContabilizacionActaBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getReporteContabilizacionActaBase64(filtroContabilizacionActaBean:FiltroContabilizacionActaBean):
    Observable<GenericResponseBean<string>>{
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor + Constantes.CB_CONTABILIZACION_VOTOS_CONTROLLER_POST_BASE64, filtroContabilizacionActaBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getPorcentajeActaContabilizada(idEleccion:string):Observable<GenericResponseBean<number>>{
    return this.httpClient.get<GenericResponseBean<number>>(
      this.urlServidor + Constantes.CB_CONTABILIZACION_VOTOS_CONTROLLER_PORCENTAJE_AVANCE +idEleccion,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }
}
