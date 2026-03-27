import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Constantes } from "../helper/constantes";
import {AuthService} from "../service/auth-service.service";
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {IGenericInterface} from '../interface/general.interface';

@Injectable({
  providedIn: 'root',
})
export class ArchivoServiceApiService {

  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService,) {
    this.urlServidor = environment.apiUrlORC;
  }

  validarDescargaBlob(data: any) {
    if (data.type === "image/tiff" && data.size > 0) {
      return new Blob([data], { type: "image/tiff" });
    } else {
      return null;
    }
  }

  getBlobArchivoPdf(idfile: number): Observable<any> {
    return this.httpClient.get(
      this.urlServidor +Constantes.CB_DIGITIZATION_CONTROLLER_FILES_PDF+"/"+idfile,{responseType:"blob"})
      .pipe(map(res =>this.validarDescargaBlobPDF(res)));
  }

  validarDescargaBlobPDF(data: any) {
    if (data.type === "application/pdf" && data.size > 0) {
      return new Blob([data], { type: "application/pdf" });
    } else {
      return null;
    }
  }

  getPdfBase64(idfile: number): Observable<IGenericInterface<any>> {
    return this.httpClient.get<IGenericInterface<any>>(
      `${this.urlServidor}${Constantes.CB_DIGITIZATION_CONTROLLER_FILES_PDF_BASE64}/${idfile}`,
      {
        headers: {
          Authorization: `Bearer ${this.auth.getCToken()}`
        }
      }
    );
  }

}
