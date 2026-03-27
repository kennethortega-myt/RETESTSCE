import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  IDocumentoElectoralRequest, IDocumentoElectoralResponse,
  IGenericInterface
} from '../interface/general.interface';

@Injectable({
  providedIn: 'root'
})
export class TipoEleccionService {

  baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  list(){
    return this.http.get<IGenericInterface<Array<IDocumentoElectoralResponse>>>(`${this.baseUrl}/tipoEleccion`);
  }

  save(data: IDocumentoElectoralRequest){
    return this.http.post<IGenericInterface<IDocumentoElectoralResponse>>(`${this.baseUrl}/tipoEleccion`,data);
  }

  getHijos(id:number){
    return this.http.get<IGenericInterface<Array<IDocumentoElectoralResponse>>>(`${this.baseUrl}/tipoEleccion/hijos/${id}`);
  }

}
