import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroDigitalizacionResol } from 'src/app/model/reportes/avance-digitalizacion-resolucion';
import { GlobalService } from 'src/app/service/global.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AvanceDigitalizacionResolucionApiService {

  private urlServidor: string;

  constructor( private readonly httpClient: HttpClient,
              private readonly globalService: GlobalService
    ) {
      this.urlServidor = environment.apiUrl;
    }

    private asignarUrlBackend() {
      this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl : environment.apiUrlORC);
    }

  getReporteAvanceDigitalizacionResolucion(filtros: FiltroDigitalizacionResol):Observable<GenericResponseBean<string>>{
    this.asignarUrlBackend();
    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: filtros.acronimo
    });
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_AVANCE_DIGITALIZACION_RESOLUCION_BASE64}`);
    return this.httpClient.post<GenericResponseBean<string>>(url, filtros, {headers});
  }
}
