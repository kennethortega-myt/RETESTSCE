import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable, Subject} from "rxjs";
import {ReporteMonitoreoActasBean} from "../model/reporteMonitoreoActasBean";
import {Constantes} from "../helper/constantes";

@Injectable({
  providedIn: 'root',
})
export class ReporteMonitoreoActaApi{
  private readonly urlServidor: string;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private readonly httpClient: HttpClient, public auth: AuthService,) {
    this.urlServidor = environment.apiUrlORC;
  }

  getReporteMonitoreoActa(numeroMesa: string): Observable<ReporteMonitoreoActasBean>{
    return this.httpClient.post<ReporteMonitoreoActasBean>(
      this.urlServidor + Constantes.CB_REPORTES_CONTROLLER_GET_REPORTE_MONITOREO_ACTAS,{"mesa":numeroMesa},
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });

  }
}
