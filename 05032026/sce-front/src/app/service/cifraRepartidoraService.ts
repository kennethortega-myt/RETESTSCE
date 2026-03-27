import { Injectable } from "@angular/core";
import { CifraRepartidoraApi } from "../service-api/cifra-repartidora-api.service";
import { ConsolidarVotosAgrupacionRequestBean } from "../model/consolidarVotosAgrupacionRequestBean";
import { ReparteCurulesRequestBean } from "../model/reparteCurulesRequestBean";
import { ConsultaCifraRepartidoraRequestBean } from "../model/consultaCifraRepartidoraRequestBean";
import { Observable } from "rxjs";
import { GenericResponseBean } from "../model/genericResponseBean";
import { DistritoElectoralResponseBean } from "../model/distritoElectoralResponseBean";
import { ConsultaCifraRepartidoraResponseBean } from "../model/consultaCifraRepartidoraResponseBean";
import { DistritoElectoralEmpateBean } from "../model/distritoElectoralEmpateBean";
import { ActualizarResolucionRequestBean } from "../model/actualizarResolucionRequestBean";
import { ActualizarResolucionResponseBean } from "../model/actualizarResolucionResponseBean";

@Injectable({
  providedIn: 'root',
})
export class CifraRepartidoraService {
  constructor(private readonly cifraRepartidoraApi: CifraRepartidoraApi) {}

  public obtenerListdistritoElectoral(
    acronimo: string,
    codEleccion: string
  ): Observable<GenericResponseBean<Array<DistritoElectoralResponseBean>>> {

    return this.cifraRepartidoraApi.obtenerListdistritoElectoral(
      acronimo,
      codEleccion
    );
  }

  public obtenerConsultaCR(
    acronimo: string,
    request: ConsultaCifraRepartidoraRequestBean
  ): Observable<GenericResponseBean<ConsultaCifraRepartidoraResponseBean>> {
    return this.cifraRepartidoraApi.obtenerConsultaCR(acronimo,request);
  }

  public consolidarCR(acronimo: string, request: ConsolidarVotosAgrupacionRequestBean) {
    return this.cifraRepartidoraApi.consolidarCR(acronimo,request);
  }

  public reparteCurules(acronimo: string, request: ReparteCurulesRequestBean) {
    return this.cifraRepartidoraApi.reparteCurules(acronimo,request);
  }

  public obtenerReporteCifraRepartidora(acronimo: string,filtros: ConsultaCifraRepartidoraRequestBean): Observable<GenericResponseBean<string>> {
      return this.cifraRepartidoraApi.obtenerReporteCifraRepartidora(acronimo,filtros);
  }

  public obtenerVotosEmpate(acronimo: string,filtros: ConsultaCifraRepartidoraRequestBean): Observable<GenericResponseBean<Array<DistritoElectoralEmpateBean>>> {
    return this.cifraRepartidoraApi.obtenerVotosEmpate(acronimo,filtros);
  }

  public actualizarResolucion(acronimo: string, request: ActualizarResolucionRequestBean): Observable<GenericResponseBean<ActualizarResolucionResponseBean>> {
    return this.cifraRepartidoraApi.actualizarResolucion(acronimo,request);
  }

}
