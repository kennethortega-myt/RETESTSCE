import { Injectable } from '@angular/core';
import {FiltroAvanceMesaBean} from "../model/filtroAvanceMesaBean";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {ReporteAvanceMesaNacionApiService} from "../service-api/reporte-avance-mesa-nacion-api.service";
import {FiltroAvanceEstadoActaBean} from "../model/filtroAvanceEstadoActaBean";
import {AvanceEstadoActaReporteBean} from "../model/avanceEstadoActaReporteBean";

@Injectable({
  providedIn: 'root'
})
export class ReporteAvanceMesaNacionService {

  constructor(private readonly reporteAvanceMesaServiceApi: ReporteAvanceMesaNacionApiService) {
  }

  getReporteAvanceMesaPdf(filtroAvanceMesaBean: FiltroAvanceMesaBean):Observable<GenericResponseBean<string>>{
    return this.reporteAvanceMesaServiceApi.getReporteAvanceMesaPdf(filtroAvanceMesaBean);
  }

  getReporteAvanceEstadoActa(filtroAvanceEstadoActaBean: FiltroAvanceEstadoActaBean, acronimo:string):
    Observable<GenericResponseBean<AvanceEstadoActaReporteBean>>{
    return this.reporteAvanceMesaServiceApi.getReporteAvanceEstadoActa(filtroAvanceEstadoActaBean, acronimo);
  }

  getReporteAvanceEstadoActaBase64(filtroAvanceEstadoActaBean: FiltroAvanceEstadoActaBean, acronimo:string):
    Observable<GenericResponseBean<string>>{
    return this.reporteAvanceMesaServiceApi.getReporteAvanceEstadoActaBase64(filtroAvanceEstadoActaBean,acronimo);
  }
}
