import {VerificationVoteItemBean} from '../model/verificationVoteItemBean';

export interface IPaso2FormGroupStrategy {
  configurarFormControls(agrupacionesPoliticas: VerificationVoteItemBean[], cantVotosPrefe: number): void;
}
