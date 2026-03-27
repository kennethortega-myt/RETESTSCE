import {Directive} from "@angular/core";
import {BaseActasCorregirFocusFlechaDirective} from './baseActasCorregirFocusFlecha.directive';

@Directive({
  selector: '[sceFocusActaCorregirFlecha]'
})
export class FocusActaCorregirFlechaDirective extends BaseActasCorregirFocusFlechaDirective{
  protected getContext() {
    return {
      container1: document.getElementById('left-container'),
      selector1: '.item-content-preferencial',
      container2: document.getElementById('right-container'),
      selector2: '.focus'
    };
  }

  protected handleContainer1(
    event: KeyboardEvent,
    rows1: HTMLElement[],
    rows2: HTMLElement[],
    _: HTMLInputElement
  ): HTMLInputElement | undefined {
    switch (event.key) {
      case 'ArrowDown':
        return this.getInput(rows1, this.rowIndex + 1, 2);
      case 'ArrowUp':
        return this.getInput(rows1, this.rowIndex - 1, 2);
      case 'ArrowRight':
        return this.getInput(rows2, this.rowIndex, 2);
      case 'ArrowLeft':
        return this.getLastInput(rows2, this.rowIndex - 1);
      default:
        return undefined;
    }
  }

  protected handleContainer2(
    event: KeyboardEvent,
    rows1: HTMLElement[],
    rows2: HTMLElement[],
    currentInput: HTMLInputElement
  ): HTMLInputElement | undefined {
    const row = currentInput.closest('.focus');
    if (!row) return undefined;

    const inputs = Array.from(row.querySelectorAll('input'));
    const currentIdx = inputs.indexOf(currentInput);

    switch (event.key) {
      case 'ArrowDown':
        return this.getInput(rows2, this.rowIndex + 1, (this.colIndex*3)+2);
      case 'ArrowUp':
        return this.getInput(rows2, this.rowIndex - 1, (this.colIndex*3)+2);
      case 'ArrowRight':
        return currentIdx < inputs.length - 1
          ? inputs[currentIdx + 3]
          : this.getInput(rows1, this.rowIndex + 1, 2);
      case 'ArrowLeft':
        return currentIdx > 2
          ? inputs[currentIdx - 3]
          : this.getInput(rows1, this.rowIndex, 2);
      default:
        return undefined;
    }
  }

  private getInput(rows: HTMLElement[], rowIdx: number, inputIdx: number): HTMLInputElement | undefined {
    if (rowIdx >= 0 && rowIdx < rows.length) {
      const inputs = Array.from(rows[rowIdx].querySelectorAll('input'));
      if (inputs.length > inputIdx) {
        return inputs[inputIdx];
      }
    }
    return undefined;
  }

  private getLastInput(rows: HTMLElement[], rowIdx: number): HTMLInputElement | undefined {
    const inputs = rows[rowIdx]?.querySelectorAll('input');
    if(inputs === undefined || inputs.length === 0) return undefined;
    return inputs[inputs.length - 1];
  }
}
