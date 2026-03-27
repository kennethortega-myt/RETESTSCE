import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {VerificationVoteItemBean} from '../../../model/verificationVoteItemBean';
import {
  IPaso2FormGroupStrategy
} from '../../../interface/paso2FormGroupStrategy.interface';

export class PresidencialPaso2FormStrategy implements IPaso2FormGroupStrategy{

  constructor(
    private readonly formBuilder: FormBuilder,
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
    const value = data.fileId == null ? '': data.userValue;

    paramsGroup.addControl(controlName, new FormControl({
      value: value,
      disabled: false
    }));
  }
}
