import {ChangeDetectorRef, Injectable} from '@angular/core';
import {InputBehaviorConfig} from '../interface/tablaVotos/inputBehaviorConfig.interface';
import {InputInfo} from '../interface/tablaVotos/inputInfo.interface';
import {InputIndices} from '../interface/tablaVotos/inputIndices.interface';
import {FormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class InputBehaviorService {

  private readonly editingInputs = new Map<string, boolean>();
  private readonly editingInputsPref = new Map<string, boolean>();

  handleKeyDown(event: KeyboardEvent, config: InputBehaviorConfig): void {
    const input = event.target as HTMLInputElement;
    if (input.readOnly) return;

    const isPreferencial = input.id.includes('pref');
    const inputInfo = this.getInputInfo(input, isPreferencial, config);
    if (!inputInfo) return;

    const { indices, controlName, formGroup } = inputInfo;
    const control = formGroup.get("params")?.get(controlName);
    if (!control) return;

    const key = event.key;
    const currentVal: string = (control.value ?? '').toString();

    if (key === 'Backspace') {
      this.handleBackspace(event, input, control, indices, currentVal, config);
      return;
    }

    if (key.length > 1) {
      event.preventDefault();
      return;
    }

    this.handleCharacterInput(event, input, control, indices, currentVal, key, config);
  }

  /**
   *  Verificar modo edición
   */
  isEditingMode(rowIndex: number, colIndex?: number): boolean {
    const key = colIndex === undefined ? `${rowIndex}` : `${rowIndex}-${colIndex}`;
    const map = colIndex === undefined ? this.editingInputs : this.editingInputsPref;
    return map.get(key) || false;
  }

  /**
   * Establecer modo edición
   */
  setEditingMode(isEditing: boolean, rowIndex: number, colIndex?: number, cdr?: ChangeDetectorRef): void {
    const key = colIndex === undefined ? `${rowIndex}`: `${rowIndex}-${colIndex}`;
    const map = colIndex === undefined ? this.editingInputs: this.editingInputsPref;
    map.set(key, isEditing);
    cdr?.detectChanges();
  }

  /**
   * Limpiar al perder foco
   */
  handleBlur(cdr?: ChangeDetectorRef): void {
    this.editingInputs.clear();
    this.editingInputsPref.clear();
    cdr?.detectChanges();
  }

  private handleCharacterInput(
    event: KeyboardEvent,
    input: HTMLInputElement,
    control: any,
    indices: InputIndices,
    currentVal: string,
    key: string,
    config: InputBehaviorConfig
  ): void {
    event.preventDefault();

    const char = key.toLowerCase() === 'i' ? '#' : key;

    const wasNotEditing = !this.isEditingMode(indices.rowIndex, indices.colIndex);

    // Sin componentId en la llamada
    if (wasNotEditing) {
      this.setEditingMode(true, indices.rowIndex, indices.colIndex, config.cdr);
    }


    if (this.shouldClearValue(input, currentVal,wasNotEditing)) {
      control.setValue('');
      currentVal = '';
    }

    if (char === '#') {
      this.handleHashInput(control, input, indices, currentVal, config);
    } else if (/^\d$/.test(char)) {
      this.handleNumberInput(control, input, indices, currentVal, char, config);
    }
  }

  private handleNumberInput(
    control: any,
    input: HTMLInputElement,
    indices: InputIndices,
    currentVal: string,
    char: string,
    config: InputBehaviorConfig
  ): void {
    const start = input.selectionStart ?? currentVal.length;
    const end = input.selectionEnd ?? currentVal.length;

    // Si hay texto seleccionado, reemplazarlo
    if (start !== end) {
      const newValue = currentVal.slice(0, start) + char + currentVal.slice(end);

      if (newValue.length > 3) return;

      control.setValue(newValue);
      config.onVotoChange(indices, newValue);
      setTimeout(() => input.setSelectionRange(start + 1, start + 1));
      return;
    }

    // Si NO hay selección, insertar en la posición del cursor
    if (currentVal.length >= 3) return;

    const caretPos = start;
    const newValue = currentVal.slice(0, caretPos) + char + currentVal.slice(caretPos);

    control.setValue(newValue);
    config.onVotoChange(indices, newValue);
    setTimeout(() => input.setSelectionRange(caretPos + 1, caretPos + 1));
  }

  private handleHashInput(
    control: any,
    input: HTMLInputElement,
    indices: InputIndices,
    currentVal: string,
    config: InputBehaviorConfig
  ): void {
    if (currentVal === '#' || (currentVal.length > 0 && /^\d+$/.test(currentVal))) {
      return;
    }

    if (currentVal === '') {
      control.setValue('#');
      config.onVotoChange(indices, '#');
      setTimeout(() => input.setSelectionRange(1, 1));
    }
  }

  private handleBackspace(
    event: KeyboardEvent,
    input: HTMLInputElement,
    control: any,
    indices: InputIndices,
    currentVal: string,
    config: InputBehaviorConfig
  ): void {
    event.preventDefault();

    if (!this.isEditingMode(indices.rowIndex, indices.colIndex)) {
      this.setEditingMode(true, indices.rowIndex, indices.colIndex, config.cdr);
    }

    if (this.isCursorInactive(input)) {
      this.clearInputValue(control, input, indices, config);
      return;
    }

    if (currentVal.length > 0) {
      this.handleBackspaceWithContent(input, control, indices, currentVal, config);
      return;
    }

    setTimeout(() => input.setSelectionRange(0, 0));
  }

  private handleBackspaceWithContent(
    input: HTMLInputElement,
    control: any,
    indices: InputIndices,
    currentVal: string,
    config: InputBehaviorConfig
  ): void {
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    let updated = '';
    let newCaretPosition = start;

    if (start === end && start > 0) {
      updated = currentVal.slice(0, start - 1) + currentVal.slice(end);
      newCaretPosition = start - 1;
    } else {
      updated = currentVal.slice(0, start) + currentVal.slice(end);
      newCaretPosition = start;
    }

    control.setValue(updated);
    config.onVotoChange(indices, updated);
    setTimeout(() => input.setSelectionRange(newCaretPosition, newCaretPosition));
  }

  private clearInputValue(
    control: any,
    input: HTMLInputElement,
    indices: InputIndices,
    config: InputBehaviorConfig
  ): void {
    control.setValue('');
    config.onVotoChange(indices, '');
    setTimeout(() => input.setSelectionRange(0, 0));
  }

  // Métodos de utilidad (iguales que antes)
  private isCursorInactive(input: HTMLInputElement): boolean {
    return input.selectionStart === 0 && input.selectionEnd === 0;
  }

  private shouldClearValue(input: HTMLInputElement, currentVal: string, wasNotEditing: boolean): boolean {
    return currentVal.length > 0 &&
      input.selectionStart !== input.selectionEnd || wasNotEditing;

  }

  private getInputInfo(
    input: HTMLInputElement,
    isPreferencial: boolean,
    config: InputBehaviorConfig
  ): InputInfo | null {
    let indices: InputIndices | null = null;
    let controlName: string | null = null;
    let formGroup: FormGroup;

    if (isPreferencial) {
      indices = this.getIndicesFromInputPref(input);
      if (indices?.colIndex === undefined) return null;

      controlName = config.getControlName(indices.rowIndex, indices.colIndex);
      formGroup = config.formGroupPref;
    } else {
      indices = this.getIndicesFromInputTotal(input);
      if (!indices) return null;

      controlName = config.getControlName(indices.rowIndex);
      formGroup = config.formGroupTotal;
    }

    if (!controlName) return null;
    return { indices, controlName, formGroup };
  }

  private getIndicesFromInputTotal(input: HTMLInputElement): InputIndices | null {
    const regex = /mat-input-total-(\d+)/;
    const match = regex.exec(input.id);
    if (match) {
      return { rowIndex: Number.parseInt(match[1], 10) };
    }
    return null;
  }

  private getIndicesFromInputPref(input: HTMLInputElement): InputIndices | null {
    const regex = /mat-input-pref-(\d+)-(\d+)/;
    const match = regex.exec(input.id);
    if (match) {
      return {
        rowIndex: Number.parseInt(match[1], 10),
        colIndex: Number.parseInt(match[2], 10)
      };
    }
    return null;
  }
}
