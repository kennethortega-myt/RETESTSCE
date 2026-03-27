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
