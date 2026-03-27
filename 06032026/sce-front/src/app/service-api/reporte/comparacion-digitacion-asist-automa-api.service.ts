import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from '../../service/global.service';
import {environment} from '../../../environments/environment';
import { FiltroComparacionDigitacionAsistAutoma } from '../../model/reportes/filtro-comparacion-digitacion-asist-automa-';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { Constantes } from '../../helper/constantes';


@Injectable({
  providedIn: 'root'
})
export class ComparacionDigitacionAsistAutomaApiService {
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

  getComparacionDigitacionAsistAutomaPDF(filtros: FiltroComparacionDigitacionAsistAutoma, acronimo: string): Observable<GenericResponseBean<string>>{
    this.asignarUrlBackend();
    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: acronimo
    });
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_COMPARACION_DIGITACION_ASIST_AUTOMA_BASE64}`);
    return this.httpClient.post<GenericResponseBean<string>>(url,filtros,{headers});
  }
}
