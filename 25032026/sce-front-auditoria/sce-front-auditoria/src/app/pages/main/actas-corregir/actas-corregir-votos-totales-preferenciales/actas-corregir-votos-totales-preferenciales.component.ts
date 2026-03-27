import {Component, ElementRef, Renderer2} from "@angular/core";
import {FormBuilder} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {MessageActasCorregirService} from "../../../../message/message-actas-corregir.service";
import {PopActasCorregirVotoData} from "../../../../interface/popActasCorregirVotoData";
import {PopActasCorregirVotoComponent} from "../pop-actas-corregir-voto/pop-actas-corregir-voto.component";
import {UtilityService} from "../../../../helper/utilityService";
import {ActasCorregirBaseComponent} from '../actas-corregir-base/actas-corregir-base.component';
import {IAgrupacionPolitica} from '../../../../interface/agrupacionPolitica.interface';
import {IFormGroupStrategy} from '../../../../interface/formGroupStrategy.interface';
import {PreferencialFormStrategy} from '../../../shared/strategy/preferencialForm.strategy';

@Component({
  selector: 'app-actas-corregir-votos-totales-preferenciales',
  templateUrl: './actas-corregir-votos-totales-preferenciales.component.html',
  styleUrls: ['./actas-corregir-votos-totales-preferenciales.component.scss']
})
export class ActasCorregirVotosTotalesPreferencialesComponent extends ActasCorregirBaseComponent{

  public popActasCorregirVotoData: PopActasCorregirVotoData;

  constructor(
    formBuilder: FormBuilder,
    dialog: MatDialog,
    messageActasCorregirService: MessageActasCorregirService,
    renderer: Renderer2,
    utilityService: UtilityService,
    el: ElementRef
  ) {
    super(formBuilder, dialog, messageActasCorregirService, renderer, utilityService, el);

    this.popActasCorregirVotoData = {
      indexI: -1,
      indexJ: -1,
      votos: [],
      cantVotosPref: 0
    };
  }

  protected inicializarConfiguracion(): void {
    this.cantVotosPrefe = this.actaPorCorregirBean.acta.cantidadColumnas || 0;
    this.times = Array.from({length: this.cantVotosPrefe}, (_, index) => index + 1);
  }

  protected createFormStrategy(): IFormGroupStrategy {
    return new PreferencialFormStrategy(
      this.formBuilder,
      this.formGroupSeccionVoto,
      this.formGroupSeccionVotoPref,
      this.actaPorCorregirBean,
      this.messageActasCorregirService
    );
  }

  protected override procesarVotosEspecificos(agrPol: IAgrupacionPolitica): void {
    if (agrPol.votosPreferenciales && Array.isArray(agrPol.votosPreferenciales)) {
      for(const votPref of agrPol.votosPreferenciales) {
        this.establecerTerceraDigitacion(votPref);
      }
    }
  }

  openPopup(primeraDigValue: string, segundaDigValue: string, indexI: number, fileId: number): void {
    const agrupacion = this.actaPorCorregirBean.agrupacionesPoliticas[indexI];
    const votosPreferenciales = agrupacion?.votosPreferenciales;

    if (fileId === null ||
      !votosPreferenciales ||
      votosPreferenciales.length === 0 ||
      (primeraDigValue === 'null' && segundaDigValue === 'null')) {
      return;
    }

    this.popActasCorregirVotoData = {
      indexI: indexI,
      indexJ: -1,
      votos: this.actaPorCorregirBean.agrupacionesPoliticas,
      cantVotosPref: this.cantVotosPrefe
    };

    const dialogRef = this.dialog.open(PopActasCorregirVotoComponent, {
      data: this.popActasCorregirVotoData
    });

    dialogRef.componentInstance.inputValueChange.subscribe((event: {indexI: number, indexJ: number, terceraDigvalue: string, fileId: number}) => {
      this.updateInputValue(event.indexI, event.indexJ, event.terceraDigvalue, event.fileId);
    });

    dialogRef.componentInstance.closePopup.subscribe((event: {indexI: number, indexJ: number}) => {
      if (event.indexJ === -1) {
        this.focusInputId = 'mat-input-total-' + event.indexI;
      } else {
        this.focusInputId = 'mat-input-pref-' + event.indexI + '-' + event.indexJ;
      }

      this.setFocusOnInput();
      dialogRef.close();
    });
  }

  updateInputValue(indexI: number, indexJ: number, value: string, fileId: number): void {
    if (indexJ === -1) {
      // Actualizar voto total
      this.formGroupSeccionVoto.get("params")?.get(fileId + "-" + indexI)?.setValue(value);

      const agrupacion = this.actaPorCorregirBean.agrupacionesPoliticas[indexI];
      if (agrupacion) {
        agrupacion.terceraDigitacion = value;
      }
    } else {
      // Actualizar voto preferencial
      this.formGroupSeccionVotoPref.get("params")?.get(fileId + "-" + indexI + "-" + indexJ)?.setValue(value);

      const votoPreferencial = this.actaPorCorregirBean.agrupacionesPoliticas[indexI]?.votosPreferenciales?.[indexJ];
      if (votoPreferencial) {
        votoPreferencial.terceraDigitacion = value;
      }
    }
  }

  changeVoto(fileId: number, preferencial: boolean, i: number, j?: number): void {
    this.formStrategy.changeVoto(fileId, i, j);
  }

}
