import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GlobalService} from '../../service/global.service';
import { environment } from 'src/environments/environment';
import {Observable} from 'rxjs';
import {GenericResponseBean} from '../../model/genericResponseBean';
import {FiltroPrecisionAsistAutomaControlDigitalizacion } from '../../model/reportes/filtro-precision-asist-automa-control-digitalizacion';
import {Constantes} from '../../helper/constantes';

@Injectable({
  providedIn: 'root'
})
export class PrecisionAsistAutomaControlDigitalizacionApiService {

  private urlServidor: string;
  constructor(
    private readonly httpClient: HttpClient,
    private readonly globalService: GlobalService
  ) {
    this.urlServidor = environment.apiUrl;
  }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl : environment.apiUrlORC);
  }

  getPrecisionAsistAutomaControlDigitalizacionPDF(filtros: FiltroPrecisionAsistAutomaControlDigitalizacion, acronimo: string):Observable<GenericResponseBean<string>>{
    this.asignarUrlBackend();
    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_PRECISION_ASIST_AUTOMA_CONTROL_DIGITALIZACION_BASE64}`);
    return this.httpClient.post<GenericResponseBean<string>>(url,filtros,{headers});
  }
}
