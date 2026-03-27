import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { environment } from 'src/environments/environment';
import {GlobalService} from "../../service/global.service";
import { FiltroTransmision } from 'src/app/model/reportes/tranmision';


@Injectable({
  providedIn: 'root'
})
export class TransmisionApiService {

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

  getReporteTransmisionPdf(filtros: FiltroTransmision):Observable<GenericResponseBean<string>>{
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_TRANSMISION_BASE64}`);
    return this.httpClient.post<GenericResponseBean<string>>(url, filtros);
  }

}
