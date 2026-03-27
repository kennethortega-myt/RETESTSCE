import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ActaPorCorregirBean} from '../../../model/actaPorCorregirBean';
import {MessageActasCorregirService} from '../../../message/message-actas-corregir.service';
import {IAgrupacionPolitica} from '../../../interface/agrupacionPolitica.interface';
import {IVotoData} from '../../../interface/votoData.interface';
import {IFormGroupStrategy} from '../../../interface/formGroupStrategy.interface';

export class PreferencialFormStrategy implements IFormGroupStrategy {
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly formGroupSeccionVoto: FormGroup,
    private readonly formGroupSeccionVotoPref: FormGroup,
    private readonly actaPorCorregirBean: ActaPorCorregirBean,
    private readonly messageService: MessageActasCorregirService
  ) {
  }

  configurarFormControls(agrupacionesPoliticas: IAgrupacionPolitica[], cantVotosPrefe: number): void {
    agrupacionesPoliticas.forEach((data, i) => {
      this.agregarControlVotoTotal(data, i);
      this.configurarVotosPreferenciales(data, i, cantVotosPrefe);
    });
  }

  private agregarControlVotoTotal(data: IAgrupacionPolitica, i: number): void {
    const paramsGroup = this.formGroupSeccionVoto.get("params") as FormGroup;
    const controlName = `${data.idDetActa}-${i}`;
    const value = data.terceraDigitacion !== "null" ? data.terceraDigitacion : "";

    paramsGroup.addControl(controlName, new FormControl({
      value: value,
      disabled: false
    }));
  }

  private configurarVotosPreferenciales(data: IAgrupacionPolitica, i: number, cantVotosPrefe: number): void {
    if (this.tieneVotosPreferenciales(data)) {
      this.agregarControlesVotosPreferenciales(data, i);
    } else {
      this.agregarControlesSinVotosPreferenciales(i, cantVotosPrefe);
    }
  }

  private tieneVotosPreferenciales(data: IAgrupacionPolitica): boolean {
    return data.votosPreferenciales != null && data.votosPreferenciales.length > 0;
  }

  private agregarControlesVotosPreferenciales(data: IAgrupacionPolitica, i: number): void {
    data.votosPreferenciales?.forEach((dataPref: IVotoData, j: number) => {
      const paramsGroup = this.formGroupSeccionVotoPref.get("params") as FormGroup;
      const controlName = `${dataPref.idDetActaPreferencial}-${i}-${j}`;
      const value = dataPref.terceraDigitacion !== "null" ? dataPref.terceraDigitacion : "";

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

  changeVoto(fileId: number, i: number, j?: number): void {
    if (j !== undefined) {
      // Usando optional chaining sin aserciones
      const votoPreferencial = this.actaPorCorregirBean.agrupacionesPoliticas[i]?.votosPreferenciales?.[j];
      if (votoPreferencial) {
        const valor = this.formGroupSeccionVotoPref.get("params")?.get(`${fileId}-${i}-${j}`)?.value;
        votoPreferencial.terceraDigitacion = valor;
      }
    } else {
      // Usando optional chaining sin aserciones
      const agrupacion = this.actaPorCorregirBean.agrupacionesPoliticas[i];
      if (agrupacion) {
        const valor = this.formGroupSeccionVoto.get("params")?.get(`${fileId}-${i}`)?.value;
        agrupacion.terceraDigitacion = valor;
      }
    }

    this.messageService.setDataActaPorCorregirBean(this.actaPorCorregirBean);
  }

  pasarVotosNulos(isChecked: boolean): void {
    this.actaPorCorregirBean.agrupacionesPoliticas.forEach((votoItem, i) => {
      // Manejar voto total
      if (votoItem.primeraDigitacion !== 'null' && votoItem.idDetActa !== -1) {
        const controlKey = `${votoItem.idDetActa}-${i}`;
        const control = this.formGroupSeccionVoto.get('params.' + controlKey) as FormControl;
        this.manejarControlVoto(control, votoItem, isChecked);
      }

      // Manejar votos preferenciales
      if (votoItem.votosPreferenciales && votoItem.votosPreferenciales.length > 0) {
        votoItem.votosPreferenciales.forEach((votoPref, j) => {
          if (votoPref.primeraDigitacion !== 'null' && votoItem.idDetActa !== -1) {
            const prefControlKey = `${votoPref.idDetActaPreferencial}-${i}-${j}`;
            const prefControl = this.formGroupSeccionVotoPref.get('params.' + prefControlKey) as FormControl;
            this.manejarControlVoto(prefControl, votoPref, isChecked);
          }
        });
      }
    });
  }

  private manejarControlVoto(control: FormControl, voto: IVotoData, isChecked: boolean): void {
    if (control) {
      if (isChecked) {
        control.setValue('0');
        control.disable();
        voto.terceraDigitacion = '0';
      } else {
        control.enable();
        voto.terceraDigitacion = control.value;
      }
    }
  }
}
