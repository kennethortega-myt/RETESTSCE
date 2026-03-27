import { Injectable } from '@angular/core';
import { ControlCalidadApiService } from '../service-api/control-calidad-api.service';
import { Observable } from 'rxjs';
import { ControlCalidadSumaryResponse } from '../model/control-calidad/ControlCalidadSumaryResponse';
import { ActaPendienteControlCalidad } from '../model/control-calidad/ActaPendienteControlCalidad';
import { ResolucionActa } from '../model/control-calidad/ResolucionActa';
import { ImagenesPaso1 } from '../model/control-calidad/ImagenesPaso1';
import { DatosActaRechazar } from '../model/control-calidad/DataPopupRechazar';
import { GenericResponseBean } from '../model/genericResponseBean';
import { DataPaso2 } from '../model/control-calidad/DataPaso2';
import { DataPaso3, DatosActaAceptar } from '../model/control-calidad/DataPaso3';
import { AutorizacionReprocesamientoBean } from '../model/autorizacionReprocesamientoBean';

@Injectable({
  providedIn: 'root'
})
export class ControlCalidadService {

  constructor( private readonly controlCalidadApiService: ControlCalidadApiService ) { }

  obtenerResumen(codigoEleccion: string): Observable<ControlCalidadSumaryResponse>{
    return this.controlCalidadApiService.obtenerResumen(codigoEleccion);
  }

  obtenerActasPendientes(codigoEleccion: string): Observable<ActaPendienteControlCalidad[]>{
    return this.controlCalidadApiService.obtenerActasPendientes(codigoEleccion);
  }
  
  obtenerResolucionesActa(idActa: number): Observable<ResolucionActa[]>{
    return this.controlCalidadApiService.obtenerResolucionesActa(idActa);
  }

  obtenerIdsImagenesPaso1(idActa: number): Observable<ImagenesPaso1>{
    return this.controlCalidadApiService.obtenerIdsImagenesPaso1(idActa);
  }

  rechazar(request: DatosActaRechazar): Observable<GenericResponseBean<boolean>>{
    return this.controlCalidadApiService.rechazar(request);
  }

  observar(idActa: number): Observable<GenericResponseBean<boolean>>{
    return this.controlCalidadApiService.observar(idActa);
  }

  obtenerDataPaso2(idActa: number): Observable<DataPaso2>{
    return this.controlCalidadApiService.obtenerDataPaso2(idActa);
  }

  aceptar(request: DatosActaAceptar): Observable<GenericResponseBean<boolean>>{
    return this.controlCalidadApiService.aceptar(request);
  }

  obtenerDataPaso3(idActa: number): Observable<GenericResponseBean<DataPaso3>>{
    return this.controlCalidadApiService.obtenerDataPaso3(idActa);
  }

  obtenerHistorialAntesDespues(idActa: number, idResolucion:number): Observable<GenericResponseBean<any>>{
    return this.controlCalidadApiService.obtenerHistorialAntesDespues(idActa, idResolucion);
  }

  consultaAutorizacion(idDocumento: number, tipoDocumento: string): Observable<GenericResponseBean<AutorizacionReprocesamientoBean>>{
    return this.controlCalidadApiService.consultaAutorizacion(idDocumento, tipoDocumento);
  }

  solicitarAutorizacion(idDocumento: number, tipoDocumento: string, idActa: number): Observable<GenericResponseBean<boolean>>{
    return this.controlCalidadApiService.solicitarAutorizacion(idDocumento, tipoDocumento,idActa);
  }

  cancelar(idsActas: number[]): Observable<GenericResponseBean<boolean>>{
    return this.controlCalidadApiService.cancelar(idsActas);
  }
}
