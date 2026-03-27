import { Directive, ElementRef, HostListener, Optional, Self } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: '[sceSoloAlfabeticosReact]'
})
export class SoloAlfabeticosFormReactDirective {
  // Expresión regular que permite letras con acentos, ñ y espacios
  private readonly regex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]*$/;

  constructor(
    private readonly el: ElementRef,
    @Self() @Optional() private readonly ngControl: NgControl
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;
    const value = input.value;

    if (!this.regex.test(value)) {
      // Eliminar caracteres no permitidos
      const cleanValue = value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, '');
      input.value = cleanValue;

      // Actualizar el FormControl si existe
      if (this.ngControl?.control) {
        this.ngControl.control.setValue(cleanValue, { emitEvent: false });
      }
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';

    // Limpiar el texto pegado, dejando solo caracteres alfabéticos
    const cleanedText = pastedText.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, '').trimStart();

    const input = this.el.nativeElement;
    const maxLength = input.maxLength > 0 ? input.maxLength : Infinity;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentValue = input.value;

    // Insertar texto limpio en la posición del cursor
    const newValue = (currentValue.substring(0, start) + cleanedText + currentValue.substring(end)).substring(0,maxLength);
    input.value = newValue;

    // Actualizar el FormControl
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(newValue);
    }

    // Restaurar posición del cursor
    const newCursorPosition = Math.min(start + cleanedText.length, maxLength);
    input.setSelectionRange(newCursorPosition, newCursorPosition);
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    const char = event.key;

    // Permitir teclas de control (backspace, delete, tab, etc.)
    if (event.ctrlKey || event.metaKey || char.length !== 1) {
      return;
    }

    // Validar si el carácter es alfabético o espacio
    if (!this.regex.test(char)) {
      event.preventDefault();
    }
  }

}
