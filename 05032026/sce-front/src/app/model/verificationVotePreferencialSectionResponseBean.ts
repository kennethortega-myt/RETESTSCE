import {VerificationVotePreferenciaRowItemBean} from "./verificationVotePreferenciaRowItemBean";

export class VerificationVotePreferencialSectionResponseBean{
  token: string;
  cantidadEscanios: number;
  items: Array<VerificationVotePreferenciaRowItemBean>;
}
