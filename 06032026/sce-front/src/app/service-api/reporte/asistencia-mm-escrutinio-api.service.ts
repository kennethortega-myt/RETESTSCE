import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroAsistenciaMiembroMesa } from 'src/app/model/reportes/filtro-asistencia-mm';
import { GlobalService } from 'src/app/service/global.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaMmEscrutinioApiService {

    private readonly urlServidorOrc: string;
    private readonly urlServidorNacion: string;
    private urlServidor: string;

    constructor(
      private readonly httpClient: HttpClient,
      private readonly globalService: GlobalService,
    ) {
      this.urlServidorOrc = environment.apiUrlORC;
      this.urlServidorNacion = environment.apiUrl;
    }

    private asignarUrlBackend() {
      this.urlServidor = (this.globalService.isNacionUser ? this.urlServidorNacion : this.urlServidorOrc);
    }

    getReporteAsistenciaMMEscrutinio(filtros: FiltroAsistenciaMiembroMesa):Observable<GenericResponseBean<string>>{
      this.asignarUrlBackend();

      const headers = new HttpHeaders({
        [Constantes.HEADER_TENANT_ID]: filtros.acronimo
      });

      const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_ASISTENCIA_ESCRUTINIO_POST_BASE64}`);
      return this.httpClient.post<GenericResponseBean<string>>(url, filtros, {headers});
    }

}
