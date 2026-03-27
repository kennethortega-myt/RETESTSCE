import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroAsistencia } from 'src/app/model/reportes/asistencia';
import { ListaParticipantesApiService } from 'src/app/service-api/reporte/lista-participantes-api.service';

@Injectable({
  providedIn: 'root'
})
export class ListaParticipantesService {

  constructor(private readonly listaParticipantesApiService: ListaParticipantesApiService) { }

  getReporteListaParticipantesNacion(filtros: FiltroAsistencia, acronimo: string):Observable<GenericResponseBean<string>>{
    return this.listaParticipantesApiService.getReporteListaParticipantesNacion(filtros, acronimo);
  }
}
