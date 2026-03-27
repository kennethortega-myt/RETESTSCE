import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { GenericResponseBean } from "../model/genericResponseBean";
import { ProcesoElectoralResponseBean } from "../model/procesoElectoralResponseBean";
import { EleccionResponseBean } from "../model/eleccionResponseBean";
import {ResolucionServiceApiService} from "../service-api/resolucion-service-api.service";
import {ActaBean, ActaJeeBean} from "../model/resoluciones/acta-jee-bean";
import {IGenericInterface} from "../interface/general.interface";
import {
  DigitizationListResolucionItem,
  ResolucionAsociadosRequest,
  ResumenResoluciones
} from "../model/resoluciones/resolucion-bean";
import {ReimpresionCargoBean} from "../model/reimpresionCargoBean";
import {TabResolucionBean} from '../model/resoluciones/tabResolucionBean';
import { ActasPorCorregirListBean } from "../model/actasPorCorregirListBean";
import { DigitizationGetFilesResponse } from "../model/digitizationGetFilesResponse";

@Injectable({
  providedIn: 'root',
})
export class ResolucionService{

  constructor(private readonly resolucionServiceApiService:ResolucionServiceApiService) {}

  obtenerProcesos(): Observable<GenericResponseBean<ProcesoElectoralResponseBean>>{
    return this.resolucionServiceApiService.obtenerProcesos();
  }

  resumenResoluciones(numeroResolucion:string): Observable<IGenericInterface<ResumenResoluciones>>{
    return this.resolucionServiceApiService.resumenResoluciones(numeroResolucion);
  }

  listnResolucionesDigtal(): Observable<Array<DigitizationListResolucionItem>>{
    return this.resolucionServiceApiService.listnResolucionesDigtal();
  }

  getRandomResolucion(){
    return this.resolucionServiceApiService.getRandomResolucion();
  }

  getResolucion(id:number): Observable<IGenericInterface<ResolucionAsociadosRequest>>{
    return this.resolucionServiceApiService.getResolucion(id);
  }

  actualizarEstadoDigitalizacion(idResolucion:number, estadoDigitalizacion:string): Observable<IGenericInterface<any>>{
    return this.resolucionServiceApiService.actualizarEstadoDigitalizacion(idResolucion, estadoDigitalizacion);
  }

  obtenerElecciones(idProceso: string): Observable<GenericResponseBean<EleccionResponseBean>>{
    return this.resolucionServiceApiService.obtenerElecciones(idProceso);
  }

  obtenerActasEnvioJee(idEleccion:number): Observable<IGenericInterface<ActaJeeBean>>{
    return this.resolucionServiceApiService.obtenerActasEnvioJee(idEleccion);
  }

  obtenerListProcesamientoManual(): Observable<Array<ActasPorCorregirListBean>>{
    return this.resolucionServiceApiService.obtenerListProcesamientoManual();
  }

  obtenerInfoActaParaProcesamientoManual(idActa: number): Observable<GenericResponseBean<ActaBean>>{
    return this.resolucionServiceApiService.obtenerInfoActaParaProcesamientoManual(idActa);
  }

  registrarProcesamientoManual(acta: ActaBean): Observable<IGenericInterface<boolean>> {
    return this.resolucionServiceApiService.registrarProcesamientoManual(acta);
  }

  obtenerActaEnvioJee(nroActa: string, nroCopiaAndDigCheq:string): Observable<IGenericInterface<ActaBean>>{
    return this.resolucionServiceApiService.obtenerActaEnvioJee(nroActa, nroCopiaAndDigCheq);
  }

  validarActaDevueltaJEE(nroActa: string, nroCopiaAndDig:string): Observable<IGenericInterface<ActaBean>> {
    return this.resolucionServiceApiService.validarActaDevueltaJEE(nroActa,nroCopiaAndDig);
  }

  getInfoActa(codTipoResolucion:number, nroActaCopiaDig:string,idProceso:number): Observable<IGenericInterface<any>> {
    return this.resolucionServiceApiService.getInfoActa(codTipoResolucion, nroActaCopiaDig,idProceso);
  }

  getReimpresionCargos(mesa:string): Observable<GenericResponseBean<Array<ReimpresionCargoBean>>> {
    return this.resolucionServiceApiService.getReimpresionCargos(mesa);
  }

  getInfoById(idActa:number): Observable<IGenericInterface<ActaBean>> {
    return this.resolucionServiceApiService.getInfoActaById(idActa);
  }

  anularResolucion(idResolucion:number): Observable<GenericResponseBean<TabResolucionBean>> {
    return this.resolucionServiceApiService.anularResolucion(idResolucion);
  }

  getInfoActaParaAsociacion(codTipoResolucion:number, nroActaCopiaDig:string,idUbigeo:number, idLocalVotacion:number, idEleccion:number, idProceso:number): Observable<IGenericInterface<ActaBean[]>> {
    return this.resolucionServiceApiService.getInfoActaParaAsociacion(codTipoResolucion, nroActaCopiaDig,idUbigeo,idLocalVotacion,idEleccion,idProceso);
  }

  registrarAsociacionConActas(resolucionAsociadosRequest :ResolucionAsociadosRequest){
    return this.resolucionServiceApiService.registrarAsociacionConActas(resolucionAsociadosRequest);
  }

  aplicarResolucionActa(actaBean :ActaBean){
    return this.resolucionServiceApiService.aplicarResolucionActa(actaBean);
  }


  getFile(idfile: number): Observable<any> {
    return this.resolucionServiceApiService.getFile(idfile);
  }

  getFileV3(idfile: number): Observable<any> {
    return this.resolucionServiceApiService.getFilev3(idfile);
  }

  getFile2(idfile: string): Observable<IGenericInterface<any>> {
    return this.resolucionServiceApiService.getFile2(idfile);
  }


  generarCargoEntregaV2(actasBean :ActaBean[]) {
    return this.resolucionServiceApiService.generarCargoEntregaV2(actasBean);
  }

  generarCargoEntregaOficio(actasBean :ActaBean) {
    return this.resolucionServiceApiService.generarCargoEntregaOficio(actasBean);
  }

  generarCargoEntregaActaDevuelta(actasBean :ActaBean[]): Observable<IGenericInterface<any>>{
    return this.resolucionServiceApiService.generarCargoEntregaActaDevuelta(actasBean);
  }

  generarCargoEntregaMesaNoInstaladaExtSin(resolucionAsociadosRequest :ResolucionAsociadosRequest): Observable<IGenericInterface<any>>{
    return this.resolucionServiceApiService.generarCargoEntregaMesaNoInstaladaExtSin(resolucionAsociadosRequest);
  }

  generarCargoEntregaInfundada(resolucionAsociadosRequest :ResolucionAsociadosRequest): Observable<IGenericInterface<any>>{
    return this.resolucionServiceApiService.generarCargoEntregaInfundada(resolucionAsociadosRequest);
  }

  generarResolucionPopup(idFile:number): Observable<IGenericInterface<any>> {
    return this.resolucionServiceApiService.getFilePdfPoppu(idFile);
  }

  getFilePdfPoppuConvStae(idArchivo: number, actaId: number): Observable<IGenericInterface<any>> {
    return this.resolucionServiceApiService.getFilePdfPoppuConvStae(idArchivo, actaId);
  }

  getArchivos(idfile: number): Observable<Array<number>> {
    return this.resolucionServiceApiService.getArchivos(idfile);
  }

  getResolucionesDevueltas(page: number, size: number){
    return this.resolucionServiceApiService.listarResolucionesDevueltas(page, size);
  }

  getArchivosSobre(actaId: ActaBean, tipoSobre: string) : Observable<GenericResponseBean<DigitizationGetFilesResponse>>{
    return this.resolucionServiceApiService.getArchivosSobre(actaId, tipoSobre);
  }

  generarOficio(actasBean :ActaBean[]) {
    return this.resolucionServiceApiService.generarOficio(actasBean);
  }

  transmitirOficio(actasBean :ActaBean) {
    return this.resolucionServiceApiService.transmitirOficio(actasBean);
  }

  verificarDocumentoEnvioJEE(actasBean :ActaBean, tipoDocumento: string){
    return this.resolucionServiceApiService.verificarDocumentoEnvioJEE(actasBean, tipoDocumento);
  }

  getSeguimientoJEE(){
     return this.resolucionServiceApiService.seguimientoJEE();
  }

  bloquearResolucion(idResolucion: number): Observable<IGenericInterface<boolean>> {
    return this.resolucionServiceApiService.bloquearResolucion(idResolucion);
  }

  desbloquearResolucion(idResolucion: number): Observable<IGenericInterface<boolean>> {
    return this.resolucionServiceApiService.desbloquearResolucion(idResolucion);
  }

}
