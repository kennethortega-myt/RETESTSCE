import {VerificationLeSectionItemBean} from "./verificationLeSectionItemBean";
import {SafeUrl} from "@angular/platform-browser";

export class VerificationLePaginaItemBean{
  pagina: number;
  secciones: VerificationLeSectionItemBean[];
  archivoObservacion: number;
  textoObservacionesUser: string;
  archivoObservacionPng?: SafeUrl;
  existeObservacion?: boolean;
  tipoDenuncia?: string;
}
