import {VerificationObservationItemBean} from "./verificationObservationItemBean";

export class VerificationSaveObservationRequestBean{
  token: string;
  count: VerificationObservationItemBean;
  install: VerificationObservationItemBean;
  vote: VerificationObservationItemBean;

  nullityRequest: boolean;
  status: number;
}
