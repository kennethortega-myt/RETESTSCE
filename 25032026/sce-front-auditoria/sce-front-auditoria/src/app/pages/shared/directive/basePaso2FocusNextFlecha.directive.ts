export abstract class BasePaso2FocusNextFlechaDirective{
  protected getRows(container: HTMLElement, selector: string): HTMLElement[] {
    return Array.from(container.querySelectorAll(selector));
  }

  protected getInputsInRow(row: Element): HTMLInputElement[] {
    return Array.from(row.querySelectorAll('input'));
  }

  protected getInputByIndex(row: HTMLElement, index: number): HTMLInputElement | undefined {
    const inputs = this.getInputsInRow(row);
    return inputs.length > index ? inputs[index] : undefined;
  }

  protected getNextRowInput(rows: HTMLElement[], rowIndex: number, inputIndex: number = 0): HTMLInputElement | undefined {
    if (rowIndex >= 0 && rowIndex < rows.length) {
      return this.getInputByIndex(rows[rowIndex], inputIndex);
    }
    return undefined;
  }

  protected getPreviousRowLastInput(rows: HTMLElement[], rowIndex: number): HTMLInputElement | undefined {
    if (rowIndex >= 0 && rowIndex < rows.length) {
      const inputs = this.getInputsInRow(rows[rowIndex]);
      return inputs.at(-1);
    }
    return undefined;
  }

  protected getNextOrMoveToNextRow(
    inputs: HTMLInputElement[],
    currentIndex: number,
    rows: HTMLElement[],
    nextRowIndex: number
  ): HTMLInputElement | undefined {
    return currentIndex < inputs.length - 1
      ? inputs[currentIndex + 1]
      : this.getNextRowInput(rows, nextRowIndex);
  }

  protected getPreviousOrMoveToOtherTable(
    inputs: HTMLInputElement[],
    currentIndex: number,
    rows: HTMLElement[],
    rowIndex: number
  ): HTMLInputElement | undefined {
    return currentIndex > 0
      ? inputs[currentIndex - 1]
      : this.getPreviousRowLastInput(rows, rowIndex - 1);
  }
}
