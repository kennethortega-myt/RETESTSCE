import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroProductividadDigitador, UsuarioDigitador } from 'src/app/model/reportes/FiltrosProductividadDigitador';
import { GlobalService } from 'src/app/service/global.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductividadDigitadorApiService {

  private urlServidor: string;
    
  constructor( private readonly httpClient: HttpClient,
              private readonly globalService: GlobalService
    ) {
    this.urlServidor = environment.apiUrl;
    }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl : environment.apiUrlORC);
  }

  getReporteProductividadDigitadorPdf(filtros: FiltroProductividadDigitador, acronimo: string): Observable<GenericResponseBean<string>>{
    this.asignarUrlBackend();
    const headers = new HttpHeaders({
            [Constantes.HEADER_TENANT_ID]: acronimo
          });

    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_PRODUCTIVIDAD_DIGITADOR_POST_BASE64}`);
    return this.httpClient.post<GenericResponseBean<string>>(url, filtros, {headers});
  }

  getUsuariosDigitador(acronimo: string, idCentroComputo: number): Observable<GenericResponseBean<UsuarioDigitador[]>>{
    this.asignarUrlBackend();
    const headers = new HttpHeaders({
            [Constantes.HEADER_TENANT_ID]: acronimo
          });

    const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_LISTAR_USUARIOS_DIGITADOR_GET}/${idCentroComputo}`);
    return this.httpClient.get<GenericResponseBean<UsuarioDigitador[]>>(url, {headers});
  }
}
