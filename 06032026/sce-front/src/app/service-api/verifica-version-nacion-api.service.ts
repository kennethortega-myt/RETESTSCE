import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../service/auth-service.service";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {Constantes} from "../helper/constantes";
import {IPuestaCeroDTO} from "../interface/puestaCero.interface";

@Injectable({
  providedIn: 'root',
})
export class VerificaVersionNacionApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
    this.urlServidor = environment.apiUrl;
  }

  puestaCeroVerificaNacion(data:IPuestaCeroDTO): Observable<GenericResponseBean<string>> {
    // Define tus encabezados aquí
    const headers = new HttpHeaders({
      'X-Tenant-Id': data.acronimo,
      'Authorization': "Bearer " + this.auth.getCToken()
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor+ "/" +Constantes.CB_VERIFICA_VERSION_NACION_CONTROLLER_PC,
      data,
      opciones
    );
  }

  procesarVerificaVersionNacion(data:IPuestaCeroDTO): Observable<GenericResponseBean<string>> {
    // Define tus encabezados aquí
    const headers = new HttpHeaders({
      'X-Tenant-Id': data.acronimo,
      'Authorization': "Bearer " + this.auth.getCToken()
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor + "/" +Constantes.CB_VERIFICA_VERSION_NACION_CONTROLLER_PROCESAR,
      data,
      opciones
    );
  }

  reporteVerificaVersionNacion(data:IPuestaCeroDTO): Observable<GenericResponseBean<string>> {
    // Define tus encabezados aquí
    const headers = new HttpHeaders({
      'X-Tenant-Id': data.acronimo,
      'Authorization': "Bearer " + this.auth.getCToken()
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.httpClient.post<GenericResponseBean<string>>(
      this.urlServidor + "/" + Constantes.CB_VERIFICA_VERSION_NACION_CONTROLLER_REPORTE,
      data,
      opciones
    );
  }
}
