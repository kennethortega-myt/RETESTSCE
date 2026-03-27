import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroAutoridadesRevocadas } from 'src/app/model/reportes/filtro-autoridades-revocadas';
import { GlobalService } from 'src/app/service/global.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutoridadesRevocadasApiService {

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

  getReporteAutoridadesRevocadas(filtros: FiltroAutoridadesRevocadas):Observable<GenericResponseBean<string>>{
    this.asignarUrlBackend();
    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_AUTORIDADES_REVOCADAS_POST_BASE64}`);
    return this.httpClient.post<GenericResponseBean<string>>(url, filtros);
  }
}
