import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {AnexosApiService} from "../service-api/anexos-api.service";
import {AnexoRequestDto} from "../interface/anexos.interface";

@Injectable({
  providedIn: 'root'
})
export class AnexosService {

  constructor(private readonly anexosApiService: AnexosApiService) {

  }


  anexo1(data: AnexoRequestDto): Observable<any>{
    return this.anexosApiService.anexo1(data);
  }

  votos(data: AnexoRequestDto): Observable<any>{
    return this.anexosApiService.votos(data);
  }

  votosCifras(data: AnexoRequestDto): Observable<any>{
    return this.anexosApiService.votosCifras(data);
  }

  tablaActas(data: AnexoRequestDto): Observable<any>{
    return this.anexosApiService.tablaActas(data);
  }

  mesasNoinstaladas(data: AnexoRequestDto): Observable<any>{
    return this.anexosApiService.mesasNoinstaladas(data);
  }

  maestraOrganizacionPolitica(data: AnexoRequestDto): Observable<any>{
    return this.anexosApiService.maestraOrganizacionPolitica(data);
  }

  maestroUbigeo(data: AnexoRequestDto): Observable<any>{
    return this.anexosApiService.maestroUbigeo(data);
  }

  odpe(data: AnexoRequestDto): Observable<any>{
    return this.anexosApiService.odpe(data);
  }

  anexo2(data: AnexoRequestDto): Observable<any>{
    return this.anexosApiService.anexo2(data);
  }

  all(data: AnexoRequestDto): Observable<any>{
    return this.anexosApiService.total(data);
  }


}
