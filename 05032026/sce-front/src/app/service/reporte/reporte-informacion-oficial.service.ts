import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import { FiltroReporteInformacionOficial } from "src/app/model/reportes/filtroReporteInformacionOficial";
import { ReporteInformacionOficialBean } from "src/app/model/reportes/reporteInformacionOficialBean";
import { ReporteInformacionOficialApiService } from "src/app/service-api/reporte/reporte-informe-oficial-api.service";

@Injectable({
    providedIn: 'root'
})
export class ReporteInformacionOficialService {
    constructor(private readonly reporteInformacionOficialApiService: ReporteInformacionOficialApiService) { }

    obtenerReporteInformacionOficialNacion(filtros: FiltroReporteInformacionOficial): Observable<GenericResponseBean<string>> {
        return this.reporteInformacionOficialApiService.obtenerReporteInformacionOficialNacion(filtros);
    }
    consultaInformacionOficialNacion(filtros: FiltroReporteInformacionOficial): Observable<GenericResponseBean<Array<ReporteInformacionOficialBean>>> {
        return this.reporteInformacionOficialApiService.consultaInformacionOficialNacion(filtros);
    }
}
