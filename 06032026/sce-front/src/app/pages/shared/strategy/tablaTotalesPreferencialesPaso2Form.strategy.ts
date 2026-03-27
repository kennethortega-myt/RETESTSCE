import {IPaso2FormGroupStrategy} from '../../../interface/paso2FormGroupStrategy.interface';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {VerificationVoteItemBean} from '../../../model/verificationVoteItemBean';
import {VerificationVotePreferencialItemBean} from '../../../model/verificationVotePreferencialItemBean';

export class TablaTotalesPreferencialesPaso2FormStrategy  implements IPaso2FormGroupStrategy{
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly formGroupSeccionVoto: FormGroup,
    private readonly formGroupSeccionVotoPref: FormGroup
  ) {}

  configurarFormControls(agrupacionesPoliticas: VerificationVoteItemBean[], cantVotosPrefe: number): void {
    agrupacionesPoliticas.forEach((data, i) => {
      this.agregarControlVotoTotal(data, i);
      this.configurarVotosPreferenciales(data, i, cantVotosPrefe);
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

  private configurarVotosPreferenciales(data: VerificationVoteItemBean, i: number, cantVotosPrefe: number): void {
    if (this.tieneVotosPreferenciales(data)) {
      this.agregarControlesVotosPreferenciales(data, i);
    } else {
      this.agregarControlesSinVotosPreferenciales(i, cantVotosPrefe);
    }
  }

  private tieneVotosPreferenciales(data: VerificationVoteItemBean): boolean {
    return data.votoPreferencial != null && data.votoPreferencial.length > 0;
  }

  private agregarControlesVotosPreferenciales(data: VerificationVoteItemBean, i: number): void {
    data.votoPreferencial?.forEach((dataPref: VerificationVotePreferencialItemBean, j: number) => {
      const paramsGroup = this.formGroupSeccionVotoPref.get("params") as FormGroup;
      const controlName = `${dataPref.fileId}-${i}-${j}`;
      const value = dataPref.fileId == null ? '': dataPref.userValue;

      paramsGroup.addControl(controlName, new FormControl({
        value: value,
        disabled: false
      }));
    });
  }

  private agregarControlesSinVotosPreferenciales(i: number, cantVotosPrefe: number): void {
    for (let j = 0; j < cantVotosPrefe; j++) {
      const paramsGroup = this.formGroupSeccionVotoPref.get("params") as FormGroup;
      const controlName = `sinVotPref-${i}-${j}`;

      paramsGroup.addControl(controlName, new FormControl({
        value: '',
        disabled: false
      }));
    }
  }
}
