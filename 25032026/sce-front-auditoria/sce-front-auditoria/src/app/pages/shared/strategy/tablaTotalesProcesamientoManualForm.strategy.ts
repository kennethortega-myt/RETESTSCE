import { FormControl, FormGroup } from "@angular/forms";
import { IProcesamientoManualFormGroupStrategy } from "src/app/interface/procesamientoManualFormGroupStrategy.interface";
import { VerificationVoteItemBean } from "src/app/model/verificationVoteItemBean";

export class TablaTotalesProcesamientoManualFormStrategy implements IProcesamientoManualFormGroupStrategy{

  constructor(
      private readonly formGroupSeccionVoto: FormGroup
    ) {}

  configurarFormControls(agrupacionesPoliticas: VerificationVoteItemBean[], cantVotosPrefe: number): void {
    agrupacionesPoliticas.forEach((data, i) => {
      this.agregarControlVotoTotal(data, i);
    });

  }

  private agregarControlVotoTotal(data: VerificationVoteItemBean, i: number): void {
      const paramsGroup = this.formGroupSeccionVoto.get("params") as FormGroup;
      const controlName = `${data.fileId}-${i}`;
      const value = '';

      paramsGroup.addControl(controlName, new FormControl({
        value: value,
        disabled: false
      }));
    }

}
