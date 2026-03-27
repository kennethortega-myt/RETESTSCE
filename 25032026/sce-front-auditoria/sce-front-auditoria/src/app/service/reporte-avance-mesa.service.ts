import {Injectable} from "@angular/core";
import {ReporteAvanceMesaServiceApi} from "../service-api/reporte-avance-mesa-service-api.service";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {FiltroAvanceMesaBean} from "../model/filtroAvanceMesaBean";

@Injectable({
  providedIn: 'root',
})
export class ReporteAvanceMesaService{
  constructor(private readonly reporteAvanceMesaServiceApi: ReporteAvanceMesaServiceApi) {
  }

  getReporteAvanceMesaPdf(filtroAvanceMesaBean: FiltroAvanceMesaBean):Observable<GenericResponseBean<string>>{
    return this.reporteAvanceMesaServiceApi.getReporteAvanceMesaPdf(filtroAvanceMesaBean);
  }
}
