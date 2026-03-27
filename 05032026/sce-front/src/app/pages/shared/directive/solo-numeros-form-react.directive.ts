import {Directive, ElementRef, HostListener, Optional} from "@angular/core";
import {NgControl} from "@angular/forms";

@Directive({
  selector: '[sceSoloNumerosFormReact]'
})
export class SoloNumerosFormReactDirective {
  constructor(private readonly el: ElementRef, @Optional() private readonly control: NgControl) {}

  // Este evento se dispara en cada pulsación de tecla
  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let filteredValue = input.value.replace(/\D/g, '');

    // Actualiza el valor en el control del formulario si cambió
    if (input.value !== filteredValue) {
      if (this.control?.control) {
        this.control.control.setValue(filteredValue);
      } else {
        // fallback: actualiza el valor del input directamente
        input.value = filteredValue;
      }
    }
  }

  // Este evento se dispara cuando se pega algo en el input
  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text');
    if (pastedText && /\D/g.test(pastedText)) {
      event.preventDefault();
    }
  }

  // Este evento se dispara cuando el usuario intenta escribir caracteres no numéricos
  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    // Permite teclas especiales como Backspace, Delete, Tab, etc.
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'Enter'
    ];

    // Si la tecla no es un número y no está en la lista de teclas permitidas, se previene el evento
    if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
}
