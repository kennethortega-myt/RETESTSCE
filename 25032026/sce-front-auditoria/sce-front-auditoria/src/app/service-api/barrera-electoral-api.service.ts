import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from '../service/global.service';
import { environment } from 'src/environments/environment';
import { FiltroBarreraElectoral } from '../model/reportes/barrera-electoral';
import { Observable } from 'rxjs';
import { GenericResponseBean } from '../model/genericResponseBean';
import { Constantes } from '../helper/constantes';

@Injectable({
  providedIn: 'root'
})
export class BarreraElectoralApiService {

  private urlServidor: string;
    
  constructor(
    private readonly httpClient: HttpClient,
    private readonly globalService: GlobalService,
  )
    {
      this.urlServidor = environment.apiUrl+'/';
    }

  private asignarUrlBackend() {
    this.urlServidor = (this.globalService.isNacionUser ? environment.apiUrl+'/' : environment.apiUrlORC);
  }

  obtenerBarreraElectoralPDF(acronimo: string, filtros: FiltroBarreraElectoral): Observable<GenericResponseBean<string>> {
      const headers = new HttpHeaders({
            [Constantes.HEADER_TENANT_ID]: acronimo
          });      
      this.asignarUrlBackend();
      const url = this.globalService.reemplazarDobleSlash(`${this.urlServidor}/${Constantes.CB_REPORTE_BARRERA_ELECTORAL_BASE64}`);
  
      return this.httpClient.post<GenericResponseBean<string>>(url, filtros, {headers: headers});
    }
}
