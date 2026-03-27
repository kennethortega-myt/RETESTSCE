import { Directive, ElementRef, HostListener, Optional, Self } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: '[sceNoEspacioInicioReact]',
})
export class NoEspacioInicioReactDirective {
  constructor(
    private readonly el: ElementRef,
    @Self() @Optional() private readonly ngControl: NgControl
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;
    let value = input.value;

    // Eliminar espacios al inicio
    if (value?.startsWith(' ')) {
      value = value.trimStart();

      // Actualizar el input
      input.value = value;

      // Actualizar el FormControl si existe
      if (this.ngControl?.control) {
        this.ngControl.control.setValue(value, { emitEvent: false });
      }
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text') || '';
    const cleanedText = pastedText.trimStart();

    const input = this.el.nativeElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentValue = input.value;

    // Insertar texto limpio en la posición del cursor
    const newValue = currentValue.substring(0, start) + cleanedText + currentValue.substring(end);

    input.value = newValue;

    // Actualizar el FormControl
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(newValue);
    }

    // Restaurar posición del cursor
    const newCursorPosition = start + cleanedText.length;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
  }

  @HostListener('blur')
  onBlur(): void {
    const input = this.el.nativeElement;
    let value = input.value;

    // Trim al perder el foco (elimina espacios al inicio y al final)
    if (value && value.trim() !== value) {
      value = value.trim();
      input.value = value;

      if (this.ngControl?.control) {
        this.ngControl.control.setValue(value);
      }
    }
  }
}
