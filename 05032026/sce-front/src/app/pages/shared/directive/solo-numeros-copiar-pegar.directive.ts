import {Directive, ElementRef, HostListener, Optional} from "@angular/core";
import {NgControl} from "@angular/forms";

@Directive({
  selector: '[sceSoloNumerosConPegar]'
})
export class SoloNumerosConPegarDirective {
  constructor(private readonly el: ElementRef, @Optional() private readonly control: NgControl) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const filteredValue = input.value.replace(/\D/g, '');

    if (input.value !== filteredValue) {
      if (this.control?.control) {
        this.control.control.setValue(filteredValue);
      } else {
        input.value = filteredValue;
      }
    }
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const soloNumeros = pastedText.replace(/\D/g, '');

    if (soloNumeros) {
      if (this.control?.control) {
        this.control.control.setValue(soloNumeros);
      } else {
        this.el.nativeElement.value = soloNumeros;
      }
    }
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab',
      'ArrowLeft', 'ArrowRight',
      'Home', 'End', 'Enter'
    ];

    if (event.ctrlKey || event.metaKey) {
      return;
    }

    if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
}
