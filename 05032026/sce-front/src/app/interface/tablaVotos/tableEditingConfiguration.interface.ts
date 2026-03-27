export interface ITableEditingConfiguration {
  maxLength: number;
  allowHash: boolean;
  allowNumbers: boolean;
  validationPattern?: RegExp;
  defaultValue?: string;
}
