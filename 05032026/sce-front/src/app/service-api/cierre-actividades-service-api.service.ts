import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthService} from '../service/auth-service.service';
import {environment} from '../../environments/environment';
import {Constantes} from '../helper/constantes';
import {GenericResponseBean} from '../model/genericResponseBean';
import {CierreCentroComputoRequestBean} from '../model/cierreCentroComputoRequestBean';
import {CierreCentroComputoResponseBean} from '../model/cierreCentroComputoResponseBean';
import {Observable} from 'rxjs';
import {ReaperturaCentroComputoResponseBean} from '../model/reaperturaCentroComputoResponseBean';
import {EstadoCentroComputoResponseBean} from '../model/estadoCentroComputoResponseBean';
import {ValidarUsuarioReaperturaResponseBean} from '../model/validarUsuarioReaperturaResponseBean';
import {AutorizacionNacionResponseBean} from '../model/autorizacionNacionResponseBean';

@Injectable({
  providedIn: 'root',
})
export class CierreActividadesServiceApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  cerrarCC(cierreCentroComputoRequestBean: CierreCentroComputoRequestBean): Observable<GenericResponseBean<CierreCentroComputoResponseBean>>{
    return this.httpClient.post<GenericResponseBean<CierreCentroComputoResponseBean>>(
      this.urlServidor +Constantes.CB_CIERRE_ACTIVIDADES_CONTROLLER_CERRAR_CC,
      cierreCentroComputoRequestBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  reabrirCC(conAutorizacionNacion: boolean): Observable<GenericResponseBean<ReaperturaCentroComputoResponseBean>>{
    const params = new HttpParams()
          .append('conAutorizacionNacion',conAutorizacionNacion);

    return this.httpClient.post<GenericResponseBean<ReaperturaCentroComputoResponseBean>>(
      this.urlServidor +Constantes.CB_CIERRE_ACTIVIDADES_CONTROLLER_REABRIR_CC,
      {},
      {
        params:params,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }

    );
  }

  validarUsuarioReapertura(): Observable<GenericResponseBean<ValidarUsuarioReaperturaResponseBean>>{

    return this.httpClient.post<GenericResponseBean<ValidarUsuarioReaperturaResponseBean>>(
      this.urlServidor +Constantes.CB_CIERRE_ACTIVIDADES_CONTROLLER_VALIDAR_USUARIO_REAPERTURA,
      {},
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }

    );
  }

  estadoCC(): Observable<GenericResponseBean<EstadoCentroComputoResponseBean>>{
    return this.httpClient.get<GenericResponseBean<EstadoCentroComputoResponseBean>>(
      this.urlServidor +Constantes.CB_CIERRE_ACTIVIDADES_CONTROLLER_ESTADO_CC,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  validarAccesoAlModal(): Observable<GenericResponseBean<AutorizacionNacionResponseBean>>{
    return this.httpClient.post<GenericResponseBean<AutorizacionNacionResponseBean>>(
      this.urlServidor + Constantes.CB_CIERRE_ACTIVIDADES_CONTROLLER_CHECK,
      {},
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      });
  }

  solicitarAccesoNacion(): Observable<GenericResponseBean<boolean>>{
    return this.httpClient.post<GenericResponseBean<boolean>>(
      this.urlServidor + Constantes.CB_AUTORIZACION_REAPERTURA_CONTROLLER_SOLICITAR,
      {},
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      });
  }

  solicitarEstadoAutorizacionNacion(): Observable<GenericResponseBean<AutorizacionNacionResponseBean>>{
    return this.httpClient.post<GenericResponseBean<AutorizacionNacionResponseBean>>(
      this.urlServidor + Constantes.CB_CIERRE_ACTIVIDADES_CONTROLLER_ACTAS_REAPERTURA + '/autorizacion/consulta',
      {},
      {headers:  { 'Authorization': "Bearer " + this.auth.getCToken()},
      });
  }
}
