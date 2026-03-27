import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive()
export abstract class BaseActasCorregirFocusFlechaDirective{
  @Input() rowIndex!: number;
  @Input() colIndex!: number;

  constructor(protected readonly el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const currentInput = this.el.nativeElement as HTMLInputElement;
    const context = this.getContext();

    const container1Rows = this.getRows(context.container1, context.selector1);
    const container2Rows = context.container2 && context.selector2
      ? this.getRows(context.container2, context.selector2)
      : [];

    let nextInput: HTMLInputElement | undefined;

    if (context.container1?.contains(currentInput)) {
      nextInput = this.handleContainer1(event, container1Rows, container2Rows, currentInput);
    } else if (context.container2?.contains(currentInput)) {
      nextInput = this.handleContainer2(event, container1Rows, container2Rows, currentInput);
    }

    if (nextInput) {
      nextInput.focus();
      event.preventDefault();
    }
  }

  protected getRows(container: HTMLElement | null, selector: string): HTMLElement[] {
    return container ? Array.from(container.querySelectorAll(selector)) : [];
  }

  // Métodos abstractos para implementar en subclases
  protected abstract getContext(): {
    container1: HTMLElement | null;
    selector1: string;
    container2?: HTMLElement | null;
    selector2?: string;
  };

  protected abstract handleContainer1(
    event: KeyboardEvent,
    rows1: HTMLElement[],
    rows2: HTMLElement[],
    currentInput: HTMLInputElement
  ): HTMLInputElement | undefined;

  protected abstract handleContainer2(
    event: KeyboardEvent,
    rows1: HTMLElement[],
    rows2: HTMLElement[],
    currentInput: HTMLInputElement
  ): HTMLInputElement | undefined;
}
