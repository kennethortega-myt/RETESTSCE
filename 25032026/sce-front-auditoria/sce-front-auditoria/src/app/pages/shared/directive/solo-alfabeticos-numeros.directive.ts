import {Directive, HostListener} from "@angular/core";
import {NgControl} from "@angular/forms";

@Directive({
  selector: '[sceSoloAlfabeticosNumeros]'
})
export class SoloAlfabeticosNumerosDirective{
  constructor(private readonly ngControl: NgControl) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const initialValue = input.value;

    // Remover cualquier carácter que no sea letra o número
    input.value = initialValue.replace(/[^a-zA-Z0-9]*/g, '');

    if (initialValue !== input.value) {
      // Actualizar el valor del control del formulario
      this.ngControl.control?.setValue(input.value);
    }
  }
}
