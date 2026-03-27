import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroListarUsuarios, FiltroTransaccionesRealizadas } from 'src/app/model/reportes/transaccionesRealizadas';
import { UsuarioReporteTransaccionesBean } from 'src/app/model/usuarioReporteTransaccionesBean';
import { GlobalService } from 'src/app/service/global.service';
import { environment } from 'src/environments/environment';
import {AuthService} from '../../service/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteTransaccionesRealizadasApiService {
  private urlServidor: string;
  constructor(
    private readonly httpClient: HttpClient,
    private readonly globalService: GlobalService,public auth: AuthService
  ) {
    this.urlServidor = environment.apiUrl;
  }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl : environment.apiUrlORC);
  }

  listarUsuarios(filtro: FiltroListarUsuarios): Observable<GenericResponseBean<Array<UsuarioReporteTransaccionesBean>>> {
    this.asignarUrlBackend();

    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: filtro.acronimo
    });

    const url = this.globalService.reemplazarDobleSlash(
      `${this.urlServidor}/${Constantes.CB_REPORTE_TRANSACCIONES_REALIZADAS_LISTA_USUARIOS}`
    );

    return this.httpClient.post<GenericResponseBean<Array<UsuarioReporteTransaccionesBean>>>(url, filtro, { headers });
  }

  getReporteTransaccionesRealizadas(filtros: FiltroTransaccionesRealizadas):Observable<GenericResponseBean<string>>{
    this.asignarUrlBackend();

    const headers = new HttpHeaders({
      [Constantes.HEADER_TENANT_ID]: filtros.acronimo
    });


    const url = this.globalService.reemplazarDobleSlash(
      `${this.urlServidor}/${Constantes.CB_REPORTE_TRANSACCIONES_REALIZADAS_POST_BASE64}`
    );

    return this.httpClient.post<GenericResponseBean<string>>(url, filtros, {headers});
  }

}
