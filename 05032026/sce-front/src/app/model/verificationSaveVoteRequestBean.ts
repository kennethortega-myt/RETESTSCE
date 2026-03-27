import {VerificationVoteItemBean} from "./verificationVoteItemBean";

export class VerificationSaveVoteRequestBean{
  token: string;
  items: Array<VerificationVoteItemBean>;
  status: number;
}
