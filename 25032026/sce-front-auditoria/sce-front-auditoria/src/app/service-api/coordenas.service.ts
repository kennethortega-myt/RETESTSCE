import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {IareaCoordinates, IRelativeCoordinatesInterface} from "../interface/IRelativeCoordinates.interface";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CoordenasService {

  apiUrl = environment.apiUrl

  constructor(private readonly http: HttpClient) { }

  verificarImagen(data: IRelativeCoordinatesInterface):Observable<Array<IareaCoordinates>>{
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };
    return this.http.post<Array<IareaCoordinates>>(`${this.apiUrl}/externalApi/relative-coordena`,data,{headers});
  }
}
