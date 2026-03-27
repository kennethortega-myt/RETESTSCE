import {SafeUrl} from "@angular/platform-browser";

export class VerificationLeSectionItemBean{
  idPadron: number;
  archivoSeccion: number;
  orden: number;
  huella: boolean;
  firma: boolean;
  noVoto: boolean;
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  asistioUser: string;
  asistioAutomatico: string;
  archivoSeccionPng?: SafeUrl;
}
