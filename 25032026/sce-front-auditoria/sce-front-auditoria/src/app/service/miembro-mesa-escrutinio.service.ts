import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {IGenericInterface} from '../interface/general.interface';
import {IMiembroMesaEscrutinioRequest} from '../interface/miembroMesaEscritunio.interface';

@Injectable({
  providedIn: 'root'
})
export class MiembroMesaEscrutinioService {

  private readonly baseUrl: string;
  constructor(private readonly http: HttpClient) {
    this.baseUrl = environment.apiUrlORC;
  }

  obtenerMesaRandom(idProceso: number, tipoFiltro: number, reprocesar: boolean){
    let params = new HttpParams()
      .set('tipoFiltro', tipoFiltro)
      .set('reprocesar', reprocesar)
      .set('idProceso', idProceso);
    return this.http.get<IGenericInterface<any>>(`${this.baseUrl}mme/getRandomMesa`, {params});
  }

  consultaPadron(dni: string, mesaId: number, isPrimeraConsultaR:boolean){
    let params = new HttpParams()
      .set('mesaId', mesaId)
      .set('primeraConsultaR', isPrimeraConsultaR)
      .set('dni', dni);
    return this.http.get<IGenericInterface<any>>(`${this.baseUrl}mme/consulta-padron`, {params});
  }
  save(data: IMiembroMesaEscrutinioRequest){
    return this.http.post<IGenericInterface<any>>(`${this.baseUrl}mme`,data);
  }

  saltar(idMesa: number){
    return this.http.put<IGenericInterface<any>>(`${this.baseUrl}mme/saltar/${idMesa}`, null);
  }
}
