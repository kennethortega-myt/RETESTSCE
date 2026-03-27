import {Directive, ElementRef, HostListener, Input} from "@angular/core";

@Directive({
  selector: '[sceValidacionInputCustom]'
})
export class ValidacionInputCustomDirective{
  @Input("sceValidacionInputCustom") sceValidacionInputCustom: string;

  constructor(private readonly el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = this.el.nativeElement;
    const regex = new RegExp(`[^${this.sceValidacionInputCustom}]`, 'g');
    const cleanValue = input.value.replace(regex, '');

    if (input.value !== cleanValue) {
      input.value = cleanValue;
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  }
}
