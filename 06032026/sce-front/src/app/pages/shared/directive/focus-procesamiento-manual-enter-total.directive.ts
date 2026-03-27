import { Directive, ElementRef, Input } from "@angular/core";
import { BaseProcesamientoManualFocusEnterDirective } from "./baseProcesamientoManualFocusEnter.directive";

@Directive({
  selector: '[sceFocusProcesamientoManualEnterTotal]'
})
export class FocusProcesamientoManualEnterTotalDirective extends BaseProcesamientoManualFocusEnterDirective{
  @Input() override rowIndex!: number;
  @Input() override colIndex!: number;
  @Input() flagPresi: boolean = false;

  constructor(override readonly el: ElementRef) {
    super(el);
  }

  protected override getNextInput(currentInput: HTMLInputElement): HTMLInputElement | undefined {
    return this.flagPresi
      ? this.getNextInputPresidencial(currentInput)
      : this.getNextInputPreferencial(currentInput);
  }

  private getNextInputPresidencial(currentInput: HTMLInputElement): HTMLInputElement | undefined {
    const formTotal = document.getElementById('left-container');
    if (!formTotal?.contains(currentInput)) return undefined;

    const rowsTotal = Array.from(formTotal.querySelectorAll('.item-content-preferencial2'));
    const currentRow = currentInput.closest('.item-content-preferencial2');
    const inputs = Array.from(currentRow?.querySelectorAll('input') ?? []);
    const index = inputs.indexOf(currentInput);

    if (index === inputs.length - 1 && this.rowIndex + 1 < rowsTotal.length) {
      const nextRow = rowsTotal[this.rowIndex + 1];
      return Array.from(nextRow.querySelectorAll('input'))[0];
    }

    return undefined;
  }

  private getNextInputPreferencial(currentInput: HTMLInputElement): HTMLInputElement | undefined {
    const formTotal = document.getElementById('left-container');
    const formPreferential = document.getElementById('right-container');
    if (!formTotal || !formPreferential) return undefined;

    const rowsTotal = Array.from(formTotal.querySelectorAll('.item-content-preferencial2'));
    const rowsPreferential = Array.from(formPreferential.querySelectorAll('.focus'));

    return formTotal.contains(currentInput)
      ? this.fromTotal(currentInput, rowsTotal, rowsPreferential)
      : this.fromPreferential(currentInput, rowsTotal, formPreferential);
  }

  private fromTotal(
    currentInput: HTMLInputElement,
    rowsTotal: Element[],
    rowsPreferential: Element[]
  ): HTMLInputElement | undefined {
    const currentRow = currentInput.closest('.item-content-preferencial2');
    const inputs = Array.from(currentRow?.querySelectorAll('input') ?? []);
    const index = inputs.indexOf(currentInput);

    if (currentInput.readOnly && currentInput.value === '') {
      return this.focusNextRow(rowsTotal, this.rowIndex);
    }

    if (index === inputs.length - 1) {
      const nextPrefRow = rowsPreferential[this.rowIndex];
      if (nextPrefRow) {
        const inputsPref = Array.from(nextPrefRow.querySelectorAll('input'));
        return inputsPref.length > 0
          ? inputsPref[0]
          : this.focusNextRow(rowsTotal, this.rowIndex);
      }
    }

    return undefined;
  }

  private fromPreferential(
    currentInput: HTMLInputElement,
    rowsTotal: Element[],
    formPreferential: HTMLElement
  ): HTMLInputElement | undefined {
    if (!formPreferential.contains(currentInput)) return undefined;

    const currentRow = currentInput.closest('.focus');
    const inputs = Array.from(currentRow?.querySelectorAll('input') ?? []);
    const index = inputs.indexOf(currentInput);

    if (index < inputs.length - 1) {
      return inputs[index + 1];
    }

    return this.focusNextRow(rowsTotal, this.rowIndex);
  }

  private focusNextRow(rows: Element[], rowIndex: number): HTMLInputElement | undefined {
    if (rowIndex + 1 < rows.length) {
      const nextRow = rows[rowIndex + 1];
      return Array.from(nextRow.querySelectorAll('input'))[0];
    }
    return undefined;
  }
}
