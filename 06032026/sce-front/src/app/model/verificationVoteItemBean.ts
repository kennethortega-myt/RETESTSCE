import {VerificationVotePreferencialItemBean} from "./verificationVotePreferencialItemBean";

export class  VerificationVoteItemBean{
  position: number;
  positionToken: string;
  fileId: number;
  systemValue: string;
  userValue: string;
  nombreAgrupacionPolitica: string;
  estado: number;
  filePngUrl?: string;
  isEditable?: boolean;
  votoPreferencial: Array<VerificationVotePreferencialItemBean>;
  votoRevocatoria?: Array<VerificationVotePreferencialItemBean>;

}
