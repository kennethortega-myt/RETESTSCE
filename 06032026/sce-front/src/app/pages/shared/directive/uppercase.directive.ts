import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: '[sceUppercase]',
})
export class UppercaseDirective {
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter();
  value: any;

  constructor(public element: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const initalValue = this.element.nativeElement.value;
    let pos = this.element.nativeElement.selectionStart;
    this.value = initalValue.toUpperCase();
    this.element.nativeElement.value = this.value;
    this.element.nativeElement.selectionStart = pos;
    this.element.nativeElement.selectionEnd = pos;
    if (initalValue !== this.element.nativeElement.value) {
      this.ngModelChange.emit(this.element.nativeElement.value);
      event.stopPropagation();
    }
  }
}
