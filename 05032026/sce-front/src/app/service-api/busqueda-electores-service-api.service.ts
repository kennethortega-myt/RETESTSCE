import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { AuthService } from "../service/auth-service.service";
import { Observable } from "rxjs";
import { GenericResponseBean } from "../model/genericResponseBean";
import { PageResponse } from "../interface/pageResponse.interface";
import { PadronElectoralResponse } from "../interface/padronElectoralResponse.interface";
import { Constantes } from "../helper/constantes";
import { PadronElectoralBusqueda } from "../interface/padronElectoralBusqueda.interface";

@Injectable({
  providedIn: 'root',
})
export class BusquedaElectoresServiceApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  buscarElectores(padronElectoralBusqueda: PadronElectoralBusqueda, page: number, size: number): Observable<GenericResponseBean<PageResponse<PadronElectoralResponse>>> {
    const params = new HttpParams()
        .append('page', page)
        .append('size', size);
    return this.httpClient.post<GenericResponseBean<PageResponse<PadronElectoralResponse>>>(
      this.urlServidor + Constantes.CB_PADRON_ELECTORAL_CONTROLLER_BUSCAR_ELECTORES,
      padronElectoralBusqueda,
      {
        headers: { 'Authorization': "Bearer " + this.auth.getCToken() },
        params: params
      }
    );
  }

}
