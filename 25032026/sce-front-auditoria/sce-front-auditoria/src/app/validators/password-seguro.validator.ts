import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const UPPER_CASE_REGEX = /[A-Z]/;
export const LOWER_CASE_REGEX = /[a-z]/;
export const NUMERIC_REGEX = /\d/;
export const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+={}:;"'<>,.?/|~`\-]/;

export function passwordSeguroValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;

    if (!value || typeof value !== 'string') {
      return null;
    }

    const hasUpperCase: boolean = UPPER_CASE_REGEX.test(value);
    const hasLowerCase: boolean = LOWER_CASE_REGEX.test(value);
    const hasNumeric: boolean = NUMERIC_REGEX.test(value);
    const hasSpecialChar: boolean = SPECIAL_CHAR_REGEX.test(value);

    const passwordValid: boolean =
      hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

    return !passwordValid ? { passwordStrength: true } : null;
  };
}
