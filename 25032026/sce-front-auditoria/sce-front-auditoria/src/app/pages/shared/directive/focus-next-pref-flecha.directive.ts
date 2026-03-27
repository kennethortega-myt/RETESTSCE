import {Directive, ElementRef, HostListener, Input} from "@angular/core";
import {BasePaso2FocusNextFlechaDirective} from './basePaso2FocusNextFlecha.directive';

@Directive({
  selector: '[sceFocusNextPrefFlecha]'
})
export class FocusNextPrefFlechaDirective extends BasePaso2FocusNextFlechaDirective{

  @Input() rowIndex: number;
  @Input() colIndex: number;

  constructor(private readonly el: ElementRef) {
    super();
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const input = this.el.nativeElement as HTMLInputElement;
    const formTotal = document.getElementById('left-container');
    const formPreferential = document.getElementById('right-container');
    if (!formTotal || !formPreferential) return;

    const rowsTotal = this.getRows(formTotal, '.item2');
    const rowsPref = this.getRows(formPreferential, '.container-1.p');

    const inTotal = formTotal.contains(input);
    const inPref = formPreferential.contains(input);

    let next: HTMLInputElement | undefined;

    if (inTotal) {
      switch (event.key) {
        case 'ArrowDown':
          next = this.getNextRowInput(rowsTotal, this.rowIndex + 1);
          break;
        case 'ArrowUp':
          next = this.getNextRowInput(rowsTotal, this.rowIndex - 1);
          break;
        case 'ArrowRight':
          next = this.getNextRowInput(rowsPref, this.rowIndex);
          break;
        case 'ArrowLeft':
          next = this.getPreviousRowLastInput(rowsPref, this.rowIndex - 1);
          break;
      }
    } else if (inPref) {
      const row = input.closest('.container-1.p');
      if (!row) return;
      const inputs = this.getInputsInRow(row);
      const index = inputs.indexOf(input);

      switch (event.key) {
        case 'ArrowDown':
          next = this.getNextRowInput(rowsPref, this.rowIndex + 1, this.colIndex);
          break;
        case 'ArrowUp':
          next = this.getNextRowInput(rowsPref, this.rowIndex - 1, this.colIndex);
          break;
        case 'ArrowRight':
          next = this.getNextOrMoveToNextRow(inputs, index, rowsTotal, this.rowIndex + 1);
          break;
        case 'ArrowLeft':
          next = this.getPreviousOrMoveToOtherTable(inputs, index, rowsTotal, this.rowIndex);
          break;
      }
    }

    if (next) {
      next.focus();
      event.preventDefault();
    }
  }
}
