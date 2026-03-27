import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import {ReporteElectoresOmisosApiService} from '../../service-api/reporte/reporte-electores-omisos-api.service';
import {FiltroElectoresOmisosBean} from '../../model/filtroElectoresOmisosBean';

@Injectable({
    providedIn: 'root'
})
export class ReporteElectoresOmisosService {
    constructor(private readonly reporteElectoresOmisosApiService: ReporteElectoresOmisosApiService) {}

    obtenerReporteElectoresOmisosNacion(filtros: FiltroElectoresOmisosBean): Observable<GenericResponseBean<string>> {
        return this.reporteElectoresOmisosApiService.obtenerReporteElectoresOmisos(filtros);
    }
}
