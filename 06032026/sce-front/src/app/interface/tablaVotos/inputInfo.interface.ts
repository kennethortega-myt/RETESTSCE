import {InputIndices} from './inputIndices.interface';
import {FormGroup} from '@angular/forms';

export interface InputInfo {
  indices: InputIndices;
  controlName: string;
  formGroup: FormGroup;
}
