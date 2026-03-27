import {VerificationSaveSignRequestBean} from "./verificationSaveSignRequestBean";
import {VerificationSaveVoteRequestBean} from "./verificationSaveVoteRequestBean";
import {VerificationSaveDatetimeBean} from "./verificationSaveDatetimeBean";
import {VerificationSaveObservationRequestBean} from "./verificationSaveObservationRequestBean";
import {VerificationVotePreferencialSectionResponseBean} from "./verificationVotePreferencialSectionResponseBean";

export class VerificationActaRequestBean{
  token: string;
  signSection: VerificationSaveSignRequestBean;
  voteSection: VerificationSaveVoteRequestBean;
  votePreferencialSection: VerificationVotePreferencialSectionResponseBean;
  observationSection: VerificationSaveObservationRequestBean;
  dateSectionResponse: VerificationSaveDatetimeBean;
}
