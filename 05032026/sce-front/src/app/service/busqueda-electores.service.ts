import { Injectable } from "@angular/core";
import { BusquedaElectoresServiceApi } from "../service-api/busqueda-electores-service-api.service";
import { Observable } from "rxjs";
import { GenericResponseBean } from "../model/genericResponseBean";
import { PageResponse } from "../interface/pageResponse.interface";
import { PadronElectoralResponse } from "../interface/padronElectoralResponse.interface";
import { PadronElectoralBusqueda } from "../interface/padronElectoralBusqueda.interface";

@Injectable({
    providedIn: 'root',
})
export class BusquedaElectoresService {
    constructor(private readonly busquedaElectoresServiceApi: BusquedaElectoresServiceApi) {
    }

    buscarElectores(padronElectoralBusqueda: PadronElectoralBusqueda, page: number, size: number): Observable<GenericResponseBean<PageResponse<PadronElectoralResponse>>> {
        return this.busquedaElectoresServiceApi.buscarElectores(padronElectoralBusqueda, page, size);
    }
}
