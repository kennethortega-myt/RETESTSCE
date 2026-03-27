import {VerificationSignItemBean} from "./verificationSignItemBean";

export class VerificationSignSectionResponseBean{
  token: string;
  countPresident: VerificationSignItemBean;
  countSecretary: VerificationSignItemBean;
  countThirdMember: VerificationSignItemBean;
  installPresident: VerificationSignItemBean;
  installSecretary: VerificationSignItemBean;
  installThirdMember: VerificationSignItemBean;
  votePresident: VerificationSignItemBean;
  voteSecretary: VerificationSignItemBean;
  voteThirdMember: VerificationSignItemBean;
  userStatus: string;
  systemStatus: string;
  status: number;
}
