import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import { FiltroReporteAuditoriaDigitacion } from "src/app/model/reportes/filtroReporteAuditoriaDigitacion";
import { ReporteAuditoriaDigitacionApiService } from "src/app/service-api/reporte/reporte-auditoria-digitacion-api.service";

@Injectable({
    providedIn: 'root'
})
export class ReporteAuditoriaDigitacionService {
    constructor(private readonly reporteAuditoriaDigitacionApiService: ReporteAuditoriaDigitacionApiService) {}

    obtenerReporteAuditoriaDigitacionNacion(filtros: FiltroReporteAuditoriaDigitacion): Observable<GenericResponseBean<string>> {
        return this.reporteAuditoriaDigitacionApiService.obtenerReporteAuditoriaDigitacionNacion(filtros);
    }
}
