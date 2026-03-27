import {Directive, ElementRef, HostListener} from "@angular/core";
import {FocusElementVeri, MessageVerificacionActasService} from '../../../message/message-verificacion-actas.service';
import {BaseFocusNextDirective} from './baseFocusNext.directive';

@Directive({
  selector: '[sceFocusNextRevoEnter]'
})
export class FocusNextRevocatoriaEnterDirective extends BaseFocusNextDirective{
  constructor(
    el: ElementRef,
    private readonly messageService: MessageVerificacionActasService
  ) {
    super(el);
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.tab', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    event.preventDefault();
    this.moveToNextInput(event.key);
  }

  protected moveToNextInput(key: string): void {
    const currentInput = this.getCurrentInput();
    const formVotos = document.getElementById('right-container');
    if (!formVotos) return;

    const rowsVotos = this.getRows('right-container', '.container-1.p');
    const nextInput = this.buscarSiguienteInput(currentInput, rowsVotos, key);

    if (nextInput) {
      nextInput.focus();
    }
  }

  private buscarSiguienteInput(
    currentInput: HTMLInputElement,
    rows: HTMLElement[],
    key: string
  ): HTMLInputElement | undefined {
    let currentRowIndex = this.rowIndex;

    while (currentRowIndex < rows.length) {
      if (!rows[currentRowIndex].contains(currentInput)) break;

      const mismoRow = this.findNextEditableInputInSameRow(currentInput);
      if (mismoRow) return mismoRow;

      const siguienteRow = this.findEditableInputInRow(rows, ++currentRowIndex);
      if (siguienteRow) return siguienteRow;

      this.evaluarMensajesFinalFila(currentRowIndex, rows.length, key);
    }

    return undefined;
  }

  private evaluarMensajesFinalFila(
    currentRowIndex: number,
    totalRows: number,
    key: string
  ): void {
    if (currentRowIndex === totalRows) {
      this.messageService.setFocus(FocusElementVeri.INPUT_VOTO_LAST);
      this.messageService.setFocus(
        key === 'Enter' ? FocusElementVeri.CONTINUAR : FocusElementVeri.SIN_DATOS
      );
    } else {
      this.messageService.setFocus(FocusElementVeri.INPUT_VOTO);
    }
  }
}
