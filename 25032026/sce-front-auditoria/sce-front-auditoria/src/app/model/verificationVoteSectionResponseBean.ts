import {VerificationVoteItemBean} from "./verificationVoteItemBean";

export class VerificationVoteSectionResponseBean{
  token?: string;
  items?: Array<VerificationVoteItemBean>;
  cantidadVotosPreferenciales: number;
  autorizado: boolean;
  status: number;
}
