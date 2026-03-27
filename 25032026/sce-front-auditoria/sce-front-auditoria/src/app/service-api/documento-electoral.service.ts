import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  IDatosGeneralRequest,
  IDatosGeneralResponse,
  IGenericInterface
} from '../interface/general.interface';

@Injectable({
  providedIn: 'root'
})
export class DocumentoElectoralService {


  baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  save(data: IDatosGeneralRequest){
    return this.http.post<IGenericInterface<IDatosGeneralResponse>>(`${this.baseUrl}/documento`,data);
  }

  delete(id: number){
    return this.http.delete<IGenericInterface<IDatosGeneralResponse>>(`${this.baseUrl}/documento/${id}`);
  }

  listAllCatalogos(){
    return this.http.get<IGenericInterface<any>>(`${this.baseUrl}/documento/catalogos`);
  }

  listConfigGeneral(){
    return this.http.get<IGenericInterface<any>>(`${this.baseUrl}/documento/configGeneral`);
  }

  guardarConfig(data: any){
    return this.http.post<IGenericInterface<any>>(`${this.baseUrl}/documento/configGeneral`, data);
  }

}
