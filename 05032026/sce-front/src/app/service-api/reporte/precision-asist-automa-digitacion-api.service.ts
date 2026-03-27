import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GlobalService} from '../../service/global.service';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {GenericResponseBean} from '../../model/genericResponseBean';
import {Constantes} from '../../helper/constantes';
import {FiltroPrecisionAsistAutomaDigitacion} from '../../model/reportes/filtro-precision-asist-automa-digitacion';

@Injectable({
  providedIn: 'root'
})
export class PrecisionAsistAutomaDigitacionApiService {
  private urlServidor: string;
  constructor(
    private readonly httpCLient: HttpClient,
    private readonly globalService: GlobalService
  ) {
    this.urlServidor = environment.apiUrl
  }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl : environment.apiUrlORC);
  }

  getPrecisionAsistAutomaDigitacionResumenPDF(filtros: FiltroPrecisionAsistAutomaDigitacion, acronimo: string):Observable<GenericResponseBean<string>>{
    this.asignarUrlBackend();
    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_PRECISION_ASIST_AUTOMA_DIGITACION_RESUMEN_BASE64}`);
    return this.httpCLient.post<GenericResponseBean<string>>(url,filtros,{headers});
  }

  getPrecisionAsistAutomaDigitacionDetallePDF(filtros: FiltroPrecisionAsistAutomaDigitacion, acronimo: string):Observable<GenericResponseBean<string>>{
    this.asignarUrlBackend();
    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_PRECISION_ASIST_AUTOMA_DIGITACION_DETALLE_BASE64}`);
    return this.httpCLient.post<GenericResponseBean<string>>(url,filtros,{headers});
  }
}
