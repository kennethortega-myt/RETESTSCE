import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive()
export abstract class BaseVeriResolucionFocusFlechaDirective{
  @Input() rowIndex!: number;
  @Input() colIndex!: number;

  constructor(protected el: ElementRef) {}

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent): void {
    const currentInput = this.el.nativeElement as HTMLInputElement;

    const containers = this.getContainers();
    const context = this.identifyContext(currentInput, containers);

    if (!context) return;

    const { rowsTotal, rowsPreferential } = this.getRows(containers);
    let nextInput: HTMLInputElement | undefined;

    switch (event.key) {
      case 'ArrowDown':
        nextInput = this.handleArrowDown(context, rowsTotal, rowsPreferential);
        break;
      case 'ArrowUp':
        nextInput = this.handleArrowUp(context, rowsTotal, rowsPreferential);
        break;
      case 'ArrowRight':
        nextInput = this.handleArrowRight(context, rowsTotal, rowsPreferential);
        break;
      case 'ArrowLeft':
        nextInput = this.handleArrowLeft(context, rowsTotal, rowsPreferential);
        break;
    }

    if (nextInput) {
      nextInput.focus();
      event.preventDefault();
    }
  }

  // ===== Métodos abstractos a implementar en hijos =====

  protected abstract getContainers(): {
    left?: HTMLElement | null;
    right?: HTMLElement | null;
  };

  protected abstract identifyContext(
    input: HTMLElement,
    containers: { left?: HTMLElement | null; right?: HTMLElement | null }
  ): 'left' | 'right' | null;

  protected abstract getRows(containers: {
    left?: HTMLElement | null;
    right?: HTMLElement | null;
  }): {
    rowsTotal: HTMLElement[];
    rowsPreferential: HTMLElement[];
  };

  protected abstract handleArrowDown(
    context: 'left' | 'right',
    rowsTotal: HTMLElement[],
    rowsPreferential: HTMLElement[]
  ): HTMLInputElement | undefined;

  protected abstract handleArrowUp(
    context: 'left' | 'right',
    rowsTotal: HTMLElement[],
    rowsPreferential: HTMLElement[]
  ): HTMLInputElement | undefined;

  protected abstract handleArrowRight(
    context: 'left' | 'right',
    rowsTotal: HTMLElement[],
    rowsPreferential: HTMLElement[]
  ): HTMLInputElement | undefined;

  protected abstract handleArrowLeft(
    context: 'left' | 'right',
    rowsTotal: HTMLElement[],
    rowsPreferential: HTMLElement[]
  ): HTMLInputElement | undefined;
}
