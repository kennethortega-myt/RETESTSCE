import {VerificationSignItemBean} from "./verificationSignItemBean";

export class VerificationSaveSignRequestBean{
  token: string;

  countPresident?: VerificationSignItemBean;
  countSecretary?: VerificationSignItemBean;
  countThirdMember?: VerificationSignItemBean;

  installPresident?: VerificationSignItemBean;
  installSecretary?: VerificationSignItemBean;
  installThirdMember?: VerificationSignItemBean;

  votePresident?: VerificationSignItemBean;
  voteSecretary?: VerificationSignItemBean;
  voteThirdMember?: VerificationSignItemBean;

  userStatus?: string;
  systemStatus?: string;
  status?: number;
}
