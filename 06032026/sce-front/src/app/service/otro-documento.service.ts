import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import {DetOtroDocumentoDto, OtroDocumentoDto, ResumenOtroDocumentoDto} from '../model/denuncias/denuncia-bean';
import {OtroDocumentoServiceApiService} from '../service-api/otro-documento-service-api.service';
import {IGenericInterface} from '../interface/general.interface';

@Injectable({
  providedIn: 'root',
})
export class OtroDocumentoService {

  constructor(private readonly otroDocumentoServiceApiService:OtroDocumentoServiceApiService) {}

  listarControlDigtalOtrosDocumentos(abreviaturaDocumento:string): Observable<Array<OtroDocumentoDto>>{
    return this.otroDocumentoServiceApiService.listarControlDigtalOtrosDocumentos(abreviaturaDocumento);
  }

  actualizarEstadoDigitalizacion(idOtroDocumento:number, estadoDigitalizacion:string): Observable<IGenericInterface<any>>{
    return this.otroDocumentoServiceApiService.actualizarEstadoDigitalizacion(idOtroDocumento, estadoDigitalizacion);
  }

  resumen(numeroDocumento:string , estadoDocumento:string, estadoDigitalizacion:string): Observable<IGenericInterface<ResumenOtroDocumentoDto>>{
    return this.otroDocumentoServiceApiService.resumen(numeroDocumento, estadoDocumento, estadoDigitalizacion);
  }

  validarMesaParaAsociacion(d:DetOtroDocumentoDto): Observable<IGenericInterface<boolean>> {
    return this.otroDocumentoServiceApiService.validarMesaParaAsociacion(d);
  }

  registrarAsociacion(documentoDto :OtroDocumentoDto){
    return this.otroDocumentoServiceApiService.registrarAsociacion(documentoDto);
  }

  procesarAsociacion(documentoDto :OtroDocumentoDto) {
    return this.otroDocumentoServiceApiService.procesarAsociacion(documentoDto);
  }

  anularDocumento(documentoDto :OtroDocumentoDto) {
    return this.otroDocumentoServiceApiService.anularDocumento(documentoDto);
  }
}
