import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { DigitizationGetFilesResponse } from "../model/digitizationGetFilesResponse";
import { GenericResponseBean } from "../model/genericResponseBean";
import { Constantes } from "../helper/constantes";

@Injectable({
  providedIn: 'root'
})
export class ArchivoNacionApiService {

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient) {
    this.urlServidor = environment.apiUrl+'/';
  }

  getFile(idfile: string): Observable<any> {
    return this.httpClient.get(
      this.urlServidor +'archivo-nacion/file/'+idfile,{responseType:"blob"})
      .pipe(map(res =>this.validarDescargaBlob(res)));
  }

  validarDescargaBlob(data: any) {
    if (data.type === "image/tiff" && data.size > 0) {
      return new Blob([data], { type: "image/tiff" });
    } else {
      return null;
    }
  }

  getFilesPng(idfile1: number, idfile2: number, acronimo: string): Observable<GenericResponseBean<DigitizationGetFilesResponse>> {

    const headers = new HttpHeaders({
          'X-Tenant-Id': acronimo
    });
    
    // Agrega los encabezados a las opciones de la solicitud
    const opciones = { headers: headers };

    return this.httpClient.post<GenericResponseBean<DigitizationGetFilesResponse>>(
      this.urlServidor +Constantes.CB_MONITOREO_NACION_FILES_PNG+"?acta1FileId="+idfile1+"&acta2FileId="+idfile2,
      {},
      opciones
    );
  }

}
