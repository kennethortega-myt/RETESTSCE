import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GenericRequestInterface, IGenericInterface} from "../interface/general.interface";
import {ConfiguracionProcesoElectoralInterface} from "../interface/configuracionProcesoElectoral.interface";
import {AuthService} from "../service/auth-service.service";

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionProcesoElectoralService {

  baseUrl = environment.apiUrl+'/configuracionProcesoElectoral';
  constructor(private readonly http: HttpClient,public auth: AuthService) { }


  update(data:ConfiguracionProcesoElectoralInterface, doc:File){
    const form = new FormData();
    form.append('file', doc, doc.name);
    form.append('data',JSON.stringify(data));
    return this.http.put<IGenericInterface<any>>(`${this.baseUrl}`,form);
  }

  save(data:ConfiguracionProcesoElectoralInterface){
    return this.http.post<IGenericInterface<any>>(`${this.baseUrl}`,data);
  }

  listProcesoElectoral(){
    return this.http.get<IGenericInterface<Array<ConfiguracionProcesoElectoralInterface>>>(`${this.baseUrl}`);
  }

  eliminarProceso(data: GenericRequestInterface){
    return this.http.put<IGenericInterface<any>>(`${this.baseUrl}/eliminarProceso`,data);
  }

  cargaDatos(idProceso: number,nombreEsquemaPrincipal:string,nombreEsquemaBdOnpe:string, nombreDbLink:string, acronimo:string){
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo,
      'Authorization': "Bearer " + this.auth.getCToken()
    });
    const opciones = { headers: headers };
    return this.http.post<IGenericInterface<any>>(`${this.baseUrl}/cargaData`,{idProceso,nombreEsquemaBdOnpe,nombreDbLink,nombreEsquemaPrincipal}, opciones);
  }

  cargarUsuarios(acronimo: string, clave:string){
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo,
      'Authorization': "Bearer " + this.auth.getCToken()
    });
    const opciones = { headers: headers };
    return this.http.post<IGenericInterface<any>>(`${this.baseUrl}/cargar-usuarios`,{clave},opciones);
  }
  updatePrincipal(esquema: string,id:number){
    const headers = new HttpHeaders({
      'Authorization': "Bearer " + this.auth.getCToken()
    });
    const opciones = { headers: headers };
    return this.http.post<IGenericInterface<any>>(`${this.baseUrl}/principal`,{idProceso:id,nombreEsquemaBdOnpe:'',nombreDbLink:'',nombreEsquemaPrincipal:esquema},opciones);
  }

  listTipoEleccionEscrutinio(esquema: string,idEleccion:number) {
    const headers = new HttpHeaders({
      'Authorization': "Bearer " + this.auth.getCToken()
    });
    const opciones = { headers: headers };
    return this.http.post<IGenericInterface<any>>(`${this.baseUrl}/list-tipo-eleccion-escrutinio`,{esquema,idEleccion},opciones);

  }

  updateTipoDocumentoEscrutinio(data: any, acronimo){
    const headers = new HttpHeaders({
      'X-Tenant-Id': acronimo,
      'Authorization': "Bearer " + this.auth.getCToken()
    });
    const opciones = { headers: headers };
    return this.http.put<IGenericInterface<any>>(`${this.baseUrl}/update-tipo-eleccion-escrutinio`,{detalles: data},opciones);
  }

}
