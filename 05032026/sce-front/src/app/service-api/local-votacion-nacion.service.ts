import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LocalVotacionBean } from '../model/localVotacionBean';
import { Observable } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class LocalVotacionNacionService {

  baseUrl = environment.apiUrl+'/local';

  constructor(private readonly http: HttpClient) { }

  listarPorIdUbigeo(idUbigeo:number,acronimo:string): Observable<Array<LocalVotacionBean>>{

    // Define tus encabezados aquí
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo
    });

    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.http.get<Array<LocalVotacionBean>>(`${this.baseUrl}/ubigeo/${idUbigeo}`,opciones);
  }

}
