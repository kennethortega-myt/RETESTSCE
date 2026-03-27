import {Directive, ElementRef, HostListener, Input} from "@angular/core";
import {BasePaso2FocusNextFlechaDirective} from './basePaso2FocusNextFlecha.directive';

@Directive({
  selector: '[sceFocusNextFlechaTotal]'
})
export class FocusNextFlechaTotalDirective extends BasePaso2FocusNextFlechaDirective{

  @Input() rowIndex: number;

  constructor(private readonly el: ElementRef) {
    super();
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const form = document.getElementById('left-container');
    if (!form) return;

    const rows = this.getRows(form, '.t-c');
    let next: HTMLInputElement | undefined;

    switch (event.key) {
      case 'ArrowDown':
        next = this.getNextRowInput(rows, this.rowIndex + 1, 0);
        break;
      case 'ArrowUp':
        next = this.getNextRowInput(rows, this.rowIndex - 1, 0);
        break;
    }

    if (next) {
      next.focus();
      next.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
      event.preventDefault();
    }
  }
}
