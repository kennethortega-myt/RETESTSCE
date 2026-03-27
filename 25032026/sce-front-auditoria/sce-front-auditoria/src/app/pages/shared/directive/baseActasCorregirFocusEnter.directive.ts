import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive()
export abstract class BaseActasCorregirFocusEnterDirective{
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

    const containerInfo = this.getContainers();
    const rows1 = this.getRows(containerInfo.container1, containerInfo.selector1);
    const rows2 = (containerInfo.container2 && containerInfo.selector2)
      ? this.getRows(containerInfo.container2, containerInfo.selector2)
      : [];

    let nextInput: HTMLInputElement | undefined;

    if (containerInfo.container1?.contains(currentInput)) {
      nextInput = this.handleContainer1(currentInput, rows1, rows2);
    } else if (containerInfo.container2?.contains(currentInput)) {
      nextInput = this.handleContainer2(currentInput, rows1);
    }

    if (nextInput) {
      nextInput.focus();
    }
  }

  private getRows(container: HTMLElement | null, selector: string): HTMLElement[] {
    if (!container) return [];
    return Array.from(container.querySelectorAll(selector));
  }

  protected isReadOnlyAndEmpty(input: HTMLInputElement): boolean {
    return input.readOnly && input.value === '';
  }

  // Métodos a implementar por subclases
  protected abstract getContainers(): {
    container1: HTMLElement | null,
    selector1: string,
    container2?: HTMLElement | null,
    selector2?: string
  };

  protected abstract handleContainer1(
    currentInput: HTMLInputElement,
    rows1: HTMLElement[],
    rows2: HTMLElement[]
  ): HTMLInputElement | undefined;

  protected abstract handleContainer2(
    currentInput: HTMLInputElement,
    rows1: HTMLElement[]
  ): HTMLInputElement | undefined;
}
