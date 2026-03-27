import {FormGroup} from '@angular/forms';
import {InputIndices} from './inputIndices.interface';
import {ChangeDetectorRef} from '@angular/core';

export interface InputBehaviorConfig {
  formGroupTotal: FormGroup;
  formGroupPref: FormGroup;
  getControlName: (rowIndex: number, colIndex?: number) => string;
  onVotoChange: (indices: InputIndices, value: string) => void;
  cdr?: ChangeDetectorRef;
}
