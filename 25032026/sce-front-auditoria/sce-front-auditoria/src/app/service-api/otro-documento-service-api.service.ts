import { Injectable } from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Constantes } from "../helper/constantes";
import {AuthService} from "../service/auth-service.service";
import {IGenericInterface} from '../interface/general.interface';
import {DetOtroDocumentoDto, OtroDocumentoDto, ResumenOtroDocumentoDto} from '../model/denuncias/denuncia-bean';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OtroDocumentoServiceApiService {

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService,) {
    this.urlServidor = environment.apiUrlORC;
  }

  listarControlDigtalOtrosDocumentos(abreviaturaDocumento:string) {
    const params = new HttpParams()
      .set('abreviaturaDocumento', abreviaturaDocumento);

    return this.httpClient.get<Array<OtroDocumentoDto>>(
      this.urlServidor + Constantes.CB_OTROS_DOCUMENTOS_CONTROLLER_CONTROL_DIGTAL,{
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );

  }

  actualizarEstadoDigitalizacion(idOtroDocumento:number, estadoDigitalizacion:string){

    const params = new HttpParams()
      .set('idOtroDocumento', idOtroDocumento)
      .set('estadoDigitalizacion',estadoDigitalizacion);

    return this.httpClient.post<IGenericInterface<any>>(
      this.urlServidor +Constantes.CB_OTROS_DOCUMENTOS_CONTROLLER_ACTUALIZAR_ESTADO_DIGTAL,
      null,{
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  resumen(numeroDocumento:string, estadoDocumento:string, estadoDigitalizacion:string):
    Observable<IGenericInterface<ResumenOtroDocumentoDto>>{

    const params = new HttpParams()
      .set('numeroDocumento', numeroDocumento)
      .set('estadoDocumento', estadoDocumento)
      .set('estadoDigitalizacion', estadoDigitalizacion);

    return this.httpClient.get<IGenericInterface<ResumenOtroDocumentoDto>>(
      this.urlServidor + Constantes.CB_OTROS_DOCUMENTOS_CONTROLLER_RESUMEN,{
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  validarMesaParaAsociacion(detOtroDocumento:DetOtroDocumentoDto):Observable<IGenericInterface<boolean>> {
    return this.httpClient.post<IGenericInterface<any>>(
      this.urlServidor +Constantes.CB_OTROS_DOCUMENTOS_CONTROLLER_VALIDAR_ASOCIACION, detOtroDocumento, {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  registrarAsociacion(documentoDto :OtroDocumentoDto){
    return this.httpClient.post<IGenericInterface<any>>(
      this.urlServidor +Constantes.CB_OTROS_DOCUMENTOS_CONTROLLER_ASOCIACION_MESAS, documentoDto, {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  procesarAsociacion(documentoDto: OtroDocumentoDto) {
    return this.httpClient.post<IGenericInterface<boolean>>(
      this.urlServidor +Constantes.CB_OTROS_DOCUMENTOS_CONTROLLER_PROCESAR_ASOCIACION, documentoDto, {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  anularDocumento(documentoDto: OtroDocumentoDto) {
    return this.httpClient.post<IGenericInterface<boolean>>(
      this.urlServidor +Constantes.CB_OTROS_DOCUMENTOS_CONTROLLER_ANULAR_DOCUMENTO, documentoDto, {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }
}
