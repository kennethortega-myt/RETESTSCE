import {SafeUrl} from "@angular/platform-browser";

export class VerificationMmSectionItemBean{
  idPadron: number;
  idMiembroMesaSorteado: string
  archivoSeccion: number;
  cargo: number;
  firma: boolean;
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  asistioUser: string;
  asistioAutomatico: string;
  archivoSeccionPng?: SafeUrl;
  estado:number;
}
