import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IGenericInterface } from '../interface/general.interface';
import { IDetalleConfiguracionDocumentoElectoral } from '../interface/detalleConfiguracionElectoral.interface';

@Injectable({
  providedIn: 'root'
})
export class DetalleConfiguracionService {

  baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  obtenerDetalleConfiguracionElectoral(tipoEleccion: number, metodo:number){
    let params = new HttpParams();
    if(metodo !== 0){
      params = params.append('metodo', metodo);
    }
      return this.http.get<IGenericInterface<Array<IDetalleConfiguracionDocumentoElectoral>>>(`${this.baseUrl}/detalleConfiguracionDocumentoElectoral/${tipoEleccion}`,{params:params});
  }

  guardar(data:Array<IDetalleConfiguracionDocumentoElectoral>,docu: any){
    return this.http.post<IGenericInterface<any>>(`${this.baseUrl}/detalleConfiguracionDocumentoElectoral`, {detalles: data, documento:docu});
  }
}
