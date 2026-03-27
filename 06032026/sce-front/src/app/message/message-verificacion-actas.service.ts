import {Injectable, signal} from "@angular/core";
import {VerificationSignSectionResponseBean} from "../model/verificationSignSectionResponseBean";
import {BehaviorSubject, Observable} from "rxjs";
import {VerificationDatetimeSectionResponseBean} from "../model/verificationDatetimeSectionResponseBean";
import {VerificationVoteSectionResponseBean} from "../model/verificationVoteSectionResponseBean";

export enum FocusElementVeri {
  TOGGLE = 'toggle',
  RECHAZAR = 'rechazar',
  OBSERVACIONES = 'observaciones',
  CONTINUAR = 'continuar',
  CANTIDAD_CIUDADANOS = 'cantidad_ciudadanos',
  FECHA_INSTALACION = 'fecha_instalacion',
  HORA_INSTALACION = 'hora_instalacion',
  FECHA_ESCRUTINIO = 'fecha_escrutinio',
  HORA_ESCRUTINIO = 'hora_escrutinio',
  INPUT_VOTO = 'input_voto',
  SIN_DATOS = 'sin_datos',
  SOLI_NULIDAD = 'soli_nulidad',
  ANTERIOR = 'anterior',
  INPUT_VOTO_FIRST = 'input_voto_first',
  INPUT_VOTO_LAST = 'input_voto_last',
  NINGUNO = 'ninguno'
}

@Injectable({
  providedIn: 'root',
})
export class MessageVerificacionActasService{

  signSection = new BehaviorSubject<VerificationSignSectionResponseBean>(new VerificationSignSectionResponseBean());
  paso1VerificacionBean = new BehaviorSubject<VerificationSignSectionResponseBean>(new VerificationSignSectionResponseBean)
  paso2DataVerificacionBean = new BehaviorSubject<{voteSection : VerificationVoteSectionResponseBean, tipoSoluTecnologica: string, descripcionTipoEleccion: string}>({voteSection : new VerificationVoteSectionResponseBean(), tipoSoluTecnologica: '', descripcionTipoEleccion: ''})
  paso3DataVerificacinBean = new BehaviorSubject<VerificationDatetimeSectionResponseBean>(new VerificationDatetimeSectionResponseBean);
  private fechaProcesoSubject = new BehaviorSubject<Date | null>(null);
  private readonly noData = new BehaviorSubject<boolean>(false);

  readonly verObservaciones = signal<boolean>(false);
  readonly sinDatos = signal<boolean>(false);
  readonly elementToFocus = signal<FocusElementVeri | null>(null);
  readonly inputIdToFocus = signal<string | null>(null);

  constructor() {
  }

  setSignSection(verificationSignSectionResponseBean: VerificationSignSectionResponseBean){
    this.signSection.next(verificationSignSectionResponseBean);
  }

  getSignSection():Observable<VerificationSignSectionResponseBean>{
    return this.signSection.asObservable();
  }

  setPaso1VerificacionBean(dataPaso1: VerificationSignSectionResponseBean){
    this.paso1VerificacionBean.next(dataPaso1)
  }

  getPaso1VerificacionBean(): Observable<VerificationSignSectionResponseBean>{
    return this.paso1VerificacionBean.asObservable();
  }

  setPaso2DataVerificacionBean(dataPaso2: VerificationVoteSectionResponseBean, soluTecnologica: string, descripcionTipoEleccion: string){
    this.paso2DataVerificacionBean.next({voteSection: dataPaso2, tipoSoluTecnologica: soluTecnologica, descripcionTipoEleccion: descripcionTipoEleccion});
  }

  getPaso2DataVerificacionBean():Observable<{voteSection: VerificationVoteSectionResponseBean, tipoSoluTecnologica: string, descripcionTipoEleccion: string}>{
    return this.paso2DataVerificacionBean.asObservable();
  }

  setPaso3DataVerificacinBean(dataPaso3: VerificationDatetimeSectionResponseBean){
    this.paso3DataVerificacinBean.next(dataPaso3);
  }

  getPaso3DataVerificacinBean(): Observable<VerificationDatetimeSectionResponseBean>{
    return this.paso3DataVerificacinBean.asObservable();
  }

  setNoData(value: boolean){
    this.noData.next(value);
  }

  getNoData():Observable<boolean>{
    return this.noData.asObservable();
  }

  setFocus(element: FocusElementVeri): void {
    this.elementToFocus.set(element);
  }

  setSinDatos(value: boolean): void {
    this.sinDatos.set(value);
  }

  setVerObservaciones(value: boolean): void {
    this.verObservaciones.set(value);
  }

  setFechaProceso(fecha: Date): void {
    this.fechaProcesoSubject.next(fecha);
  }

  getFechaProceso(): Observable<Date | null> {
    return this.fechaProcesoSubject.asObservable();
  }

  setInputIdToFocus(inputId: string | null): void {
    this.inputIdToFocus.set(inputId);
  }

}
