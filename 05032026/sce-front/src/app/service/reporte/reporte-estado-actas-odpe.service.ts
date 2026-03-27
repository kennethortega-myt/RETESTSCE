import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { EstadoActasOdpe, FiltroEstadoActasOdpe } from 'src/app/model/reportes/estado-actas-odpe';
import { ReporteEstadoActasOdpeApiService } from 'src/app/service-api/reporte/reporte-estado-actas-odpe-api.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteEstadoActasOdpeService {

  constructor(private readonly reporteEstadoActasOdpeApiService: ReporteEstadoActasOdpeApiService) { }

  getReporteEstadoActasOdpe(filtroEstadoActasOdpe: FiltroEstadoActasOdpe, acronimo:string):
        Observable<GenericResponseBean<EstadoActasOdpe>>{
        return this.reporteEstadoActasOdpeApiService.getReporteEstadoActasOdpe(filtroEstadoActasOdpe, acronimo);
      }

      getReporteEstadoActasOdpeBase64(filtroEstadoActasOdpe: FiltroEstadoActasOdpe, acronimo:string):
        Observable<GenericResponseBean<string>>{
        return this.reporteEstadoActasOdpeApiService.getReporteEstadoActasOdpeBase64(filtroEstadoActasOdpe, acronimo);
      }
}
