import { Directive, ElementRef, Input } from '@angular/core';

@Directive()
export abstract class BaseFocusNextDirective {
  @Input() rowIndex!: number;
  @Input() colIndex?: number; // opcional por si no aplica en algunas

  constructor(protected el: ElementRef) {}

  protected getCurrentInput(): HTMLInputElement {
    return this.el.nativeElement as HTMLInputElement;
  }

  protected getRows(containerId: string, selector: string): HTMLElement[] {
    const container = document.getElementById(containerId);
    return container ? Array.from(container.querySelectorAll(selector)) : [];
  }

  protected findEditableInputInRow(rows: HTMLElement[], rowIndex: number): HTMLInputElement | undefined {
    if (rowIndex < rows.length) {
      const row = rows[rowIndex];
      const inputs = Array.from(row.querySelectorAll('input'));
      return inputs.find(input => !input.readOnly);
    }
    return undefined;
  }

  protected findNextEditableInputInSameRow(currentInput: HTMLInputElement): HTMLInputElement | undefined {
    const currentRow = currentInput.closest('.container-1.p') || currentInput.closest('.item2') || currentInput.closest('.t-c');
    if (!currentRow) return undefined;

    const inputs = Array.from(currentRow.querySelectorAll('input'));
    const currentIndex = inputs.indexOf(currentInput);

    return inputs.slice(currentIndex + 1).find(input => !input.readOnly);
  }

  protected abstract moveToNextInput(key: string): void;
}
