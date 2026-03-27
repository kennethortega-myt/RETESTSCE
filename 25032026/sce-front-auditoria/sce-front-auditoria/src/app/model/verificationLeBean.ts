import {VerificationLePaginaItemBean} from "./verificationLePaginaItemBean";

export class VerificationLeBean{
  mesaId: number;
  type: string;
  mesa: string;
  estadoMesa :string;
  electoresHabiles: number;
  electoresAusentes: number;
  electoresOmisos: number;
  localVotacion: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  paginas: VerificationLePaginaItemBean[];
  estadoLe: string;
}
