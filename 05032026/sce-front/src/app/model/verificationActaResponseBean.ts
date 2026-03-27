import {VerificationSignSectionResponseBean} from "./verificationSignSectionResponseBean";
import {VerificationVoteSectionResponseBean} from "./verificationVoteSectionResponseBean";
import {VerificationObservationSectionResponseBean} from "./verificationObservationSectionResponseBean";
import {VerificationDatetimeSectionResponseBean} from "./verificationDatetimeSectionResponseBean";
import {VerificationVotePreferencialSectionResponseBean} from "./verificationVotePreferencialSectionResponseBean";

export class VerificationActaResponseBean{
  token?: string;
  estadoActa: string;
  solucionTecnologica: string;
  signSection?: VerificationSignSectionResponseBean;
  voteSection?: VerificationVoteSectionResponseBean;
  votePreferencialSection: VerificationVotePreferencialSectionResponseBean;
  observationSection?: VerificationObservationSectionResponseBean;
  dateSectionResponse?: VerificationDatetimeSectionResponseBean;
}
