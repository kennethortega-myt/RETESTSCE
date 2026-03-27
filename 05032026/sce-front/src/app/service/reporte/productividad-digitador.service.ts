import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroProductividadDigitador, UsuarioDigitador } from 'src/app/model/reportes/FiltrosProductividadDigitador';
import { ProductividadDigitadorApiService } from 'src/app/service-api/reporte/productividad-digitador-api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductividadDigitadorService {

  constructor(private readonly productividadDigitadorApiService: ProductividadDigitadorApiService) { }

  getReporteProductividadDigitadorPdf(filtros: FiltroProductividadDigitador, acronimo: string): Observable<GenericResponseBean<string>>{
    return this.productividadDigitadorApiService.getReporteProductividadDigitadorPdf(filtros, acronimo);
  }

  getUsuariosDigitador(acronimo: string, idCentroComputo: number): Observable<GenericResponseBean<UsuarioDigitador[]>>{
    return this.productividadDigitadorApiService.getUsuariosDigitador(acronimo, idCentroComputo);
  }
}
