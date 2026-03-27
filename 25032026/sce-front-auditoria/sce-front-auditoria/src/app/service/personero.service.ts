import { Injectable } from '@angular/core';
import {
  IGenericInterface
} from '../interface/general.interface';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {IPersoneroRequest} from '../interface/personero.interface';

@Injectable({
  providedIn: 'root'
})
export class PersoneroService {

  private readonly baseUrl: string;
  constructor(private readonly http: HttpClient) {
    this.baseUrl = environment.apiUrlORC;
  }

  obtenerMesaRandom(idProceso: number, tipoFiltro: number, reprocesar: boolean){
    let params = new HttpParams()
      .set('tipoFiltro', tipoFiltro)
      .set('reprocesar', reprocesar)
      .set('idProceso', idProceso);
    return this.http.get<IGenericInterface<any>>(`${this.baseUrl}personero/getRandomMesa`, {params});
  }

  consultaPadron(dni: string, mesaId:number){
    let params = new HttpParams()
      .set('mesaId', mesaId)
      .set('dni', dni);
    return this.http.get<IGenericInterface<any>>(`${this.baseUrl}personero/consulta-padron`, {params});
  }
  save(data: IPersoneroRequest){
    return this.http.post<IGenericInterface<any>>(`${this.baseUrl}personero`,data);
  }
  saltar(idMesa: number){
    return this.http.put<IGenericInterface<any>>(`${this.baseUrl}personero/saltar/${idMesa}`, null);
  }
}
