import {Directive} from '@angular/core';
import {BaseActasCorregirFocusFlechaDirective} from './baseActasCorregirFocusFlecha.directive';

@Directive({
  selector: '[sceFocusActaCorregirFlechaRevocatoria]'
})
export class FocusActaCorregirFlechaRevocatoriaDirective extends BaseActasCorregirFocusFlechaDirective {

  protected getContext() {
    return {
      container1: document.getElementById('right-container'),
      selector1: '.focus'
    };
  }

  protected handleContainer1(
    event: KeyboardEvent,
    rows: HTMLElement[],
    _: HTMLElement[],
    currentInput: HTMLInputElement
  ): HTMLInputElement | undefined {
    const row = currentInput.closest('.focus');
    if (!row) return undefined;

    const inputs = Array.from(row.querySelectorAll('input'));
    const currentIdx = inputs.indexOf(currentInput);

    switch (event.key) {
      case 'ArrowDown':
        return this.getInput(rows, this.rowIndex + 1, this.colIndex);
      case 'ArrowUp':
        return this.getInput(rows, this.rowIndex - 1, this.colIndex);
      case 'ArrowRight':
        return currentIdx < inputs.length - 1 ? inputs[currentIdx + 3] : this.getFirstInput(rows, this.rowIndex + 1);
      case 'ArrowLeft':
        return currentIdx > 2 ? inputs[currentIdx - 3] : this.getLastInput(rows, this.rowIndex - 1);
      default:
        return undefined;
    }
  }

  protected handleContainer2():  HTMLInputElement | undefined {
    return undefined;
  }

  private getInput(rows: HTMLElement[], rowIdx: number, colIdx: number): HTMLInputElement | undefined {
    if (rowIdx >= 0 && rowIdx < rows.length) {
      const index = (colIdx * 3) + 2;
      const inputs = Array.from(rows[rowIdx].querySelectorAll('input'));
      if (inputs.length > index) {
        return inputs[index];
      }
    }
    return undefined;
  }

  private getFirstInput(rows: HTMLElement[], rowIdx: number): HTMLInputElement | undefined {
    return rows[rowIdx]?.querySelectorAll('input')[2];
  }

  private getLastInput(rows: HTMLElement[], rowIdx: number): HTMLInputElement | undefined {
    const inputs = rows[rowIdx]?.querySelectorAll('input');
    if(inputs === undefined || inputs.length === 0) return undefined;
    return inputs[inputs.length - 1];
  }

}
