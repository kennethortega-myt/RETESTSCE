import { Injectable } from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GenericResponseBean } from "../model/genericResponseBean";
import { ProcesoElectoralResponseBean } from "../model/procesoElectoralResponseBean";
import { Constantes } from "../helper/constantes";
import { EleccionResponseBean } from "../model/eleccionResponseBean";
import {ActaBean, ActaJeeBean, AplicarActaBean} from "../model/resoluciones/acta-jee-bean";
import {IGenericInterface, SearchFilterResponse} from "../interface/general.interface";
import {AuthService} from "../service/auth-service.service";
import {
  DigitizationListResolucionItem,
  ResolucionAsociadosRequest,
  ResolucionDevueltasRequest,
  ResumenResoluciones
} from "../model/resoluciones/resolucion-bean";
import {ReimpresionCargoBean} from "../model/reimpresionCargoBean";
import {TabResolucionBean} from '../model/resoluciones/tabResolucionBean';
import { ActasPorCorregirListBean } from "../model/actasPorCorregirListBean";
import { DigitizationGetFilesResponse } from "../model/digitizationGetFilesResponse";
import { SeguimientoJeeBean } from "../model/resoluciones/seguimiento-jee-bean";

@Injectable({
  providedIn: 'root',
})
export class ResolucionServiceApiService {

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService,) {
    this.urlServidor = environment.apiUrlORC;
  }

  obtenerProcesos():Observable<GenericResponseBean<ProcesoElectoralResponseBean>>{
    return this.httpClient.get<GenericResponseBean<ProcesoElectoralResponseBean>>(
      this.urlServidor + Constantes.CB_PROCESO_CONTROLLER_LIST_PROCESOS,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  resumenResoluciones(numeroResolucion:string):
    Observable<IGenericInterface<ResumenResoluciones>>{

    const params = new HttpParams()
      .set('numeroResolucion', numeroResolucion);

    return this.httpClient.get<IGenericInterface<ResumenResoluciones>>(
        this.urlServidor + Constantes.CB_RESOLUCIONES_CONTROLLER_RESUMEN,{
          params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  getRandomResolucion():Observable<IGenericInterface<ResolucionAsociadosRequest>>{
    const params = new HttpParams();

    return this.httpClient.get<IGenericInterface<ResolucionAsociadosRequest>>(
      this.urlServidor + Constantes.CB_RESOLUCIONES_CONTROLLER_RANDOM_RESOLUCION,{
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  getResolucion(id:number):Observable<IGenericInterface<ResolucionAsociadosRequest>>{
    const params = new HttpParams()
      .set('id', id);

    return this.httpClient.get<IGenericInterface<ResolucionAsociadosRequest>>(
      this.urlServidor + Constantes.CB_RESOLUCIONES_CONTROLLER,{
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  obtenerElecciones(idProceso: string):Observable<GenericResponseBean<EleccionResponseBean>>{
    return this.httpClient.get<GenericResponseBean<EleccionResponseBean>>(
      this.urlServidor +"proceso/"+idProceso+ Constantes.CB_PROCESO_CONTROLLER_LIST_ELECCIONES,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  obtenerActasEnvioJee(idEleccion:number): Observable<IGenericInterface<ActaJeeBean>> {
    const params = new HttpParams()
      .set('idEleccion', idEleccion);

    return this.httpClient.get<IGenericInterface<ActaJeeBean>>(
      this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_LIST_ACTAS_ENVIO_JURADO,{
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  obtenerActaEnvioJee(nroActa: string, nroCopiaAndDig:string): Observable<IGenericInterface<ActaBean>> {

    const params = new HttpParams()
      .set('nroActa', nroActa)
      .set('nroCopiaAndDig',nroCopiaAndDig);
      //.set('idEleccion',idEleccion)
      //.set("idProceso", idProceso);


    return this.httpClient.get<IGenericInterface<ActaBean>>(
      this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_ACTA_ENVIO_JURADO ,{
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  validarActaDevueltaJEE(nroActa: string, nroCopiaAndDig:string): Observable<IGenericInterface<ActaBean>> {

    const params = new HttpParams()
      .set('nroActa', nroActa)
      .set('nroCopiaAndDig',nroCopiaAndDig)


    return this.httpClient.get<IGenericInterface<ActaBean>>(
      this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_ACTA_DEVUELTA_JURADO ,{
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getInfoActa(codTipoResolucion:number,nroActaCopiaDig: string,idProceso:number): Observable<IGenericInterface<any>> {

    const params = new HttpParams()
      .set('codTipoResolucion', codTipoResolucion)
      .set('nroActaCopiaDig',nroActaCopiaDig)
      //.set('idEleccion',idEleccion)
      .set("idProceso", idProceso);

    return this.httpClient.get<IGenericInterface<any>>(
        this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_INFO_ACTA, {
          params:params,
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
        });
  }

  getReimpresionCargos(mesa:string): Observable<GenericResponseBean<Array<ReimpresionCargoBean>>> {

    return this.httpClient.get<GenericResponseBean<Array<ReimpresionCargoBean>>>(
      this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_REIMPRESION_CARGOS+"/"+mesa, {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getInfoActaById(idActa:number): Observable<IGenericInterface<ActaBean>> {

    const params = new HttpParams()
      .set('idActa', idActa);

    return this.httpClient.get<IGenericInterface<any>>(
      this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_INFO_ACTA_BY_ID, {
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  anularResolucion(idResolucion:number): Observable<GenericResponseBean<TabResolucionBean>> {

    const params = new HttpParams()
      .set('idResolucion', idResolucion);

    return this.httpClient.post<GenericResponseBean<TabResolucionBean>>(
      this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_ANULAR_RESOLUCION,
      null,
      {
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getInfoActaParaAsociacion(codTipoResolucion:number, nroActaCopiaDig: string, idUbigeo:number, idLocalVotacion:number,idEleccion:number, idProceso:number): Observable<IGenericInterface<ActaBean[]>> {

    const params = new HttpParams()
      .set('codTipoResolucion', codTipoResolucion)
      .set('nroActaCopiaDig',nroActaCopiaDig)
      .set('idUbigeo',idUbigeo)
      .set('idLocalVotacion',idLocalVotacion)
      .set('idEleccion',idEleccion)
      .set("idProceso", idProceso);

    return this.httpClient.get<IGenericInterface<ActaBean[]>>(
      this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_INFO_ACTA_PARA_ASOCIACION, {
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });

  }


  registrarAsociacionConActas(resolucionAsociadosRequest :ResolucionAsociadosRequest){
    return this.httpClient.post<IGenericInterface<any>>(
        this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_REGISTRAR_ASOCIACION,
        resolucionAsociadosRequest,{
          headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
        });
  }

  aplicarResolucionActa(actaBean :ActaBean){
    return this.httpClient.post<IGenericInterface<AplicarActaBean>>(
      this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_APLICAR_RESOLUCION, actaBean,{
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }



  actualizarEstadoDigitalizacion(idResolucion:number, estadoDigitalizacion:string){

    const params = new HttpParams()
      .set('idResolucion', idResolucion)
      .set('estadoDigitalizacion',estadoDigitalizacion);

    return this.httpClient.post<IGenericInterface<any>>(
      this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_ACTUALIZAR_ESTADO_DIGTAL,
      null,{
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getFile(idfile: number): Observable<any> {
    return this.httpClient.get(
      this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_FILE+idfile,{responseType:"blob"})
      .pipe(map(res =>this.validarDescargaBlob(res)));
  }

  getFilev3(idfile: number): Observable<any> {
    return this.httpClient.get(
      this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_FILE_3+idfile,{responseType:"blob"})
      .pipe(map(res =>this.validarDescargaBlobPDF(res)));
  }

  getFilePdfPoppu(idfile: number): Observable<IGenericInterface<any>> {

    return this.httpClient.post<IGenericInterface<any>>(this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_FILE_POPUP+idfile,
      null,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });

  }

  getFilePdfPoppuConvStae(idArchivo: number, actaId: number): Observable<IGenericInterface<any>> {
    let params = new HttpParams()
      .set('idArchivo', idArchivo)
      .set('idActa', actaId);

    return this.httpClient.post<IGenericInterface<any>>(this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_FILE_PDF_POPUP_CONV_STAE,
      null,
      {
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });

  }

  getArchivos(actaId: number): Observable<Array<number>> {
    let params = new HttpParams()
      .set('mesa', '')
      .set('codigoEleccion','')
      .set('actaId',actaId)
    ;

    return this.httpClient.get<Array<number>>(this.urlServidor +Constantes.CB_ACTA_CONTROLLER_ACTAS_GET_ARCHIVOS,
      {
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });

  }

  getFile2(idfile: string): Observable<any> {
    return this.httpClient.get(
      this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_FILE_2+idfile,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });


  }

  generarCargoEntregaV2(actasBean :ActaBean[]){

    return this.httpClient.post<IGenericInterface<any>>(this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_GENERAR_CARGO_ENTREGA_v2, actasBean, {
      headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
    });

  }

  generarCargoEntregaOficio(actasBean :ActaBean){
    return this.httpClient.post<IGenericInterface<any>>(this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_GENERAR_CARGO_ENTREGA_OFICIO, actasBean, {
      headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
    });
  }

  generarCargoEntregaActaDevuelta(actasBean :ActaBean[]): Observable<IGenericInterface<any>>{

    return this.httpClient.post<IGenericInterface<any>>(this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_CARGO_ENTREGA_ACTA_DEVUELTA, actasBean, {
      headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
    });

  }


  generarCargoEntregaMesaNoInstaladaExtSin(resolucionAsociadosRequest :ResolucionAsociadosRequest): Observable<IGenericInterface<any>>{

    return this.httpClient.post<IGenericInterface<any>>(this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_CARGO_ENTREGA_MESA_NO_INSTALADA_EXT_SIN, resolucionAsociadosRequest, {
      headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
    });

  }


  generarCargoEntregaInfundada(resolucionAsociadosRequest :ResolucionAsociadosRequest): Observable<IGenericInterface<any>>{
    return this.httpClient.post<IGenericInterface<any>>(this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_CARGO_ENTREGA_INFUNDADA, resolucionAsociadosRequest, {
      headers:  { 'Authorization': "Bearer " + this.auth.getCToken() }
    });
  }

  validarDescargaBlob(data: any) {
    if (data.type === "image/tiff" && data.size > 0) {
      return new Blob([data], { type: "image/tiff" });
    } else {
      return null;
    }
  }

  validarDescargaBlobPDF(data: any) {
    if (data.type === "application/pdf" && data.size > 0) {
      return new Blob([data], { type: "application/pdf" });
    } else {
      return null;
    }
  }


  listnResolucionesDigtal() {
    return this.httpClient.get<Array<DigitizationListResolucionItem>>(
      this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_DIGTAL,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });

  }

  listarResolucionesDevueltas(page: number, size: number){
    const params = {
      page: page.toString(),
      size: size.toString()
    };

    return this.httpClient.get<IGenericInterface<SearchFilterResponse<ResolucionDevueltasRequest>>>(
      this.urlServidor + Constantes.CB_RESOLUCIONES_CONTROLLER_DEVUELTAS,
      {
        headers: { 'Authorization': "Bearer " + this.auth.getCToken() },
        params
      }
    );
  }

  getArchivosSobre(acta: ActaBean, tipoSobre: string): Observable<GenericResponseBean<DigitizationGetFilesResponse>> {
    const params = new HttpParams()
      .set('tipoSobre', tipoSobre);

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.getCToken()
    });

    return this.httpClient.post<GenericResponseBean<DigitizationGetFilesResponse>>(
      this.urlServidor + Constantes.CB_RESOLUCIONES_CONTROLLER_OBTENER_ARCHIVO_SOBRE,acta,
      { headers, params }
    );
  }

  generarOficio(actasBean :ActaBean[]){
    return this.httpClient.post<IGenericInterface<any>>(this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_GENERAR_OFICIO, actasBean, {
      headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
    });
  }

  transmitirOficio(actasBean: ActaBean): Observable<IGenericInterface<any>> {
    const headers = { 'Authorization': 'Bearer ' + this.auth.getCToken() };
    const url = this.urlServidor + Constantes.CB_RESOLUCIONES_CONTROLLER_TRANSMITIR_OFICIO;
    return this.httpClient.post<IGenericInterface<any>>(url, actasBean, { headers });
  }

  verificarDocumentoEnvioJEE(actasBean :ActaBean, tipoDocumento: string){
    const params = new HttpParams()
      .set('tipoDocumento', tipoDocumento);

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.getCToken()
    });

    return this.httpClient.post<IGenericInterface<any>>(this.urlServidor +Constantes.CB_RESOLUCIONES_CONTROLLER_VERIFICAR_DOCUMENTO_ENVIO,
      actasBean, { headers, params });
  }

  seguimientoJEE(): Observable<GenericResponseBean<SeguimientoJeeBean[]>>{
    return this.httpClient.get<GenericResponseBean<SeguimientoJeeBean[]>>(
    this.urlServidor + Constantes.CB_RESOLUCIONES_CONTROLLER_SEGUIMIENTO_JEE,
    { headers: { Authorization: 'Bearer ' + this.auth.getCToken() } });
  }

  bloquearResolucion(idResolucion: number): Observable<IGenericInterface<boolean>> {
    const params = new HttpParams()
      .set('idResolucion', idResolucion);

    return this.httpClient.post<IGenericInterface<boolean>>(
      this.urlServidor + Constantes.CB_RESOLUCIONES_CONTROLLER_BLOQUEAR_RESOLUCION,
      null,
      {
        params: params,
        headers: { 'Authorization': 'Bearer ' + this.auth.getCToken() }
      }
    );

  }

  desbloquearResolucion(idResolucion: number): Observable<IGenericInterface<boolean>> {
    const params = new HttpParams()
      .set('idResolucion', idResolucion);

    return this.httpClient.post<IGenericInterface<boolean>>(
      this.urlServidor + Constantes.CB_RESOLUCIONES_CONTROLLER_DESBLOQUEAR_RESOLUCION,
      null,
      {
        params: params,
        headers: { 'Authorization': 'Bearer ' + this.auth.getCToken() }
      }
    );
  }

}
