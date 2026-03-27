import {Injectable} from "@angular/core";
import {FiltroAvanceEstadoActaBean} from "../model/filtroAvanceEstadoActaBean";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {AvanceEstadoActaReporteBean} from "../model/avanceEstadoActaReporteBean";
import {ReporteAvanceEstadoActasApi} from "../service-api/reporte-avance-estado-actas-api.service";

@Injectable({
  providedIn: 'root',
})
export class ReporteAvanceEstadoActasService {

  constructor(private readonly reporteAvanceEstadoActasApi:ReporteAvanceEstadoActasApi) {
  }
  getReporteAvanceEstadoActa(filtroAvanceEstadoActaBean: FiltroAvanceEstadoActaBean):
    Observable<GenericResponseBean<AvanceEstadoActaReporteBean>>{
    return this.reporteAvanceEstadoActasApi.getReporteAvanceEstadoActa(filtroAvanceEstadoActaBean);
  }

  getReporteAvanceEstadoActaBase64(filtroAvanceEstadoActaBean: FiltroAvanceEstadoActaBean):
    Observable<GenericResponseBean<string>>{
    return this.reporteAvanceEstadoActasApi.getReporteAvanceEstadoActaBase64(filtroAvanceEstadoActaBean);
  }
}
