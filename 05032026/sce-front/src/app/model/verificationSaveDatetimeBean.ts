import {VerificationDatetimeItemBean} from "./verificationDatetimeItemBean";
import {VerificationDatetimeTotalBean} from "./verificationDatetimeTotalBean";

export class VerificationSaveDatetimeBean{
  token: string;
  status: number;
  start: VerificationDatetimeItemBean;
  end: VerificationDatetimeItemBean;
  total: VerificationDatetimeTotalBean;


}
