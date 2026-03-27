import { VerificationVoteItemBean } from "../model/verificationVoteItemBean";

export interface IProcesamientoManualFormGroupStrategy {
  configurarFormControls(agrupacionesPoliticas: VerificationVoteItemBean[], cantVotosPrefe: number): void;
}
