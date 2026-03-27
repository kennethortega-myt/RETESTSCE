import { Directive, ElementRef, HostListener } from '@angular/core';
import {BaseFocusNextDirective} from './baseFocusNext.directive';

@Directive({
  selector: '[sceFocusNextPrefEnter]'
})
export class FocusNextPrefEnterDirective extends BaseFocusNextDirective {
  constructor(el: ElementRef) {
    super(el);
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.tab', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    event.preventDefault();
    this.moveToNextInput(event.key);
  }

  protected moveToNextInput(_key: string): void {
    const currentInput = this.getCurrentInput();
    const formTotal = document.getElementById('left-container');
    const formPref = document.getElementById('right-container');
    if (!formTotal || !formPref) return;

    const rowsTotal = this.getRows('left-container', '.item2');
    const rowsPref = this.getRows('right-container', '.container-1.p');
    let currentRowIndex = this.rowIndex;

    const nextInput = this.buscarSiguienteInput(currentInput, formTotal, formPref, rowsTotal, rowsPref, currentRowIndex);
    if (nextInput) nextInput.focus();
  }

  private buscarSiguienteInput(
    currentInput: HTMLInputElement,
    formTotal: HTMLElement,
    formPref: HTMLElement,
    rowsTotal: HTMLElement[],
    rowsPref: HTMLElement[],
    rowIndex: number
  ): HTMLInputElement | undefined {
    while (rowIndex < Math.max(rowsTotal.length, rowsPref.length)) {
      const result = formTotal.contains(currentInput)
        ? this.buscarDesdeTotales(rowIndex, rowsTotal, rowsPref)
        : this.buscarDesdePreferenciales(currentInput, rowIndex, rowsTotal, rowsPref);

      if (result.found) return result.input;

      rowIndex++;
    }
    return undefined;
  }

  private buscarDesdeTotales(
    rowIndex: number,
    rowsTotal: HTMLElement[],
    rowsPref: HTMLElement[]
  ): { found: boolean; input?: HTMLInputElement } {
    let input = this.findEditableInputInRow(rowsPref, rowIndex);
    if (input) return { found: true, input };

    input = this.findEditableInputInRow(rowsTotal, rowIndex + 1);
    return input ? { found: true, input } : { found: false };
  }

  private buscarDesdePreferenciales(
    currentInput: HTMLInputElement,
    rowIndex: number,
    rowsTotal: HTMLElement[],
    rowsPref: HTMLElement[]
  ): { found: boolean; input?: HTMLInputElement } {
    let input = this.findNextEditableInputInSameRow(currentInput);
    if (input) return { found: true, input };

    input = this.findEditableInputInRow(rowsTotal, rowIndex + 1);
    if (input) return { found: true, input };

    input = this.findEditableInputInRow(rowsPref, rowIndex);
    return input ? { found: true, input } : { found: false };
  }
}
