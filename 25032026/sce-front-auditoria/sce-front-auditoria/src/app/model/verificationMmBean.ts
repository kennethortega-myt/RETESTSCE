import {VerificationMmPaginaItemBean} from "./verificationMmPaginaItemBean";

export class VerificationMmBean{
  mesaId: number;
  type: string;
  mesa: string;
  estadoMesa:string;
  electoresHabiles: number;
  electoresAusentes: number;
  electoresOmisos: number;
  localVotacion: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  paginas: VerificationMmPaginaItemBean[];
}
