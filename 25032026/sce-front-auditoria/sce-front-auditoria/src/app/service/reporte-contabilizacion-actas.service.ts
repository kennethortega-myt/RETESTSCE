import {Injectable} from "@angular/core";
import {ReporteContabilizacionActasServiceApi} from "../service-api/reporte-contabilizacion-actas-service-api.service";
import {FiltroContabilizacionActaBean} from "../model/filtroContabilizacionActaBean";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {ActaContabilizadaResumenReporteBean} from "../model/actaContabilizadaResumenReporteBean";

@Injectable({
  providedIn: 'root',
})
export class ReporteContabilizacionActasService{
  constructor(private readonly reporteContabilizacionActasServiceApi: ReporteContabilizacionActasServiceApi) {
  }

  getReporteContabilizacionActa(filtroContabilizacionActaBean:FiltroContabilizacionActaBean):
    Observable<GenericResponseBean<ActaContabilizadaResumenReporteBean>>{
    return this.reporteContabilizacionActasServiceApi.getReporteContabilizacionActa(filtroContabilizacionActaBean);
  }
  getReporteContabilizacionActaBase64(filtroContabilizacionActaBean:FiltroContabilizacionActaBean):
    Observable<GenericResponseBean<string>>{
    return this.reporteContabilizacionActasServiceApi.getReporteContabilizacionActaBase64(filtroContabilizacionActaBean);
  }

  getPorcentajeActaContabilizada(idEleccion:string):Observable<GenericResponseBean<number>>{
    return this.reporteContabilizacionActasServiceApi.getPorcentajeActaContabilizada(idEleccion);
  }
}
