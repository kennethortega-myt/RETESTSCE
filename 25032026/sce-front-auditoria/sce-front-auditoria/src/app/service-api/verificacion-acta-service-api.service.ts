import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {lastValueFrom, Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {VerificationSignSectionResponseBean} from "../model/verificationSignSectionResponseBean";
import {Constantes} from "../helper/constantes";
import {VerificationSummaryResponseBean} from "../model/verificationSummaryResponseBean";
import {VerificationVoteSectionResponseBean} from "../model/verificationVoteSectionResponseBean";
import {VerificationObservationSectionResponseBean} from "../model/verificationObservationSectionResponseBean";
import {VerificationDatetimeSectionResponseBean} from "../model/verificationDatetimeSectionResponseBean";
import {map} from "rxjs/operators";
import {VerificationActaResponseBean} from "../model/verificationActaResponseBean";
import {AuthService} from "../service/auth-service.service";

@Injectable({
  providedIn: "root"
})
export class VerificacionActaServiceApi{

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient,public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  getSign(electionId: string): Observable<VerificationSignSectionResponseBean>{
    return this.httpClient.get<VerificationSignSectionResponseBean>(
      this.urlServidor + Constantes.CB_VERIFICATION_CONTROLLER_GET_RANDOM_SIGN,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getSumary(electionId: string): Observable<VerificationSummaryResponseBean>{
    return this.httpClient.get<VerificationSummaryResponseBean>(
      this.urlServidor + Constantes.CB_VERIFICATION_CONTROLLER_GET_SUMARY,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getVote(electionId: string): Observable<VerificationVoteSectionResponseBean>{
    return this.httpClient.get<VerificationVoteSectionResponseBean>(
      this.urlServidor + Constantes.CB_VERIFICATION_CONTROLLER_GET_VOTE,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getObservation(electionId: string): Observable<VerificationObservationSectionResponseBean>{
    return this.httpClient.get<VerificationObservationSectionResponseBean>(
      this.urlServidor + Constantes.CB_VERIFICATION_CONTROLLER_GET_OBSERVATION,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getDatetime(electionId: string): Observable<VerificationDatetimeSectionResponseBean>{
    return this.httpClient.get<VerificationDatetimeSectionResponseBean>(
      this.urlServidor + Constantes.CB_VERIFICATION_CONTROLLER_GET_DATETIME,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getRandomActa(electionId: string): Observable<GenericResponseBean<VerificationActaResponseBean>>{
    let params = new HttpParams().append('codigoEleccion',electionId);
    return this.httpClient.get<GenericResponseBean<VerificationActaResponseBean>>(
      this.urlServidor + Constantes.CB_VERIFICATION_CONTROLLER_GET_RANDOM_ACTA,
      {
        params : params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getRandomActaProcesamientoManual(electionId: string): Observable<GenericResponseBean<VerificationActaResponseBean>>{
    let params = new HttpParams().append('codigoEleccion',electionId);
    return this.httpClient.get<GenericResponseBean<VerificationActaResponseBean>>(
      this.urlServidor + Constantes.CB_VERIFICATION_CONTROLLER_GET_RANDOM_ACTA_MANUAL,
      {
        params : params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getFile(idfile: number): Observable<any> {
    return this.httpClient.get(
      this.urlServidor +Constantes.CB_DIGITIZATION_CONTROLLER_FILE+idfile,
      {
        responseType:"blob",
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      })
      .pipe(
        map(res => this.validarDescargaBlob(res)),
      );
  }

  getFileV2(idfile: number): Promise<Blob> {
    return lastValueFrom(this.httpClient.get(
      this.urlServidor +Constantes.CB_DIGITIZATION_CONTROLLER_FILE+idfile,
      {
        responseType:"blob",
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }));
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  saveActa(acta:VerificationActaResponseBean): Observable<GenericResponseBean<boolean>>{
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor+Constantes.CB_VERIFICATION_CONTROLLER_POST_SAVE_ACTA,
      acta, {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  rechazarActa(mesa: string, codigoEleccion: string): Observable<GenericResponseBean<boolean>>{
    const params = new HttpParams()
      .append('mesa', mesa)
      .append('codigoEleccion',codigoEleccion);
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor+Constantes.CB_ACTAS_CONTROLLER_POST_RECHAZAR_ACTA,{},
      {
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  validarDescargaBlob(data: any) {
    if (data.type === "image/png" && data.size > 0) {
      return new Blob([data], { type: "image/png" });
    }else if (data.type === "image/jpeg" && data.size > 0) {
      return new Blob([data], { type: "image/jpeg" });
    }  else {
      return null;
    }
  }

}
