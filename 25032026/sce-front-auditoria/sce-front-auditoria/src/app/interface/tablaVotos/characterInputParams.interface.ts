import {InputIndices} from './inputIndices.interface';
import {ITableEditingContext} from './tableEditingContext.interface';
import {ITableEditingConfiguration} from './tableEditingConfiguration.interface';

export interface ICharacterInputParams {
  event: KeyboardEvent;
  input: HTMLInputElement;
  control: any;
  indices: InputIndices;
  currentVal: string;
  key: string;
  context: ITableEditingContext;
  config: ITableEditingConfiguration;
  componentId: string;
}
