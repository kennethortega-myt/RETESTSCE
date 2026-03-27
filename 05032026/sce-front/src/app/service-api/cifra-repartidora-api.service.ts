import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { GlobalService } from "../service/global.service";
import { environment } from "src/environments/environment";
import { DistritoElectoralResponseBean } from "../model/distritoElectoralResponseBean";
import { GenericResponseBean } from "../model/genericResponseBean";
import { ConsolidarVotosAgrupacionRequestBean } from '../model/consolidarVotosAgrupacionRequestBean';
import { AuthService } from "../service/auth-service.service";
import {Constantes} from "../helper/constantes";
import { ReparteCurulesRequestBean } from "../model/reparteCurulesRequestBean";
import { ConsultaCifraRepartidoraRequestBean } from "../model/consultaCifraRepartidoraRequestBean";
import { ConsultaCifraRepartidoraResponseBean } from "../model/consultaCifraRepartidoraResponseBean";
import { Observable } from "rxjs";
import { DistritoElectoralEmpateBean } from "../model/distritoElectoralEmpateBean";
import { ActualizarResolucionRequestBean } from "../model/actualizarResolucionRequestBean";
import { ActualizarResolucionResponseBean } from "../model/actualizarResolucionResponseBean";

@Injectable({
  providedIn: 'root'
})
export class CifraRepartidoraApi {

  private urlServidor: string;

    constructor(
      private readonly httpClient: HttpClient,
      private readonly globalService: GlobalService,
      private readonly auth: AuthService
    )
    {
      this.urlServidor = environment.apiUrl+'/';
    }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl+'/' : environment.apiUrlORC);
  }

  public obtenerListdistritoElectoral(acronimo: string, codEleccion: string) {
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    const opciones = { headers: headers };
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/cifra-repartidora/list-distrito-electoral/${codEleccion}`);
    return this.httpClient.get<GenericResponseBean<Array<DistritoElectoralResponseBean>>>(
      url,
      opciones
    );
  }

  public obtenerConsultaCR(acronimo: string, request: ConsultaCifraRepartidoraRequestBean) {
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    const opciones = { headers: headers };
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_CIFRA_REPARTIDORA_CONTROLLER_CONSULTA_CIFRA_REPARTIDORA}`);
    return this.httpClient.post<GenericResponseBean<ConsultaCifraRepartidoraResponseBean>>(
      url,
      request,
      opciones
    );
  }

  public consolidarCR(acronimo: string,request: ConsolidarVotosAgrupacionRequestBean) {
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    const opciones = { headers: headers };
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_CIFRA_REPARTIDORA_CONTROLLER_CONSOLIDAR}`);
    return this.httpClient.post<GenericResponseBean<any>>(
      url,
      request,
      opciones
    );
  }

  public reparteCurules(acronimo: string, request: ReparteCurulesRequestBean) {
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    const opciones = { headers: headers };
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_CIFRA_REPARTIDORA_CONTROLLER_REPARTE_CURULES}`);
    return this.httpClient.post<GenericResponseBean<any>>(
      url,
      request,
      opciones
    );
  }

  obtenerReporteCifraRepartidora(acronimo: string,filtros: ConsultaCifraRepartidoraRequestBean): Observable<GenericResponseBean<string>> {
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    const opciones = { headers: headers };
      this.asignarUrlBackend();
      const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_REPORTE_CIFRA_REPARTIDORA_BASE64}`);
      return this.httpClient.post<GenericResponseBean<string>>(url, filtros, opciones);
  }

  public obtenerVotosEmpate(acronimo: string,filtros: ConsultaCifraRepartidoraRequestBean): Observable<GenericResponseBean<Array<DistritoElectoralEmpateBean>>> {
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    const opciones = { headers: headers };
      this.asignarUrlBackend();
      const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_CIFRA_REPARTIDORA_CONTROLLER_VOTOS_EMPATE}`);
      return this.httpClient.post<GenericResponseBean<Array<DistritoElectoralEmpateBean>>>(url, filtros, opciones);
  }

  public actualizarResolucion(acronimo: string, request: ActualizarResolucionRequestBean): Observable<GenericResponseBean<ActualizarResolucionResponseBean>> {
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });
    const opciones = { headers: headers };
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_CIFRA_REPARTIDORA_CONTROLLER_ACTUALIZAR_RESOLUCION}`);
    return this.httpClient.post<GenericResponseBean<ActualizarResolucionResponseBean>>(
      url,
      request,
      opciones
    );
  }

}
