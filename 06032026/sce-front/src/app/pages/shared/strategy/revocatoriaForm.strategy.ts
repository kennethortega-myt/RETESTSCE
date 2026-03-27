import {IFormGroupStrategy} from '../../../interface/formGroupStrategy.interface';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ActaPorCorregirBean} from '../../../model/actaPorCorregirBean';
import {IVotoData} from '../../../interface/votoData.interface';
import {IAgrupacionPolitica} from '../../../interface/agrupacionPolitica.interface';
import {MessageActasCorregirService} from '../../../message/message-actas-corregir.service';

export class RevocatoriaFormStrategy implements IFormGroupStrategy{
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly formGroupSeccionVotoPref: FormGroup,
    private readonly actaPorCorregirBean: ActaPorCorregirBean,
    private readonly messageService: MessageActasCorregirService
  ) {}

  configurarFormControls(agrupacionesPoliticas: IAgrupacionPolitica[], cantVotosPrefe: number): void {
    agrupacionesPoliticas.forEach((data, i) => {
      if (data.votosOpciones?.length) {
        this.configurarVotosOpciones(data, i);
      } else {
        this.configurarControlesSinVotos(i, cantVotosPrefe);
      }
    });
  }

  private configurarVotosOpciones(data: IAgrupacionPolitica, i: number): void {
    data.votosOpciones?.forEach((dataOpc, j) => {
      const paramsGroup = this.formGroupSeccionVotoPref.get("params") as FormGroup;
      const controlName = `${dataOpc.idDetActaOpcion}-${i}-${j}`;
      const value = dataOpc.terceraDigitacion !== "null" ? dataOpc.terceraDigitacion : "";

      paramsGroup.addControl(controlName, new FormControl({
        value: value,
        disabled: false
      }));
    });
  }

  private configurarControlesSinVotos(i: number, cantVotosPrefe: number): void {
    for (let j = 0; j < cantVotosPrefe; j++) {
      const paramsGroup = this.formGroupSeccionVotoPref.get("params") as FormGroup;
      paramsGroup.addControl(`sinVotPref-${i}-${j}`, new FormControl({
        value: '',
        disabled: false
      }));
    }
  }

  changeVoto(fileId: number, i: number, j: number): void {
    const controlName = `${fileId}-${i}-${j}`;
    const control = this.formGroupSeccionVotoPref.get("params")?.get(controlName);
    let value = (control?.value ?? '').toString();

    const validado = this.validateInput(value);
    if (value !== validado) {
      control?.setValue(validado);
      value = validado;
    }

    // Usando optional chaining sin aserciones
    const votoOpcion = this.actaPorCorregirBean.agrupacionesPoliticas[i]?.votosOpciones?.[j];
    if (votoOpcion) {
      votoOpcion.terceraDigitacion = value;
    }

    this.messageService.setDataActaPorCorregirBean(this.actaPorCorregirBean);
  }

  private validateInput(value: string): string {
    if (value === '#' || value.toLowerCase() === 'i') return '#';
    const digits = value.replace(/\D/g, '');
    return digits.substring(0, 3);
  }

  pasarVotosNulos(isChecked: boolean): void {
    this.actaPorCorregirBean.agrupacionesPoliticas.forEach((votoItem, i) => {
      if (votoItem.votosOpciones?.length) {
        votoItem.votosOpciones.forEach((votoOpc, j) => {
          if (votoOpc.primeraDigitacion !== 'null') {
            const prefControlKey = `${votoOpc.idDetActaOpcion}-${i}-${j}`;
            const prefControl = this.formGroupSeccionVotoPref.get('params.' + prefControlKey) as FormControl;
            this.manejarControlVoto(prefControl, votoOpc, isChecked);
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
