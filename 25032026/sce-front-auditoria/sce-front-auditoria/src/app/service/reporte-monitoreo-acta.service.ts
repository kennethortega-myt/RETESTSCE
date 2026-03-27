import {Injectable} from "@angular/core";
import {ReporteMonitoreoActaApi} from "../service-api/reporte-monitoreo-acta-api.service";
import {Observable} from "rxjs";
import {ReporteMonitoreoActasBean} from "../model/reporteMonitoreoActasBean";

@Injectable({
  providedIn: 'root',
})
export class ReporteMonitoreoActaService{

  constructor(private readonly reporteMonitoreoActaApi: ReporteMonitoreoActaApi) {
  }

  getReporteMonitoreoActa(numeroMesa: string): Observable<ReporteMonitoreoActasBean>{
    return this.reporteMonitoreoActaApi.getReporteMonitoreoActa(numeroMesa);
  }
}
