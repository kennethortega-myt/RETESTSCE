import {Directive} from '@angular/core';
import {BaseActasCorregirFocusEnterDirective} from './baseActasCorregirFocusEnter.directive';

@Directive({
  selector: '[sceFocusActaCorregirEnterRevocatoria]'
})
export class FocusActaCorregirEnterRevocatoriaDirective  extends BaseActasCorregirFocusEnterDirective{
  protected getContainers() {
    return {
      container1: document.getElementById('right-container'),
      selector1: '.focus'
    };
  }

  protected handleContainer1(currentInput: HTMLInputElement, rows: HTMLElement[]): HTMLInputElement | undefined {
    const row = currentInput.closest('.focus');
    if (!row) return undefined;

    const inputs = Array.from(row.querySelectorAll('input'));
    const currentIndex = inputs.indexOf(currentInput);

    if (currentIndex < inputs.length - 1) {
      return inputs[currentIndex + 3];
    }
    return this.getNextInput(rows, this.rowIndex + 1, 2);
  }

  protected handleContainer2(): undefined {
    return undefined;
  }

  private getNextInput(rows: HTMLElement[], rowIdx: number, colIdx: number): HTMLInputElement | undefined {
    if (rowIdx < rows.length) {
      return rows[rowIdx]?.querySelectorAll('input')[colIdx];
    }
    return undefined;
  }
}
