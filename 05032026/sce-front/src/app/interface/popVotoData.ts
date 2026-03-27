import {VerificationVoteItemBean} from "../model/verificationVoteItemBean";

export interface PopVotoData{
  filePng: string;
  inputValue: string;
  systemValue: string;
  indexI: number;
  indexJ: number;
  votos: Array<VerificationVoteItemBean>;
  fileId: number;
  cantVotosPref: number;
}
