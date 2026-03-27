import {Injectable} from '@angular/core';
import {CierreActividadesServiceApi} from '../service-api/cierre-actividades-service-api.service';
import {CierreCentroComputoRequestBean} from '../model/cierreCentroComputoRequestBean';
import {Observable} from 'rxjs';
import {GenericResponseBean} from '../model/genericResponseBean';
import {CierreCentroComputoResponseBean} from '../model/cierreCentroComputoResponseBean';
import {ReaperturaCentroComputoResponseBean} from '../model/reaperturaCentroComputoResponseBean';
import {EstadoCentroComputoResponseBean} from '../model/estadoCentroComputoResponseBean';
import {ValidarUsuarioReaperturaResponseBean} from '../model/validarUsuarioReaperturaResponseBean';
import {AutorizacionNacionResponseBean} from '../model/autorizacionNacionResponseBean';

@Injectable({
  providedIn: 'root',
})
export class CierreActividadesService{
  constructor(private readonly cierreActividadesServiceApi: CierreActividadesServiceApi) {
  }

  cerrarCC(cierreCentroComputoRequestBean: CierreCentroComputoRequestBean): Observable<GenericResponseBean<CierreCentroComputoResponseBean>>{
    return this.cierreActividadesServiceApi.cerrarCC(cierreCentroComputoRequestBean);
  }

  reabrirCC(conAutorizacionNacion: boolean): Observable<GenericResponseBean<ReaperturaCentroComputoResponseBean>>{
    return this.cierreActividadesServiceApi.reabrirCC(conAutorizacionNacion);
  }

  validarUsuarioReapertura(): Observable<GenericResponseBean<ValidarUsuarioReaperturaResponseBean>>{
    return this.cierreActividadesServiceApi.validarUsuarioReapertura();
  }

  estadoCC(): Observable<GenericResponseBean<EstadoCentroComputoResponseBean>>{
    return this.cierreActividadesServiceApi.estadoCC();
  }

  validarAccesoAlModal(): Observable<GenericResponseBean<AutorizacionNacionResponseBean>>{
    return this.cierreActividadesServiceApi.validarAccesoAlModal();
  }

  solicitarAccesoNacion(): Observable<GenericResponseBean<boolean>>{
    return this.cierreActividadesServiceApi.solicitarAccesoNacion();
  }

  solicitarEstadoAutorizacionNacion(): Observable<GenericResponseBean<AutorizacionNacionResponseBean>>{
    return this.cierreActividadesServiceApi.solicitarEstadoAutorizacionNacion();
  }
}
