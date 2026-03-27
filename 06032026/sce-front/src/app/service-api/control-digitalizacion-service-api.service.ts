import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import { Observable, throwError} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {Constantes} from "../helper/constantes";
import {DigitizationListActasItemBean} from "../model/digitizationListActasItemBean";
import {DigitizationSummaryResponseBean} from "../model/digitizationSummaryResponseBean";
import {catchError, map} from "rxjs/operators";
import {DigitizationApproveMesaRequestBean} from "../model/digitizationApproveMesaRequestBean";
import {DigitizationRejectMesaRequestBean} from "../model/digitizationRejectMesaRequestBean";
import {DigitizationGetFilesResponse} from "../model/digitizationGetFilesResponse";
import {AuthService} from "../service/auth-service.service";

@Injectable({
  providedIn: 'root',
})
export class ControlDigitalizacionServiceApi {
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  obtenerActas(codigoEleccion: string): Observable<Array<DigitizationListActasItemBean>>{
    return this.httpClient.get<Array<DigitizationListActasItemBean>>(
      this.urlServidor +Constantes.CB_DIGITIZATION_CONTROLLER_LIST_ACTAS+"?codigoEleccion="+codigoEleccion,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  obtenerActasCeleste(codigoEleccion: string): Observable<Array<DigitizationListActasItemBean>>{
    return this.httpClient.get<Array<DigitizationListActasItemBean>>(
      this.urlServidor +Constantes.CB_DIGITIZATION_CONTROLLER_LIST_ACTAS_CELESTE+"?codigoEleccion="+codigoEleccion,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  obtenerResumen(codigoEleccion: string): Observable<DigitizationSummaryResponseBean>{
    return this.httpClient.get<DigitizationSummaryResponseBean>(
      this.urlServidor +Constantes.CB_DIGITIZATION_CONTROLLER_SUMMARY+"?codigoEleccion="+codigoEleccion,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  obtenerResumenACeleste(codigoEleccion: string): Observable<DigitizationSummaryResponseBean>{
    return this.httpClient.get<DigitizationSummaryResponseBean>(
      this.urlServidor +Constantes.CB_DIGITIZATION_CONTROLLER_SUMMARY_CELESTE+"?codigoEleccion="+codigoEleccion,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getFile(idfile: string): Observable<any> {
    return this.httpClient.get(
      this.urlServidor +Constantes.CB_DIGITIZATION_CONTROLLER_FILE+idfile,{
        responseType:"blob",
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      })
      .pipe(
        map(res =>this.validarDescargaBlobPDF(res)),
        catchError(err => {
          return throwError(() => err);
        }),
      );
  }

  getFilesPng(idfile1: number, idfile2: number, esquemaNacion:boolean, acronimo:string): Observable<GenericResponseBean<DigitizationGetFilesResponse>> {
    if (esquemaNacion) {

      const headers = new HttpHeaders({
          'X-Tenant-Id': acronimo
      });

      // Agrega los encabezados a las opciones de la solicitud
      const opciones = { headers: headers };

      return this.httpClient.post<GenericResponseBean<DigitizationGetFilesResponse>>(
        environment.apiUrl + '/' +Constantes.CB_MONITOREO_NACION_FILES_PNG+"?acta1FileId="+idfile1+"&acta2FileId="+idfile2,
        {},
        opciones
      );
    }
    return this.httpClient.post<GenericResponseBean<DigitizationGetFilesResponse>>(
      this.urlServidor +Constantes.CB_ARCHIVO_CONTROLLER_FILES_PNG+"?acta1FileId="+idfile1+"&acta2FileId="+idfile2,
      {},
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );

  }

  validarBloqueoActa(acta: DigitizationListActasItemBean): Observable<GenericResponseBean<DigitizationListActasItemBean>> {
    return this.httpClient.post<GenericResponseBean<DigitizationListActasItemBean>>(
      this.urlServidor +Constantes.CB_DIGITIZATION_CONTROLLER_VALIDAR_BLOQUEO_ACTA,
      acta,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  liberarActa(actaId: string): Observable<GenericResponseBean<string>> {
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor +Constantes.CB_DIGITIZATION_CONTROLLER_LIBERAR_ACTA+"?actaId="+actaId,
      {},
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  aprobarMesa(electionId: string,
              digitizationApproveMesaRequestBean :DigitizationApproveMesaRequestBean):Observable<GenericResponseBean<any>>{
    return this.httpClient.post<GenericResponseBean<any>>(
      this.urlServidor+Constantes.CB_DIGITIZATION_CONTROLLER_APPROVE_MESA+"?electionId="+electionId,
      digitizationApproveMesaRequestBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  aprobarMesaCeleste(electionId: string,
              digitizationApproveMesaRequestBean :DigitizationApproveMesaRequestBean):Observable<GenericResponseBean<any>>{
    return this.httpClient.post<GenericResponseBean<any>>(
      this.urlServidor+Constantes.CB_DIGITIZATION_CONTROLLER_APPROVE_MESA_CELESTE+"?electionId="+electionId,
      digitizationApproveMesaRequestBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  finalizarAtencion(codigoEleccion: string): Observable<GenericResponseBean<string>> {
    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor +Constantes.CB_DIGITIZATION_CONTROLLER_FINALIZAR_ATENCION+"?codigoEleccion="+codigoEleccion,
      {},
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  rechazarMesa(codigoEleccion: string,
             digitizationRejectMesaRequestBean :DigitizationRejectMesaRequestBean):Observable<boolean>{
    return this.httpClient.post<boolean>(
      this.urlServidor+Constantes.CB_DIGITIZATION_CONTROLLER_REJECT_MESA+"?codigoEleccion="+codigoEleccion,
      digitizationRejectMesaRequestBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  rechazarMesaCeleste(codigoEleccion: string,
             digitizationRejectMesaRequestBean :DigitizationRejectMesaRequestBean):Observable<boolean>{
    return this.httpClient.post<boolean>(
      this.urlServidor+Constantes.CB_DIGITIZATION_CONTROLLER_REJECT_MESA_CELESTE+"?codigoEleccion="+codigoEleccion,
      digitizationRejectMesaRequestBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  validarDescargaBlobPDF(data: any) {
    if (data.type === "application/pdf" && data.size > 0) {
      return new Blob([data], { type: "application/pdf" });
    } else {
      return null;
    }
  }

}
