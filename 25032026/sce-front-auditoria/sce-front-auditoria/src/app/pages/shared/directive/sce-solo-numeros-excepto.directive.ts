import {Directive, ElementRef, HostListener, Optional} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[appSceSoloNumerosExcepto]'
})
export class SceSoloNumerosExceptoDirective {
  private readonly forbiddenValues = ['1', '2', '3', '4'];

  constructor(
    private readonly el: ElementRef<HTMLInputElement>,
    @Optional() private readonly control: NgControl
  ) {}


  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numericValue = input.value.replace(/\D/g, '');
    this.updateValue(numericValue);
  }

  private updateValue(value: string): void {
    if (this.control?.control) {
      this.control.control.setValue(value, { emitEvent: false });
    } else {
      this.el.nativeElement.value = value;
    }
  }
}
