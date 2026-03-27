import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Constantes } from "src/app/helper/constantes";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import { FiltroReporteVerificacionDigitacion } from "src/app/model/reportes/filtroReporteVerificacionDigitacion";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ReporteVerificacionDigitacionApiService {
    private readonly urlServidorNacion: string;

    constructor(private readonly httpClient: HttpClient) {
        this.urlServidorNacion = environment.apiUrl;
    }

    obtenerReporteVerificacionDigitacionNacion(filtros: FiltroReporteVerificacionDigitacion): Observable<GenericResponseBean<string>> {
            return this.httpClient.post<GenericResponseBean<string>>(
                `${this.urlServidorNacion}/${Constantes.CB_REPORTE_REPORTE_VERIFICACION_DIGITACION_POST_BASE64}`, filtros);
        }

}
