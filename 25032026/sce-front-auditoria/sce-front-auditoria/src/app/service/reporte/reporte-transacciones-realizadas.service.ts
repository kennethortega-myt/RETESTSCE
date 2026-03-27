import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroListarUsuarios, FiltroTransaccionesRealizadas } from 'src/app/model/reportes/transaccionesRealizadas';
import { UsuarioReporteTransaccionesBean } from 'src/app/model/usuarioReporteTransaccionesBean';
import { ReporteTransaccionesRealizadasApiService } from 'src/app/service-api/reporte/reporte-transacciones-realizadas-api.service';

@Injectable({
  providedIn: 'root'
})
export class ReporteTransaccionesRealizadasService {

  constructor(
    private readonly reporteTransaccionesRealizadasApiService: ReporteTransaccionesRealizadasApiService
  ) { }

  listarUsuarios(filtro: FiltroListarUsuarios): Observable<GenericResponseBean<Array<UsuarioReporteTransaccionesBean>>> {
    return this.reporteTransaccionesRealizadasApiService.listarUsuarios(filtro);
  }

  getReporteTransaccionesRealizadas(filtros: FiltroTransaccionesRealizadas):Observable<GenericResponseBean<string>>{
    return this.reporteTransaccionesRealizadasApiService.getReporteTransaccionesRealizadas(filtros);
  }
}
