import { Injectable } from "@angular/core";
import { FiltroReporteRelacionPuestaCero } from "src/app/model/reportes/filtroReporteRelacionPuestaCero";
import { ReporteRelacionPuestaCeroApiService } from "src/app/service-api/reporte/reporte-relacion-puesta-cero-api.service";

@Injectable({
    providedIn: 'root'
})
export class ReporteRelacionPuestoCeroService {
    constructor(private readonly reporteRelacionPuestoCeroApiService: ReporteRelacionPuestaCeroApiService){}

    obtenerReporteRelacionPuestoCeroNacion(filtros: FiltroReporteRelacionPuestaCero) {
        return this.reporteRelacionPuestoCeroApiService.obtenerReporteRelacionPuestaCero(filtros);
    }

    consultaReporteRelacionPuestoCeroNacion(filtros: FiltroReporteRelacionPuestaCero, acronimo: string) {
        return this.reporteRelacionPuestoCeroApiService.consultaReporteRelacionPuestaCero(filtros, acronimo);
    }
}
