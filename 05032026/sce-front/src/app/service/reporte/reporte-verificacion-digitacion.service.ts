import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import { FiltroReporteVerificacionDigitacion } from "src/app/model/reportes/filtroReporteVerificacionDigitacion";
import { ReporteVerificacionDigitacionApiService } from "src/app/service-api/reporte/reporte-verificacion-digitacion-api.service";

@Injectable({
    providedIn: 'root'
})
export class ReporteVerificacionDigitacionService {
    constructor(private readonly reporteVerificacionDigitacionApiService: ReporteVerificacionDigitacionApiService) {}

    obtenerReporteVerificacionDigitacionNacion(filtros: FiltroReporteVerificacionDigitacion): Observable<GenericResponseBean<string>> {
        return this.reporteVerificacionDigitacionApiService.obtenerReporteVerificacionDigitacionNacion(filtros);
    }
}
