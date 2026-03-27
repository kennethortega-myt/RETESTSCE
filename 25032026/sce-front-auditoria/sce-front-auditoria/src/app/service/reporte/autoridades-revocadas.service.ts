import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroAutoridadesRevocadas } from 'src/app/model/reportes/filtro-autoridades-revocadas';
import { AutoridadesRevocadasApiService } from 'src/app/service-api/reporte/autoridades-revocadas-api.service';

@Injectable({
  providedIn: 'root'
})
export class AutoridadesRevocadasService {

  constructor(private readonly autoridadesRevocadasApiService: AutoridadesRevocadasApiService) { }

  getReporteAutoridadesRevocadas(filtros: FiltroAutoridadesRevocadas):Observable<GenericResponseBean<string>>{
      return this.autoridadesRevocadasApiService.getReporteAutoridadesRevocadas(filtros);
    }
}
