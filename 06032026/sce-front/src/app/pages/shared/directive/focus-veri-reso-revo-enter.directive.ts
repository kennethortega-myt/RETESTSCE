import {Directive, ElementRef, Input} from '@angular/core';
import {BaseVeriResolucionFocusEnterDirective} from './baseVeriResolucionFocusEnter.directive';

@Directive({
  selector: '[sceFocusVeriResoRevoEnter]'
})
export class FocusVeriResoRevoEnterDirective extends BaseVeriResolucionFocusEnterDirective{

  @Input() override rowIndex!: number;
  @Input() override colIndex!: number;

  constructor(override readonly el: ElementRef) {
    super(el);
  }

  protected override getNextInput(currentInput: HTMLInputElement): HTMLInputElement | undefined {
    const formPreferential = document.getElementById('right-container');
    if (!formPreferential) return undefined;

    const rowsPreferential = Array.from(formPreferential.querySelectorAll('.focus'));

    if (formPreferential.contains(currentInput)) {
      const currentRow = currentInput.closest('.focus');
      const inputs = Array.from(currentRow?.querySelectorAll('input') ?? []);
      const index = inputs.indexOf(currentInput);

      if (index < inputs.length - 1) {
        return inputs[index + 1];
      } else if (this.rowIndex + 1 < rowsPreferential.length) {
        const nextRow = rowsPreferential[this.rowIndex + 1];
        const nextInputs = Array.from(nextRow.querySelectorAll('input'));
        return nextInputs[0];
      }
    }

    return undefined;
  }

}
