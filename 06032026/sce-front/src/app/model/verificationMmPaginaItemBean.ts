import {VerificationMmSectionItemBean} from "./verificationMmSectionItemBean";
import {SafeUrl} from "@angular/platform-browser";

export class VerificationMmPaginaItemBean{
  pagina: number;
  archivoObservacion: number;
  textoObservacionesUser: string;
  archivoObservacionPng?: SafeUrl;
  secciones: VerificationMmSectionItemBean[];
  tipoDenuncia?: string;
}
