import {Injectable} from "@angular/core";
import { Observable} from "rxjs";

import {ControlDigitalizacionServiceApi} from "../service-api/control-digitalizacion-service-api.service";
import {GenericResponseBean} from "../model/genericResponseBean";
import {DigitizationListActasItemBean} from "../model/digitizationListActasItemBean";
import {DigitizationSummaryResponseBean} from "../model/digitizationSummaryResponseBean";
import {DigitizationApproveMesaRequestBean} from "../model/digitizationApproveMesaRequestBean";
import {DigitizationRejectMesaRequestBean} from "../model/digitizationRejectMesaRequestBean";
import {DigitizationGetFilesResponse} from "../model/digitizationGetFilesResponse";

@Injectable({
  providedIn: 'root',
})
export class ControlDigitalizacionService{
  constructor(private readonly controlDigitalizacionServiceApi:ControlDigitalizacionServiceApi) {}

  obtenerActas(codigoEleccion: string): Observable<Array<DigitizationListActasItemBean>>{
    return this.controlDigitalizacionServiceApi.obtenerActas(codigoEleccion);
  }

  obtenerActasCeleste(codigoEleccion: string): Observable<Array<DigitizationListActasItemBean>>{
    return this.controlDigitalizacionServiceApi.obtenerActasCeleste(codigoEleccion);
  }

  obtenerResumen(idEleccion: string): Observable<DigitizationSummaryResponseBean>{
    return this.controlDigitalizacionServiceApi.obtenerResumen(idEleccion);
  }

  obtenerResumenACeleste(idEleccion: string): Observable<DigitizationSummaryResponseBean>{
    return this.controlDigitalizacionServiceApi.obtenerResumenACeleste(idEleccion);
  }

  getFile(idfile: string): Observable<any> {
    return this.controlDigitalizacionServiceApi.getFile(idfile);
  }


  getFilesPng(idfile1: number, idfile2: number, esquemaNacion: boolean = false, acronimo: string = null): Observable<GenericResponseBean<DigitizationGetFilesResponse>> {
    return this.controlDigitalizacionServiceApi.getFilesPng(idfile1,idfile2,esquemaNacion, acronimo);
  }

  validarBloqueoActa(acta: DigitizationListActasItemBean): Observable<GenericResponseBean<DigitizationListActasItemBean>> {
    return this.controlDigitalizacionServiceApi.validarBloqueoActa(acta);
  }

  liberarActa(actaId: string): Observable<GenericResponseBean<string>> {
    return this.controlDigitalizacionServiceApi.liberarActa(actaId);
  }

  aprobarMesa(electionId: string,
              digitizationApproveMesaRequestBean :DigitizationApproveMesaRequestBean):Observable<GenericResponseBean<boolean>>{
    return this.controlDigitalizacionServiceApi.aprobarMesa(electionId,digitizationApproveMesaRequestBean);
  }

  aprobarMesaCeleste(electionId: string,
              digitizationApproveMesaRequestBean :DigitizationApproveMesaRequestBean):Observable<GenericResponseBean<boolean>>{
    return this.controlDigitalizacionServiceApi.aprobarMesaCeleste(electionId,digitizationApproveMesaRequestBean);
  }

  finalizarAtencion(codigoEleccion: string): Observable<GenericResponseBean<string>> {
    return this.controlDigitalizacionServiceApi.finalizarAtencion(codigoEleccion);
  }

  rechazarMesa(codigoEleccion: string,
              digitizationRejectMesaRequestBean :DigitizationRejectMesaRequestBean):Observable<boolean>{
    return this.controlDigitalizacionServiceApi.rechazarMesa(codigoEleccion,digitizationRejectMesaRequestBean);
  }

  rechazarMesaCeleste(codigoEleccion: string,
              digitizationRejectMesaRequestBean :DigitizationRejectMesaRequestBean):Observable<boolean>{
    return this.controlDigitalizacionServiceApi.rechazarMesaCeleste(codigoEleccion,digitizationRejectMesaRequestBean);
  }
}
