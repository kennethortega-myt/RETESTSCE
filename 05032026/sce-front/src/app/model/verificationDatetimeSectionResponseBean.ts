import {VerificationDatetimeItemBean} from "./verificationDatetimeItemBean";
import {VerificationDatetimeTotalBean} from "./verificationDatetimeTotalBean";

export class VerificationDatetimeSectionResponseBean{
  token?: string;
  start?: VerificationDatetimeItemBean;
  end?: VerificationDatetimeItemBean;
  total?: VerificationDatetimeTotalBean;

}
