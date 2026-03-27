import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDatosGeneralRequest, IDatosGeneralResponse, IGenericInterface } from '../interface/general.interface';

@Injectable({
  providedIn: 'root'
})
export class SeccionService {

  baseUrl = environment.apiUrl + '/seccion';

  constructor(private readonly http: HttpClient) { }

  list(){
    return this.http.get<IGenericInterface<Array<IDatosGeneralResponse>>>(`${this.baseUrl}`);
  }

  save(data: IDatosGeneralRequest){
    return this.http.post<IGenericInterface<IDatosGeneralResponse>>(`${this.baseUrl}`,data);
  }

  delete(id: number){
    return this.http.delete<IGenericInterface<IDatosGeneralResponse>>(`${this.baseUrl}/${id}`);
  }

}
