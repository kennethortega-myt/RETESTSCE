import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthService} from './auth-service.service';
import {environment} from '../../environments/environment';
import {IGenericInterface} from '../interface/general.interface';
import {MesaBean} from '../model/mesaBean';


@Injectable({
  providedIn: 'root'
})
export class OmisosMesaService {

  private readonly baseUrl: string;
  constructor(private readonly http: HttpClient, public auth: AuthService) {
    this.baseUrl = environment.apiUrlORC;
  }

  buscarMesaEliminarOmisos(mesa: number){
    let params = new HttpParams()
      .set('codMesa', mesa);
    return this.http.get<any>(`${this.baseUrl}mesa/buscarEliminarOmiso`, {params});
  }

  save(data: Array<MesaBean>){
    return this.http.post<IGenericInterface<any>>(`${this.baseUrl}mesa/saveEliminarOmiso`,data);
  }

}
