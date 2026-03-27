import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {
    IGenericInterface
  } from '../interface/general.interface';

@Injectable({
  providedIn: 'root'
})
export class ParametroConexionService {

    private readonly urlNacion: string;

    constructor(private readonly httpClient: HttpClient) {
        this.urlNacion = environment.apiUrl + "/parametro-conexion-cc"
    }

    obtenerCentrosComputo(acronimo:string, idCc:number){
        const headers = new HttpHeaders({
            'X-Tenant-Id': acronimo
        });
        return this.httpClient.post<IGenericInterface<any>>(`${this.urlNacion}/buscar`, { idCentroComputo: idCc }, {headers});
    }

    updateCentroComputo(acronimo:string, idCc:number, protocol:string, ip:string, puerto:number){
        const headers = new HttpHeaders({
            'X-Tenant-Id': acronimo
        });
        return this.httpClient.put<IGenericInterface<any>>(`${this.urlNacion}/`, 
            { 
                idCentroComputo: idCc,
                protocolo:protocol,
                ip:ip,
                puerto:puerto
            }, 
            {headers});
    }

    pingConexion(acronimo:string, idCc:number, protocol:string, ip:string, puerto:number){
        const headers = new HttpHeaders({
            'X-Tenant-Id': acronimo
        });
        return this.httpClient.post<IGenericInterface<any>>(`${this.urlNacion}/ping`, 
            { 
                idCentroComputo: idCc,
                protocolo:protocol,
                ip:ip,
                puerto:puerto
            }, 
            {headers});
    }

    actualizarEstado(acronimo:string, idCc:number, activo:boolean){
        const headers = new HttpHeaders({
            'X-Tenant-Id': acronimo
        });
        return this.httpClient.put<IGenericInterface<any>>(`${this.urlNacion}/activar`, 
            { 
                idCentroComputo: idCc, 
                activar: activo
            }, 
            {headers});
    }

}