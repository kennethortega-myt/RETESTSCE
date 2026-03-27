import {Directive} from '@angular/core';
import {BaseActasCorregirFocusFlechaDirective} from './baseActasCorregirFocusFlecha.directive';

@Directive({
  selector: '[sceFocusActaCorregirFlechaVotosTotales]'
})
export class FocusActaCorregirFlechaVotosTotalesDirective extends BaseActasCorregirFocusFlechaDirective{
  protected getContext() {
    return {
      container1: document.getElementById('left-container'),
      selector1: '.item-content-distrital'
    };
  }

  protected handleContainer1(event: KeyboardEvent, rows: HTMLElement[], _: HTMLElement[], __: HTMLInputElement) {
    return this.navigate(rows, this.rowIndex, event.key);
  }

  protected handleContainer2(): undefined {
    return undefined;
  }

  private navigate(rows: HTMLElement[], index: number, key: string): HTMLInputElement | undefined {
    let targetRow: number;

    switch (key) {
      case 'ArrowDown':
        targetRow = index + 1;
        break;
      case 'ArrowUp':
        targetRow = index - 1;
        break;
      default:
        return undefined;
    }

    if (targetRow >= 0 && targetRow < rows.length) {
      return rows[targetRow].querySelectorAll('input')[2];
    }

    return undefined;
  }
}
