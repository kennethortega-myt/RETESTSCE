import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { VerificationActaResponseBean } from "../model/verificationActaResponseBean";

@Injectable({
  providedIn: 'root',
})
export class MessageProcesamientoManualService{
  dataActaParaProcesamientoManualBean = new BehaviorSubject<VerificationActaResponseBean>(new VerificationActaResponseBean());
  fechaProceso = new BehaviorSubject<Date | null>(null);

  setDataActaParaProcesamientoManualBean(actaBean:VerificationActaResponseBean){
    this.dataActaParaProcesamientoManualBean.next(actaBean);
  }

  getDataActaParaProcesamientoManualBean():Observable<VerificationActaResponseBean>{
    return this.dataActaParaProcesamientoManualBean.asObservable();
  }

  setFechaProceso(fecha: Date): void {
    this.fechaProceso.next(fecha);
  }

  getFechaProceso(): Observable<Date | null> {
    return this.fechaProceso.asObservable();
  }

}
