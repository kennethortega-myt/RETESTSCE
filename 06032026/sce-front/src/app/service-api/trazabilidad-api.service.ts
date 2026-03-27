import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {GenericResponseBean} from "../model/genericResponseBean";
import {TrazabilidadBean} from "../model/trazabilidadBean";
import {Observable} from "rxjs";
import {AuthService} from '../service/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class TrazabilidadApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  trazabilidadActa(acta: string): Observable<GenericResponseBean<TrazabilidadBean>>{
    return this.httpClient.get<GenericResponseBean<TrazabilidadBean>>(`${this.urlServidor}actas/trazabilidad/`+acta,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }
  trazabilidadMesa(mesa: string): Observable<GenericResponseBean<TrazabilidadBean[]>>{
    return this.httpClient.get<GenericResponseBean<TrazabilidadBean[]>>(`${this.urlServidor}actas/trazabilidad/porMesa/`+mesa,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }
}
