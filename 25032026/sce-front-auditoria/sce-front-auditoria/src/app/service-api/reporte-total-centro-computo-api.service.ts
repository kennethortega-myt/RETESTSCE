import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {Constantes} from "../helper/constantes";
import {AvanceEstadoActaReporteBean} from "../model/avanceEstadoActaReporteBean";
import {FiltroTotalCentroComputoBean} from "../model/FiltroTotalCentroComputoBean";

@Injectable({
  providedIn: 'root'
})
export class ReporteTotalCentroComputoApiService {
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService,) {
    this.urlServidor = environment.apiUrl;
  }

  getReporteTotalCentroComputoPdf(filtroTotalCentroComputoBean: FiltroTotalCentroComputoBean, acronimo:string):Observable<GenericResponseBean<string>>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    const opciones = { headers: headers };
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor +"/"+ Constantes.CB_AVANCE_MESA_CONTROLLER_GET_REPORTE_BASE64,filtroTotalCentroComputoBean,opciones);
  }

  getReporteTotalCentroComputo(filtroTotalCentroComputoBean: FiltroTotalCentroComputoBean, acronimo:string):
    Observable<GenericResponseBean<AvanceEstadoActaReporteBean>>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };
    return this.httpClient.post<GenericResponseBean<AvanceEstadoActaReporteBean>>(
      this.urlServidor +"/"+ Constantes.CB_AVANCE_ESTADO_ACTA_CONTROLLER_POST_REPORTE,filtroTotalCentroComputoBean,opciones);
  }

  getReporteTotalCentroComputoBase64(filtroAvanceEstadoActaBean: FiltroTotalCentroComputoBean, acronimo:string):
    Observable<GenericResponseBean<string>>{
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor +"/"+ "resporte-total-centro-computo/base64", filtroAvanceEstadoActaBean,opciones);
  }
}
