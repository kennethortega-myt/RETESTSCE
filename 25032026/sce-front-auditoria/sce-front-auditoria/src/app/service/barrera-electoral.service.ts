import { Injectable } from '@angular/core';
import { BarreraElectoralApiService } from '../service-api/barrera-electoral-api.service';
import { FiltroBarreraElectoral } from '../model/reportes/barrera-electoral';
import { Observable } from 'rxjs';
import { GenericResponseBean } from '../model/genericResponseBean';

@Injectable({
  providedIn: 'root'
})
export class BarreraElectoralService {

  constructor(private readonly barreraElectoralApiService: BarreraElectoralApiService) { }

  obtenerBarreraElectoralPDF(acronimo: string, filtros: FiltroBarreraElectoral): Observable<GenericResponseBean<string>> {
    return this.barreraElectoralApiService.obtenerBarreraElectoralPDF(acronimo, filtros);
  }
}
