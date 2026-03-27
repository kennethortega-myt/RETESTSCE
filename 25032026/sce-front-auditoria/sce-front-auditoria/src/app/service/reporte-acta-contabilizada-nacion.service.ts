import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {ReporteActaContabilizadaNacionApiService} from "../service-api/reporte-acta-contabilizada-nacion-api.service";

@Injectable({
  providedIn: 'root'
})
export class ReporteActaContabilizadaNacionService {

  constructor(private readonly reporteActaServiceApi: ReporteActaContabilizadaNacionApiService) {

  }


  getPorcentajeActaContabilizada(idEleccion:string):Observable<GenericResponseBean<number>>{
    return this.reporteActaServiceApi.getPorcentajeActaContabilizada(idEleccion);
  }
}
