import {IFormGroupStrategy} from '../../../interface/formGroupStrategy.interface';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ActaPorCorregirBean} from '../../../model/actaPorCorregirBean';
import {MessageActasCorregirService} from '../../../message/message-actas-corregir.service';
import {IAgrupacionPolitica} from '../../../interface/agrupacionPolitica.interface';
import {IVotoData} from '../../../interface/votoData.interface';

export class PresidencialFormStrategy implements IFormGroupStrategy{
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly formGroupSeccionVoto: FormGroup,
    private readonly actaPorCorregirBean: ActaPorCorregirBean,
    private readonly messageService: MessageActasCorregirService
  ) {}

  configurarFormControls(agrupacionesPoliticas: IAgrupacionPolitica[], cantVotosPrefe: number): void {
    agrupacionesPoliticas.forEach((data, i) => {
      this.agregarControlVotoTotal(data, i);
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

  changeVoto(fileId: number, i: number): void {
    const agrupacion = this.actaPorCorregirBean.agrupacionesPoliticas[i];
    if (agrupacion) {
      const valor = this.formGroupSeccionVoto.get("params")?.get(`${fileId}-${i}`)?.value;
      agrupacion.terceraDigitacion = valor;
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
