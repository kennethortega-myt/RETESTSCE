import {FormGroup} from '@angular/forms';
import {ChangeDetectorRef} from '@angular/core';

export interface ITableEditingContext {
  formGroup: FormGroup;
  changeDetectorRef: ChangeDetectorRef;
  onValueChange?: (fileId: number, value: string, rowIndex: number, colIndex?: number) => void;
  getFileId?: (rowIndex: number, colIndex?: number) => number | null;
  getControlName?: (fileId: number, rowIndex: number, colIndex?: number) => string;
}
