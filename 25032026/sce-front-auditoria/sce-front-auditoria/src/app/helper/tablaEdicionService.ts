import {Injectable} from '@angular/core';
import {ITableEditingConfiguration} from '../interface/tablaVotos/tableEditingConfiguration.interface';
import {ITableEditingContext} from '../interface/tablaVotos/tableEditingContext.interface';
import {InputIndices} from '../interface/tablaVotos/inputIndices.interface';
import {ICharacterInputParams} from '../interface/tablaVotos/characterInputParams.interface';
import {IBackspaceParams} from '../interface/tablaVotos/backspaceParams.interface';

@Injectable({
  providedIn: 'root'
})
export class TablaEdicionService {
  private readonly editingInputsMap = new Map<string, Map<string, boolean>>();
  private readonly defaultConfig: ITableEditingConfiguration = {
    maxLength: 3,
    allowHash: true,
    allowNumbers: true,
    validationPattern: /^[0-9#]*$/,
    defaultValue: ''
  };

  initializeForComponent(componentId: string): void {
    if (!this.editingInputsMap.has(componentId)) {
      this.editingInputsMap.set(componentId, new Map<string, boolean>());
    }
  }

  handleKeyDown(
    event: KeyboardEvent,
    context: ITableEditingContext,
    componentId: string,
    conVotoPref: boolean,
    config: Partial<ITableEditingConfiguration> = {}
  ): void {
    const input = event.target as HTMLInputElement;
    if (input.readOnly) return;

    const finalConfig = { ...this.defaultConfig, ...config };
    const indices = conVotoPref
      ? this.getIndiceFromInputConPref(input)
      : this.getIndiceFromInputSinPref(input);
    if (!indices) return;

    const controlName = this.getControlName(indices, context, finalConfig);
    if (!controlName) return;

    const control = context.formGroup.get('params')?.get(controlName);
    if (!control) return;

    const key = event.key;
    const currentVal: string = (control.value ?? '').toString();

    if (key === 'Backspace') {
      const backspaceParams: IBackspaceParams = {
        event, input, control, indices, currentVal, context, componentId
      };
      this.handleBackspace(backspaceParams);
      return;
    }

    if (key.length > 1) {
      event.preventDefault();
      return;
    }

    const characterParams: ICharacterInputParams = {
      event, input, control, indices, currentVal, key,
      context, config: finalConfig, componentId
    };
    this.handleCharacterInput(characterParams);
  }

  handleFocus(event: FocusEvent, componentId: string, context: ITableEditingContext, conVotoPref: boolean): void {
    const input = event.target as HTMLInputElement;
    const indices = conVotoPref
      ? this.getIndiceFromInputConPref(input)
      : this.getIndiceFromInputSinPref(input);

    if (indices) {
      this.setEditingMode(componentId, false, indices.rowIndex, indices.colIndex ?? undefined);
      setTimeout(() => input.setSelectionRange(0, 0), 0);
    }
  }

  handleBlur(componentId: string, context: ITableEditingContext): void {
    const editingMap = this.editingInputsMap.get(componentId);
    if (editingMap) {
      editingMap.clear();
      context.changeDetectorRef.detectChanges();
    }
  }

  handleDoubleClick(
    event: MouseEvent,
    componentId: string,
    context: ITableEditingContext,
    conVotoPref: boolean,
    shouldAllowEdit?: (rowIndex: number, colIndex?: number) => boolean
  ): void {
    const input = event.target as HTMLInputElement;
    const indices = conVotoPref
      ? this.getIndiceFromInputConPref(input)
      : this.getIndiceFromInputSinPref(input);

    if (!indices) return;

    if (shouldAllowEdit && !shouldAllowEdit(indices.rowIndex, indices.colIndex ?? undefined)) {
      return;
    }

    this.setEditingMode(componentId, true, indices.rowIndex, indices.colIndex ?? undefined);
    setTimeout(() => input.select(), 0);
  }

  validateInput(value: string, config: Partial<ITableEditingConfiguration> = {}): string {
    const finalConfig = { ...this.defaultConfig, ...config };

    if (value === '#' || value.toLowerCase() === 'i') {
      return finalConfig.allowHash ? '#' : '';
    }

    if (!finalConfig.allowNumbers) {
      return '';
    }

    const digits = value.replaceAll(/\D/g, '');
    return digits.substring(0, finalConfig.maxLength);
  }

  isEditingMode(componentId: string, rowIndex: number, colIndex?: number): boolean {
    const editingMap = this.editingInputsMap.get(componentId);
    if (!editingMap) return false;

    const key = colIndex === undefined ? `${rowIndex}` : `${rowIndex}-${colIndex}`;
    return editingMap.get(key) ?? false;
  }

  setEditingMode(componentId: string, isEditing: boolean, rowIndex: number, colIndex?: number): void {
    const editingMap = this.editingInputsMap.get(componentId);
    if (!editingMap) return;

    const key = colIndex === undefined ? `${rowIndex}` : `${rowIndex}-${colIndex}`;
    editingMap.set(key, isEditing);
  }

  clearEditingState(componentId: string): void {
    this.editingInputsMap.get(componentId)?.clear();
  }

  destroyComponent(componentId: string): void {
    this.editingInputsMap.delete(componentId);
  }

  private getIndiceFromInputSinPref(input: HTMLInputElement): InputIndices | null {
    const rowIndex = this.getIndexFromIdSinPref(input.id, 'i');
    if (rowIndex === -1) return null;
    return { rowIndex };
  }

  private getIndiceFromInputConPref(input: HTMLInputElement): InputIndices | null {
    const rowIndex = this.getIndexFromIdConPref(input.id, 'i');
    const colIndex = this.getIndexFromIdSinPref(input.id, 'j');
    if (rowIndex === -1 || colIndex === -1) return null;
    return { rowIndex, colIndex };
  }

  private getIndexFromIdSinPref(id: string, indexType: 'i' | 'j'): number {
    const match = /mat-input-total-(\d+)/.exec(id);
    return match ? Number(match[1]) : -1;
  }

  private getIndexFromIdConPref(id: string, indexType: 'i' | 'j'): number {
    const match = /mat-input-pref-(\d+)-(\d+)/.exec(id);
    if (!match) return -1;

    const groupIndex = indexType === 'i' ? 1 : 2;
    return Number(match[groupIndex]);
  }

  private getControlName(indices: InputIndices, context: ITableEditingContext, config: ITableEditingConfiguration): string {
    const fileId = context.getFileId?.(indices.rowIndex, indices.colIndex ?? undefined);
    if (context.getControlName) {
      return context.getControlName(fileId, indices.rowIndex, indices.colIndex ?? undefined);
    }

    if (fileId) {
      const colIndexPart = indices.colIndex === undefined ? '' : `-${indices.colIndex}`;
      return `${fileId}-${indices.rowIndex}${colIndexPart}`;
    }

    return '';
  }

  private handleBackspace(params: IBackspaceParams): void {
    params.event.preventDefault();

    if (!this.isEditingMode(params.componentId, params.indices.rowIndex, params.indices.colIndex ?? undefined)) {
      this.setEditingMode(params.componentId, true, params.indices.rowIndex, params.indices.colIndex ?? undefined);
    }

    if (this.isCursorInactive(params.input)) {
      this.clearInputValue(params.control, params.input, params.indices, params.context);
      return;
    }

    if (params.currentVal.length > 0) {
      this.handleBackspaceWithContent(params.input, params.control, params.indices, params.currentVal, params.context);
      return;
    }

    setTimeout(() => params.input.setSelectionRange(0, 0));
  }

  private handleCharacterInput(params: ICharacterInputParams): void {
    params.event.preventDefault();

    const char = params.key.toLowerCase() === 'i' ? '#' : params.key;

    if (!this.isEditingMode(params.componentId, params.indices.rowIndex, params.indices.colIndex ?? undefined)) {
      this.setEditingMode(params.componentId, true, params.indices.rowIndex, params.indices.colIndex ?? undefined);
    }

    let updatedVal = params.currentVal;

    if (this.shouldClearValue(params.input, params.currentVal)) {
      params.control.setValue('');
      updatedVal = '';
    }

    if (char === '#' && params.config.allowHash) {
      this.handleHashInput(params.control, params.input, params.indices, updatedVal, params.context);
    } else if (/^\d$/.test(char) && params.config.allowNumbers) {
      this.handleNumberInput(params.control, params.input, params.indices, updatedVal, char, params.context, params.config);
    }
  }

  private isCursorInactive(input: HTMLInputElement): boolean {
    return input.selectionStart === 0 && input.selectionEnd === 0;
  }

  private shouldClearValue(input: HTMLInputElement, currentVal: string): boolean {
    return currentVal.length > 0 && input.selectionStart === 0 && input.selectionEnd === 0;
  }

  private clearInputValue(control: any, input: HTMLInputElement, indices: InputIndices, context: ITableEditingContext): void {
    control.setValue('');
    const fileId = context.getFileId?.(indices.rowIndex, indices.colIndex ?? undefined);
    if (fileId && context.onValueChange) {
      context.onValueChange(fileId, '', indices.rowIndex, indices.colIndex ?? undefined);
    }
    setTimeout(() => input.setSelectionRange(0, 0));
  }

  private handleBackspaceWithContent(input: HTMLInputElement, control: any, indices: InputIndices, currentVal: string, context: ITableEditingContext): void {
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    let updated = '';
    let newCaretPosition = start;

    if (start === end && start > 0) {
      updated = currentVal.slice(0, start - 1) + currentVal.slice(end);
      newCaretPosition = start - 1;
    } else {
      updated = currentVal.slice(0, start) + currentVal.slice(end);
    }

    control.setValue(updated);
    const fileId = context.getFileId?.(indices.rowIndex, indices.colIndex ?? undefined);
    if (fileId && context.onValueChange) {
      context.onValueChange(fileId, updated, indices.rowIndex, indices.colIndex ?? undefined);
    }
    setTimeout(() => input.setSelectionRange(newCaretPosition, newCaretPosition));
  }

  private handleHashInput(control: any, input: HTMLInputElement, indices: InputIndices, currentVal: string, context: ITableEditingContext): void {
    if (currentVal === '#' || (/^\d+$/.test(currentVal) && currentVal.length > 0)) return;

    control.setValue('#');
    const fileId = context.getFileId?.(indices.rowIndex, indices.colIndex ?? undefined);
    if (fileId && context.onValueChange) {
      context.onValueChange(fileId, '#', indices.rowIndex, indices.colIndex ?? undefined);
    }
    setTimeout(() => input.setSelectionRange(1, 1));
  }

  private handleNumberInput(control: any, input: HTMLInputElement, indices: InputIndices, currentVal: string, char: string, context: ITableEditingContext, config: ITableEditingConfiguration): void {
    if (currentVal.length >= config.maxLength || currentVal === '#' || !/^\d*$/.test(currentVal)) return;

    const caretPos = input.selectionStart ?? currentVal.length;
    const newValue = currentVal.slice(0, caretPos) + char + currentVal.slice(caretPos);

    control.setValue(newValue);
    const fileId = context.getFileId?.(indices.rowIndex, indices.colIndex ?? undefined);
    if (fileId && context.onValueChange) {
      context.onValueChange(fileId, newValue, indices.rowIndex, indices.colIndex ?? undefined);
    }
    setTimeout(() => input.setSelectionRange(caretPos + 1, caretPos + 1));
  }
}
