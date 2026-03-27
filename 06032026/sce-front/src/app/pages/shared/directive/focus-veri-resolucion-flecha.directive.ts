import {Directive, Input} from "@angular/core";
import {BaseVeriResolucionFocusFlechaDirective} from './baseVeriResolucionFocusFlecha.directive';

@Directive({
  selector: '[sceFocusVeriResolucionFlecha]'
})
export class FocusVeriResolucionFlechaDirective extends BaseVeriResolucionFocusFlechaDirective{

  @Input() flagPresi!: boolean;

  protected getContainers() {
    return {
      left: document.getElementById('left-container'),
      right: document.getElementById('right-container')
    };
  }

  protected getRows({ left, right }: { left?: HTMLElement | null; right?: HTMLElement | null }): {
    rowsTotal: HTMLElement[];
    rowsPreferential: HTMLElement[];
  } {
    return {
      rowsTotal: left ? Array.from(left.querySelectorAll('.item-content-preferencial2')) : [],
      rowsPreferential: right ? Array.from(right.querySelectorAll('.focus')) : []
    };
  }

  protected identifyContext(input: HTMLElement, { left, right }: {left?: HTMLElement | null; right?: HTMLElement | null}): 'left' | 'right' | null {
    if (this.flagPresi && left?.contains(input)) return 'left';
    if (!this.flagPresi && left?.contains(input)) return 'left';
    if (!this.flagPresi && right?.contains(input)) return 'right';
    return null;
  }

  protected handleArrowDown(context: 'left' | 'right', rowsTotal: HTMLElement[], rowsPreferential: HTMLElement[]): HTMLInputElement | undefined {
    if (context === 'left' && this.rowIndex < rowsTotal.length - 1) {
      const inputs = Array.from(rowsTotal[this.rowIndex + 1].querySelectorAll('input'));
      return inputs[0];
    }

    if (context === 'right' && this.rowIndex < rowsPreferential.length - 1) {
      const inputs = Array.from(rowsPreferential[this.rowIndex + 1].querySelectorAll('input'));
      return inputs[this.colIndex];
    }

    return undefined;
  }

  protected handleArrowUp(context: 'left' | 'right', rowsTotal: HTMLElement[], rowsPreferential: HTMLElement[]): HTMLInputElement | undefined {
    if (context === 'left' && this.rowIndex > 0) {
      const inputs = Array.from(rowsTotal[this.rowIndex - 1].querySelectorAll('input'));
      return inputs[0];
    }

    if (context === 'right' && this.rowIndex > 0) {
      const inputs = Array.from(rowsPreferential[this.rowIndex - 1].querySelectorAll('input'));
      return inputs[this.colIndex];
    }

    return undefined;
  }

  protected handleArrowRight(context: 'left' | 'right', rowsTotal: HTMLElement[], rowsPreferential: HTMLElement[]): HTMLInputElement | undefined {
    const currentInput = this.el.nativeElement as HTMLInputElement;

    if (context === 'left' && !this.flagPresi && this.rowIndex < rowsTotal.length - 3) {
      const targetRow = rowsPreferential[this.rowIndex];
      if (targetRow) {
        const inputs = Array.from(targetRow.querySelectorAll('input'));
        return inputs[0];
      }
    }

    if (context === 'right') {
      const currentRow = currentInput.closest('.focus');
      const inputs = Array.from(currentRow?.querySelectorAll('input') || []);
      const idx = inputs.indexOf(currentInput);

      if (idx < inputs.length - 1) {
        return inputs[idx + 1];
      } else {
        const nextRowTotal = rowsTotal[this.rowIndex + 1];
        if (nextRowTotal) {
          const inputsNext = Array.from(nextRowTotal.querySelectorAll('input'));
          return inputsNext[0];
        }
      }
    }

    return undefined;
  }

  protected handleArrowLeft(context: 'left' | 'right', rowsTotal: HTMLElement[], rowsPreferential: HTMLElement[]): HTMLInputElement | undefined {
    const currentInput = this.el.nativeElement as HTMLInputElement;

    if (context === 'left' && !this.flagPresi && this.rowIndex !== 0) {
      const prevRow = rowsPreferential[this.rowIndex - 1];
      if (prevRow) {
        const inputs = Array.from(prevRow.querySelectorAll('input'));
        return inputs.at(-1);
      }
    }

    if (context === 'right') {
      const currentRow = currentInput.closest('.focus');
      const inputs = Array.from(currentRow?.querySelectorAll('input') || []);
      const idx = inputs.indexOf(currentInput);

      if (idx > 0) {
        return inputs[idx - 1];
      } else {
        const currentRowTotal = rowsTotal[this.rowIndex];
        if (currentRowTotal) {
          const inputsTotal = Array.from(currentRowTotal.querySelectorAll('input'));
          return inputsTotal.at(-1);
        }
      }
    }

    return undefined;
  }

}
