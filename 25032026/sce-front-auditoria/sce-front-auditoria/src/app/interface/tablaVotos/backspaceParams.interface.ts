import {ITableEditingContext} from './tableEditingContext.interface';
import {InputIndices} from './inputIndices.interface';

export interface IBackspaceParams {
  event: KeyboardEvent;
  input: HTMLInputElement;
  control: any;
  indices: InputIndices;
  currentVal: string;
  context: ITableEditingContext;
  componentId: string;
}
