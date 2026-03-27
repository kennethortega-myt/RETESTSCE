import {Directive, ElementRef, HostListener, Input} from "@angular/core";
import {BasePaso2FocusNextFlechaDirective} from './basePaso2FocusNextFlecha.directive';

@Directive({
  selector: '[sceFocusNextRevoFlecha]'
})
export class FocusNextRevocatoriaFlechaDirective extends BasePaso2FocusNextFlechaDirective{
  @Input() rowIndex: number;
  @Input() colIndex: number;

  constructor(private readonly el: ElementRef) {
    super();
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const input = this.el.nativeElement as HTMLInputElement;
    const form = document.getElementById('right-container');
    if (!form) return;

    const rows = this.getRows(form, '.container-1.p');
    const row = input.closest('.container-1.p');
    if (!row) return;

    const inputs = this.getInputsInRow(row);
    const currentIndex = inputs.indexOf(input);

    let next: HTMLInputElement | undefined;

    switch (event.key) {
      case 'ArrowDown':
        next = this.getNextRowInput(rows, this.rowIndex + 1, this.colIndex);
        break;
      case 'ArrowUp':
        next = this.getNextRowInput(rows, this.rowIndex - 1, this.colIndex);
        break;
      case 'ArrowRight':
        next = this.getNextOrMoveToNextRow(inputs, currentIndex, rows, this.rowIndex + 1);
        break;
      case 'ArrowLeft':
        next = this.getPreviousOrMoveToOtherTable(inputs, currentIndex, rows, this.rowIndex);
        break;
    }

    if (next) {
      next.focus();
      event.preventDefault();
    }
  }
}
