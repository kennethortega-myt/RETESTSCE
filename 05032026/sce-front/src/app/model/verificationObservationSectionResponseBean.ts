import {VerificationObservationBean} from "./verificationObservationBean";

export class VerificationObservationSectionResponseBean{
  token: string;
  count: VerificationObservationBean;
  install: VerificationObservationBean;
  vote: VerificationObservationBean;

  nullityRequest: boolean;
  noData: boolean;
  status: number;
}
