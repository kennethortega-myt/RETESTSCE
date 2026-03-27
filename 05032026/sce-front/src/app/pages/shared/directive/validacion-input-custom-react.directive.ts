import {Directive, ElementRef, forwardRef, HostListener, Input, OnInit} from "@angular/core";
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from "@angular/forms";

@Directive({
  selector: '[sceValidacionInputCustomReact]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ValidacionInputCustomReactDirective),
      multi: true,
    },
  ],
})
export class ValidacionInputCustomReactDirective implements Validator, OnInit{

  @Input('inputPattern') inputPattern: string = '';

  private validator: ValidatorFn;

  constructor(private readonly el: ElementRef) {}

  ngOnInit(): void {
    this.validator = this.createValidator();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validator(control);
  }

  private createValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.inputPattern) {
        return null; // No aplica validación si no se especifica expresión regular.
      }

      const regex = new RegExp(`^[${this.inputPattern}]*$`);
      const valid = regex.test(control.value ?? '');

      return valid ? null : { invalidInput: true }; // Retorna error si no coincide.
    };
  }

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = this.el.nativeElement;
    const regex = new RegExp(`[^${this.inputPattern}]`, 'g');
    const cleanValue = input.value.replace(regex, '');

    if (input.value !== cleanValue) {
      input.value = cleanValue;
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  }
}
