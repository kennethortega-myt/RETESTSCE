import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { VerificationActaResponseBean } from "../model/verificationActaResponseBean";

@Injectable({
  providedIn: 'root',
})
export class MessageProcesamientoManualService{
  dataActaParaProcesamientoManualBean = new BehaviorSubject<VerificationActaResponseBean>(new VerificationActaResponseBean());

  setDataActaParaProcesamientoManualBean(actaBean:VerificationActaResponseBean){
    this.dataActaParaProcesamientoManualBean.next(actaBean);
  }

  getDataActaParaProcesamientoManualBean():Observable<VerificationActaResponseBean>{
    return this.dataActaParaProcesamientoManualBean.asObservable();
  }

}
