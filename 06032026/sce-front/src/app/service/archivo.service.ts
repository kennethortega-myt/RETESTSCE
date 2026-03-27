import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import {ArchivoServiceApiService} from '../service-api/archivo-service-api.service';
import {IGenericInterface} from '../interface/general.interface';

@Injectable({
  providedIn: 'root',
})
export class ArchivoService {

  constructor(private readonly archivoServiceApiService:ArchivoServiceApiService) {}

  getBlobArchivoPdf(idfile: number): Observable<any> {
    return this.archivoServiceApiService.getBlobArchivoPdf(idfile);
  }

  getPdfBase64(idFile:number): Observable<IGenericInterface<any>> {
    return this.archivoServiceApiService.getPdfBase64(idFile);
  }

}
