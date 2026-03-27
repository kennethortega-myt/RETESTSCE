import {Injectable} from "@angular/core";
import {VerificacionActaServiceApi} from "../service-api/verificacion-acta-service-api.service";
import {Observable} from "rxjs";
import {VerificationSignSectionResponseBean} from "../model/verificationSignSectionResponseBean";
import {VerificationSummaryResponseBean} from "../model/verificationSummaryResponseBean";
import {VerificationVoteSectionResponseBean} from "../model/verificationVoteSectionResponseBean";
import {VerificationObservationSectionResponseBean} from "../model/verificationObservationSectionResponseBean";
import {VerificationDatetimeSectionResponseBean} from "../model/verificationDatetimeSectionResponseBean";
import {VerificationActaResponseBean} from "../model/verificationActaResponseBean";
import {GenericResponseBean} from "../model/genericResponseBean";

@Injectable({
  providedIn: 'root',
})
export class VerificacionActaService{
  constructor(private readonly verificacionActaServiceApi: VerificacionActaServiceApi) {
  }

  getSign(electionId: string): Observable<VerificationSignSectionResponseBean>{
    return this.verificacionActaServiceApi.getSign(electionId);
  }

  getSumary(electionId: string): Observable<VerificationSummaryResponseBean>{
    return this.verificacionActaServiceApi.getSumary(electionId);
  }

  getVote(electionId: string): Observable<VerificationVoteSectionResponseBean>{
    return this.verificacionActaServiceApi.getVote(electionId);
  }

  getObservation(electionId: string): Observable<VerificationObservationSectionResponseBean>{
    return this.verificacionActaServiceApi.getObservation(electionId);
  }

  getDatetime(electionId: string): Observable<VerificationDatetimeSectionResponseBean>{
    return this.verificacionActaServiceApi.getDatetime(electionId);
  }

  getRandomActa(electionId: string): Observable<GenericResponseBean<VerificationActaResponseBean>>{
    return this.verificacionActaServiceApi.getRandomActa(electionId);
  }

  getRandomActaProcesamientoManual(electionId: string): Observable<GenericResponseBean<VerificationActaResponseBean>>{
    return this.verificacionActaServiceApi.getRandomActaProcesamientoManual(electionId);
  }

  getFileV2(idfile: number): Promise<Blob> {
    return this.verificacionActaServiceApi.getFileV2(idfile);
  }

  getFile(idfile: number): Observable<any> {
    return this.verificacionActaServiceApi.getFile(idfile);
  }

  blobToBase64(blob: Blob): Promise<string> {
    return this.verificacionActaServiceApi.blobToBase64(blob);
  }

  saveActa(acta: VerificationActaResponseBean):Observable<GenericResponseBean<boolean>>{
    return this.verificacionActaServiceApi.saveActa(acta);
  }

  rechazarActa(mesa: string, codigoEleccion: string): Observable<GenericResponseBean<boolean>>{
    return this.verificacionActaServiceApi.rechazarActa(mesa,codigoEleccion);
  }

}
