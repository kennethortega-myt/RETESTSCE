import {Directive, ElementRef, HostListener, OnInit, Optional, Renderer2} from "@angular/core";
import {NgControl} from "@angular/forms";

@Directive({
  selector: '[sceUppercaseFormReact]',
})
export class UppercaseFormReactDirective implements OnInit{
  constructor(
    private readonly renderer: Renderer2,
    private readonly elementRef: ElementRef,
    @Optional() private readonly control: NgControl) {}

  ngOnInit(): void {
    this.transformToUppercase();
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    this.transformToUppercase();
  }

  private transformToUppercase(): void {
    const input = this.elementRef.nativeElement as HTMLInputElement;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    const currentValue = input.value || '';
    const upperValue = currentValue.toUpperCase();

    if (currentValue !== upperValue) {
      this.renderer.setProperty(input, 'value', upperValue);

      if (start !== null && end !== null) {
        input.setSelectionRange(start, end);
      }

      if (this.control?.control) {
        this.control.control.setValue(upperValue, { emitEvent: false });
      }
    }
  }
}
