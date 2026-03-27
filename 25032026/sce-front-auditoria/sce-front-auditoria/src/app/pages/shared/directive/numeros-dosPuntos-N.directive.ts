import {Directive, ElementRef, HostListener, OnInit, Renderer2} from "@angular/core";
import {NgControl} from "@angular/forms";
import { Constantes } from "src/app/helper/constantes";

@Directive({
  selector: '[sceNumerosDosPuntoN]'
})
export class NumerosDosPuntosNDirective implements OnInit{
  constructor(private readonly elementRef: ElementRef<HTMLInputElement>,
              private readonly renderer: Renderer2,
              private readonly control: NgControl) { }

  ngOnInit() {
    this.transformInput(this.elementRef.nativeElement.value);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.transformInput(input.value);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const input = this.elementRef.nativeElement;
    const key = event.key;
    const cursorPosition = input.selectionStart || 0;

    if (key === 'Backspace' && input.value[cursorPosition - 1] === ':') {
      event.preventDefault();
      const newValue = input.value.slice(0, cursorPosition - 1) + input.value.slice(cursorPosition);
      this.renderer.setProperty(input, 'value', newValue);
      input.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
      this.control.control.setValue(newValue, { emitEvent: true });
    }
  }

  private transformInput(value: string): void {
    const upperValue = value.toUpperCase();

    if (upperValue === Constantes.CO_VALOR_N && value.length === 1) {
      this.control.control.setValue(Constantes.CO_VALOR_N, { emitEvent: true });
      return;
    }

    if (upperValue.includes(Constantes.CO_VALOR_N) && upperValue.length > 1) {
      const cleanValue = upperValue.replace(/N/g, '').replace(/\D/g, '');
      let formattedValue = cleanValue;
      if (cleanValue.length >= 2) {
        formattedValue = cleanValue.slice(0, 2) + (cleanValue.length > 2 ? ':' + cleanValue.slice(2, 4) : '');
      }
      this.renderer.setProperty(this.elementRef.nativeElement, 'value', formattedValue);
      this.control.control.setValue(formattedValue, { emitEvent: true });
      return;
    }

    const transformedValue = this.formatNumericTime(upperValue.replace(/\D/g, ''));

    this.renderer.setProperty(this.elementRef.nativeElement, 'value', transformedValue);
    this.control.control.setValue(transformedValue, { emitEvent: true });
  }

  private formatNumericTime(digits: string): string {
    let value = digits;

    if (value.length >= 2) {
      const hours = parseInt(value.slice(0, 2), 10);
      if (hours > 23) {
        value = '23' + value.slice(2);
      }
    }

    if (value.length >= 4) {
      const minutes = parseInt(value.slice(2, 4), 10);
      if (minutes > 59) {
        value = value.slice(0, 2) + '59';
      }
    }

    if (value.length >= 2) {
      value = value.slice(0, 2) + (value.length > 2 ? ':' + value.slice(2, 4) : '');
    }

    return value;
  }


}
