import {Directive} from '@angular/core';
import {BaseActasCorregirFocusEnterDirective} from './baseActasCorregirFocusEnter.directive';

@Directive({
  selector: '[sceFocusActaCorregirEnterVotosTotales]'
})
export class FocusActaCorregirEnterVotosTotalesDirective extends BaseActasCorregirFocusEnterDirective{
  protected getContainers() {
    return {
      container1: document.getElementById('left-container'),
      selector1: '.item-content-distrital'
    };
  }

  protected handleContainer1(currentInput: HTMLInputElement, rows: HTMLElement[]): HTMLInputElement | undefined {
    const row = currentInput.closest('.item-content-distrital');
    if (!row) return undefined;
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
