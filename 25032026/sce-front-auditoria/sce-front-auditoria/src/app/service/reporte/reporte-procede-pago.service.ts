import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import {FiltroProcedePagoBean} from '../../model/filtroProcedePagoBean';
import {ReporteProcedePagoApiService} from '../../service-api/reporte/reporte-procede-pago-api.service';

@Injectable({
    providedIn: 'root'
})
export class ReporteProcedePagoService {
    constructor(private readonly reporteProcedePagoApiService: ReporteProcedePagoApiService) {}

    obtenerReporteProcedePagoNacion(filtros: FiltroProcedePagoBean): Observable<GenericResponseBean<string>> {
        return this.reporteProcedePagoApiService.obtenerReporteProcedePago(filtros);
    }
}
