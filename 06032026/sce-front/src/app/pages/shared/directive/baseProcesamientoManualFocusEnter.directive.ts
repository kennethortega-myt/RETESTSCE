import { Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive()export abstract class BaseProcesamientoManualFocusEnterDirective{
  @Input() rowIndex!: number;
  @Input() colIndex!: number;

  constructor(protected readonly el: ElementRef) {}

  @HostListener('keydown.enter', ['$event']) onKeyDownEnter(event: KeyboardEvent) {
    this.moveToNextInput(event);
  }

  @HostListener('keydown.tab', ['$event']) onKeyDownTab(event: KeyboardEvent) {
    this.moveToNextInput(event);
  }

  private moveToNextInput(event: KeyboardEvent) {
    event.preventDefault();
    const currentInput = this.el.nativeElement as HTMLInputElement;

    const nextInput = this.getNextInput(currentInput);

    if (nextInput) {
      nextInput.focus();
    }
  }

  protected abstract getNextInput(currentInput: HTMLInputElement): HTMLInputElement | undefined;
}
