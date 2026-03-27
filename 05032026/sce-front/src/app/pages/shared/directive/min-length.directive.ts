import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validators} from "@angular/forms";
import {Directive, Input} from "@angular/core";

@Directive({
  selector: '[appMinLength]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: MinLengthDirective,
    multi: true
  }]
})
export class MinLengthDirective implements Validators{
  @Input('appMinLength') minLength: number;

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value.length >= this.minLength) {
      return null; // La validación pasa
    } else {
      return { minLength: true }; // La validación falla
    }
  }
}
