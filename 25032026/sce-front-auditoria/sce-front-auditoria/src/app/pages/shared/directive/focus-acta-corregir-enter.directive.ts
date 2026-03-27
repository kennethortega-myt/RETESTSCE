import {Directive} from "@angular/core";
import {BaseActasCorregirFocusEnterDirective} from './baseActasCorregirFocusEnter.directive';

@Directive({
  selector: '[sceFocusActaCorregirEnter]'
})
export class FocusActaCorregirEnterDirective  extends BaseActasCorregirFocusEnterDirective{
  protected getContainers() {
    return {
      container1: document.getElementById('left-container'),
      selector1: '.item-content-preferencial',
      container2: document.getElementById('right-container'),
      selector2: '.focus'
    };
  }

  protected handleContainer1(currentInput: HTMLInputElement, rows1: HTMLElement[], rows2: HTMLElement[]): HTMLInputElement | undefined {
    const row = currentInput.closest('.item-content-preferencial');
    if (!row) return undefined;

    const inputs = Array.from(row.querySelectorAll('input'));
    const currentIndex = inputs.indexOf(currentInput);

    if (this.isReadOnlyAndEmpty(currentInput)) {
      return this.getNextInput(rows1, this.rowIndex + 1, 2);
    } else if (currentIndex === inputs.length - 1) {
      return this.getNextInput(rows2, this.rowIndex, 2) ||
        this.getNextInput(rows1, this.rowIndex + 1, 2);
    }

    return undefined;
  }

  protected handleContainer2(currentInput: HTMLInputElement, rows1: HTMLElement[]): HTMLInputElement | undefined {
    const row = currentInput.closest('.focus');
    if (!row) return undefined;

    const inputs = Array.from(row.querySelectorAll('input'));
    const currentIndex = inputs.indexOf(currentInput);

    if (currentIndex < inputs.length - 1) {
      return inputs[currentIndex + 3];
    }
    return this.getNextInput(rows1, this.rowIndex + 1, 2);
  }

  private getNextInput(rows: HTMLElement[], rowIdx: number, colIdx: number): HTMLInputElement | undefined {
    if (rowIdx < rows.length) {
      return rows[rowIdx]?.querySelectorAll('input')[colIdx];
    }
    return undefined;
  }
}
