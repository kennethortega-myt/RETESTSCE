import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import {FiltroOmisosAusentismoBean} from '../../model/filtroOmisosAusentismoBean';
import {ReporteOmisosAusentismoApiService} from '../../service-api/reporte/reporte-omisos-ausentismo-api.service';

@Injectable({
    providedIn: 'root'
})
export class ReporteOmisosAusentismoService {

    constructor(private readonly reporteOmisosAusentismoApiService: ReporteOmisosAusentismoApiService) {}

    obtenerReporteOmisosAusentismo(filtros: FiltroOmisosAusentismoBean, acronimo: string): Observable<GenericResponseBean<string>> {
        return this.reporteOmisosAusentismoApiService.obtenerReporteOmisosAusentismo(filtros, acronimo);
    }

}
